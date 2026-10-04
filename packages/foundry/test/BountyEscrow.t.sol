// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {BountyEscrow} from "../contracts/BountyEscrow.sol";
import {MockToken} from "./mocks/MockToken.sol";

contract BountyEscrowTest is Test {
    BountyEscrow internal escrow;
    MockToken internal usdc;

    address internal owner = makeAddr("owner");
    address internal treasury = makeAddr("treasury");
    address internal arbiter = makeAddr("arbiter");
    address internal analyst = makeAddr("analyst");
    address internal analyst2 = makeAddr("analyst2");
    uint256 internal sponsorKey = 0xA11CE;
    address internal sponsor = vm.addr(sponsorKey);

    uint256 internal constant REWARD = 1_000e6;
    uint16 internal constant FEE_BPS = 500;
    bytes32 internal constant REF = keccak256("pyth-usage-on-evm-chains");

    function setUp() public {
        escrow = new BountyEscrow(owner, treasury, arbiter, FEE_BPS);
        usdc = new MockToken();
        vm.prank(owner);
        escrow.setTokenAllowed(address(usdc), true);

        usdc.mint(sponsor, 10_000e6);
        vm.prank(sponsor);
        usdc.approve(address(escrow), type(uint256).max);
    }

    function _create() internal returns (uint256 id) {
        vm.prank(sponsor);
        id = escrow.createBounty(usdc, REWARD, uint64(block.timestamp + 7 days), REF);
    }

    function _one(address who, uint256 amount) internal pure returns (address[] memory w, uint256[] memory a) {
        w = new address[](1);
        a = new uint256[](1);
        w[0] = who;
        a[0] = amount;
    }

    // =====================================
    // ⬢ Create
    // =====================================

    function test_CreateLocksTheReward() public {
        vm.expectEmit(true, true, true, true);
        emit BountyEscrow.BountyCreated(1, sponsor, address(usdc), REWARD, uint64(block.timestamp + 7 days), FEE_BPS, REF);
        uint256 id = _create();

        assertEq(id, 1);
        assertEq(usdc.balanceOf(address(escrow)), REWARD);
        BountyEscrow.Bounty memory bounty = escrow.getBounty(id);
        assertEq(bounty.sponsor, sponsor);
        assertEq(bounty.amount, REWARD);
        assertEq(bounty.feeBps, FEE_BPS);
        assertEq(escrow.remaining(id), REWARD);
    }

    function test_CreateRejectsTokensNotAllowed() public {
        MockToken other = new MockToken();
        vm.prank(sponsor);
        vm.expectRevert(BountyEscrow.TokenNotAllowed.selector);
        escrow.createBounty(other, REWARD, uint64(block.timestamp + 1 days), REF);
    }

    function test_CreateRejectsZeroAmountAndPastDeadline() public {
        vm.startPrank(sponsor);
        vm.expectRevert(BountyEscrow.InvalidAmount.selector);
        escrow.createBounty(usdc, 0, uint64(block.timestamp + 1 days), REF);
        vm.expectRevert(BountyEscrow.InvalidDeadline.selector);
        escrow.createBounty(usdc, REWARD, uint64(block.timestamp), REF);
        vm.stopPrank();
    }

    function test_CreateWithPermitNeedsNoApproval() public {
        address payer = vm.addr(0xB0B);
        usdc.mint(payer, REWARD);
        uint256 permitDeadline = block.timestamp + 1 hours;
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                usdc.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                        payer,
                        address(escrow),
                        REWARD,
                        usdc.nonces(payer),
                        permitDeadline
                    )
                )
            )
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xB0B, digest);

        vm.prank(payer);
        uint256 id = escrow.createBountyWithPermit(usdc, REWARD, uint64(block.timestamp + 1 days), REF, permitDeadline, v, r, s);

        assertEq(escrow.getBounty(id).sponsor, payer);
        assertEq(usdc.balanceOf(address(escrow)), REWARD);
    }

    // =====================================
    // ⬢ Award
    // =====================================

    function test_SponsorAwardsWinnerLessFee() public {
        uint256 id = _create();
        (address[] memory w, uint256[] memory a) = _one(analyst, REWARD);

        vm.prank(sponsor);
        escrow.award(id, w, a);

        assertEq(usdc.balanceOf(analyst), 950e6);
        assertEq(usdc.balanceOf(treasury), 50e6);
        assertEq(usdc.balanceOf(address(escrow)), 0);
        assertTrue(escrow.getBounty(id).closed);
    }

    function test_AwardSplitsAcrossWinnersAndLeavesTheRest() public {
        uint256 id = _create();
        address[] memory w = new address[](2);
        uint256[] memory a = new uint256[](2);
        (w[0], w[1]) = (analyst, analyst2);
        (a[0], a[1]) = (500e6, 200e6);

        vm.prank(sponsor);
        escrow.award(id, w, a);

        assertEq(usdc.balanceOf(analyst), 475e6);
        assertEq(usdc.balanceOf(analyst2), 190e6);
        assertEq(usdc.balanceOf(treasury), 35e6);
        assertEq(escrow.remaining(id), 300e6);
        assertFalse(escrow.getBounty(id).closed);
    }

    function test_AwardCannotExceedTheReward() public {
        uint256 id = _create();
        (address[] memory w, uint256[] memory a) = _one(analyst, REWARD + 1);
        vm.prank(sponsor);
        vm.expectRevert(BountyEscrow.ExceedsRemaining.selector);
        escrow.award(id, w, a);
    }

    function test_StrangersCannotAward() public {
        uint256 id = _create();
        (address[] memory w, uint256[] memory a) = _one(analyst, REWARD);
        vm.prank(analyst);
        vm.expectRevert(BountyEscrow.NotAuthorized.selector);
        escrow.award(id, w, a);
    }

    function test_ArbiterAwardsOnlyAfterTheDeadline() public {
        uint256 id = _create();
        (address[] memory w, uint256[] memory a) = _one(analyst, REWARD);

        vm.prank(arbiter);
        vm.expectRevert(BountyEscrow.TooEarly.selector);
        escrow.award(id, w, a);

        vm.warp(block.timestamp + 7 days + 1);
        vm.prank(arbiter);
        escrow.award(id, w, a);
        assertEq(usdc.balanceOf(analyst), 950e6);
    }

    function test_FeeIsFixedWhenTheBountyIsCreated() public {
        uint256 id = _create();
        vm.prank(owner);
        escrow.setFee(1_000);

        (address[] memory w, uint256[] memory a) = _one(analyst, REWARD);
        vm.prank(sponsor);
        escrow.award(id, w, a);
        assertEq(usdc.balanceOf(treasury), 50e6);
    }

    // =====================================
    // ⬢ Refund
    // =====================================

    function test_SponsorRefundsOnlyAfterJudging() public {
        uint256 id = _create();

        vm.warp(block.timestamp + 7 days + 1);
        vm.prank(sponsor);
        vm.expectRevert(BountyEscrow.TooEarly.selector);
        escrow.refund(id);

        vm.warp(block.timestamp + 14 days);
        vm.prank(sponsor);
        escrow.refund(id);
        assertEq(usdc.balanceOf(sponsor), 10_000e6);
        assertTrue(escrow.getBounty(id).closed);
    }

    function test_RefundReturnsOnlyWhatWasNotAwarded() public {
        uint256 id = _create();
        (address[] memory w, uint256[] memory a) = _one(analyst, 600e6);
        vm.prank(sponsor);
        escrow.award(id, w, a);

        vm.prank(arbiter);
        escrow.refund(id);
        assertEq(usdc.balanceOf(sponsor), 10_000e6 - 600e6);
    }

    function test_ArbiterCancelsAnyTimeAndFundsGoToTheSponsor() public {
        uint256 id = _create();
        vm.prank(arbiter);
        escrow.refund(id);
        assertEq(usdc.balanceOf(sponsor), 10_000e6);
        assertEq(usdc.balanceOf(arbiter), 0);
    }

    function test_ClosedBountiesCannotBePaidAgain() public {
        uint256 id = _create();
        vm.prank(arbiter);
        escrow.refund(id);

        (address[] memory w, uint256[] memory a) = _one(analyst, 1);
        vm.prank(sponsor);
        vm.expectRevert(BountyEscrow.BountyClosed.selector);
        escrow.award(id, w, a);

        vm.prank(arbiter);
        vm.expectRevert(BountyEscrow.BountyClosed.selector);
        escrow.refund(id);
    }

    // =====================================
    // ⬢ Owner
    // =====================================

    function test_OnlyOwnerChangesSettings() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, address(this)));
        escrow.setFee(100);

        vm.prank(owner);
        vm.expectRevert(BountyEscrow.FeeTooHigh.selector);
        escrow.setFee(1_001);
    }

    // =====================================
    // ⬢ Edge cases
    // =====================================

    function test_BountiesAreIsolatedFromEachOther() public {
        uint256 first = _create();
        uint256 second = _create();
        (address[] memory w, uint256[] memory a) = _one(analyst, REWARD);
        vm.prank(sponsor);
        escrow.award(first, w, a);

        (w, a) = _one(analyst, 1);
        vm.prank(sponsor);
        vm.expectRevert(BountyEscrow.BountyClosed.selector);
        escrow.award(first, w, a);

        assertEq(escrow.remaining(second), REWARD);
        assertEq(usdc.balanceOf(address(escrow)), REWARD);
    }

    function test_DeadlineBoundaries() public {
        uint256 id = _create();
        uint64 deadline = escrow.getBounty(id).deadline;
        (address[] memory w, uint256[] memory a) = _one(analyst, REWARD);

        vm.warp(deadline);
        vm.prank(arbiter);
        vm.expectRevert(BountyEscrow.TooEarly.selector);
        escrow.award(id, w, a);

        vm.warp(uint256(deadline) + escrow.JUDGING_PERIOD());
        vm.prank(sponsor);
        vm.expectRevert(BountyEscrow.TooEarly.selector);
        escrow.refund(id);

        vm.warp(uint256(deadline) + escrow.JUDGING_PERIOD() + 1);
        vm.prank(sponsor);
        escrow.refund(id);
    }

    function test_AwardRejectsBadInput() public {
        uint256 id = _create();
        address[] memory w = new address[](1);
        uint256[] memory a = new uint256[](2);

        vm.startPrank(sponsor);
        vm.expectRevert(BountyEscrow.LengthMismatch.selector);
        escrow.award(id, w, a);

        vm.expectRevert(BountyEscrow.InvalidAmount.selector);
        escrow.award(id, new address[](0), new uint256[](0));

        (w, a) = _one(address(0), 1);
        vm.expectRevert(BountyEscrow.InvalidAddress.selector);
        escrow.award(id, w, a);

        (w, a) = _one(analyst, 0);
        vm.expectRevert(BountyEscrow.InvalidAmount.selector);
        escrow.award(id, w, a);

        w = new address[](51);
        a = new uint256[](51);
        vm.expectRevert(BountyEscrow.TooManyWinners.selector);
        escrow.award(id, w, a);
        vm.stopPrank();
    }

    function test_UnknownBountyReverts() public {
        (address[] memory w, uint256[] memory a) = _one(analyst, 1);
        vm.prank(sponsor);
        vm.expectRevert(BountyEscrow.UnknownBounty.selector);
        escrow.award(99, w, a);

        vm.prank(arbiter);
        vm.expectRevert(BountyEscrow.UnknownBounty.selector);
        escrow.refund(99);
    }

    function test_FundedBountyStillPaysIfTokenIsDisallowedLater() public {
        uint256 id = _create();
        vm.prank(owner);
        escrow.setTokenAllowed(address(usdc), false);

        (address[] memory w, uint256[] memory a) = _one(analyst, REWARD);
        vm.prank(sponsor);
        escrow.award(id, w, a);
        assertEq(usdc.balanceOf(analyst), 950e6);
    }

    function test_ZeroFeeSendsNothingToTreasury() public {
        vm.prank(owner);
        escrow.setFee(0);
        uint256 id = _create();

        (address[] memory w, uint256[] memory a) = _one(analyst, REWARD);
        vm.prank(sponsor);
        escrow.award(id, w, a);
        assertEq(usdc.balanceOf(analyst), REWARD);
        assertEq(usdc.balanceOf(treasury), 0);
    }

    function test_AwardAndRefundEmitEvents() public {
        uint256 id = _create();
        (address[] memory w, uint256[] memory a) = _one(analyst, 400e6);

        vm.expectEmit(true, true, false, true);
        emit BountyEscrow.Awarded(id, analyst, 380e6, 20e6);
        vm.prank(sponsor);
        escrow.award(id, w, a);

        vm.expectEmit(true, true, false, true);
        emit BountyEscrow.Refunded(id, sponsor, 600e6);
        vm.prank(arbiter);
        escrow.refund(id);
    }

    function test_PermitThatWasFrontRunStillCreates() public {
        address payer = vm.addr(0xB0B);
        usdc.mint(payer, REWARD);
        vm.prank(payer);
        usdc.approve(address(escrow), REWARD);

        vm.prank(payer);
        uint256 id = escrow.createBountyWithPermit(usdc, REWARD, uint64(block.timestamp + 1 days), REF, 0, 0, 0, 0);
        assertEq(escrow.getBounty(id).amount, REWARD);
    }

    function test_PermitWithoutAllowanceReverts() public {
        address payer = vm.addr(0xB0B);
        usdc.mint(payer, REWARD);
        vm.prank(payer);
        vm.expectRevert();
        escrow.createBountyWithPermit(usdc, REWARD, uint64(block.timestamp + 1 days), REF, 0, 0, 0, 0);
    }

    function test_OwnerSettingsRejectZeroAddressesAndUseTwoStepTransfer() public {
        vm.startPrank(owner);
        vm.expectRevert(BountyEscrow.InvalidAddress.selector);
        escrow.setTreasury(address(0));
        vm.expectRevert(BountyEscrow.InvalidAddress.selector);
        escrow.setArbiter(address(0));
        vm.expectRevert(BountyEscrow.InvalidAddress.selector);
        escrow.setTokenAllowed(address(0), true);

        escrow.transferOwnership(analyst);
        vm.stopPrank();
        assertEq(escrow.owner(), owner);

        vm.prank(analyst);
        escrow.acceptOwnership();
        assertEq(escrow.owner(), analyst);
    }

    // =====================================
    // ⬢ Fuzz
    // =====================================

    function testFuzz_EscrowNeverPaysMoreThanItHolds(uint256 first, uint256 second) public {
        uint256 id = _create();
        first = bound(first, 1, REWARD);
        second = bound(second, 1, REWARD);

        (address[] memory w, uint256[] memory a) = _one(analyst, first);
        vm.prank(sponsor);
        escrow.award(id, w, a);

        (w, a) = _one(analyst2, second);
        vm.prank(sponsor);
        if (first == REWARD) vm.expectRevert(BountyEscrow.BountyClosed.selector);
        else if (first + second > REWARD) vm.expectRevert(BountyEscrow.ExceedsRemaining.selector);
        escrow.award(id, w, a);

        assertEq(
            usdc.balanceOf(address(escrow)) + usdc.balanceOf(analyst) + usdc.balanceOf(analyst2)
                + usdc.balanceOf(treasury),
            REWARD
        );
    }
}
