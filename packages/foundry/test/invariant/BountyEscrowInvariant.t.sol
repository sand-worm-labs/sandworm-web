// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";

import {BountyEscrow} from "../../contracts/BountyEscrow.sol";
import {MockToken} from "../mocks/MockToken.sol";

contract EscrowHandler is Test {
    BountyEscrow internal escrow;
    MockToken internal token;
    address internal arbiter;
    address[] internal sponsors;
    uint256[] public ids;

    constructor(BountyEscrow escrow_, MockToken token_, address arbiter_) {
        escrow = escrow_;
        token = token_;
        arbiter = arbiter_;
        for (uint256 i; i < 3; ++i) {
            address sponsor = makeAddr(string.concat("sponsor", vm.toString(i)));
            sponsors.push(sponsor);
            token.mint(sponsor, 1e30);
            vm.prank(sponsor);
            token.approve(address(escrow), type(uint256).max);
        }
    }

    function create(uint256 seed, uint256 amount, uint256 duration) external {
        address sponsor = sponsors[seed % sponsors.length];
        amount = bound(amount, 1, 1e18);
        duration = bound(duration, 1, 60 days);
        vm.prank(sponsor);
        ids.push(escrow.createBounty(token, amount, uint64(block.timestamp + duration), bytes32(seed)));
    }

    function award(uint256 seed, uint256 amount) external {
        if (ids.length == 0) return;
        uint256 id = ids[seed % ids.length];
        uint256 left = escrow.remaining(id);
        if (left == 0) return;
        address[] memory w = new address[](1);
        uint256[] memory a = new uint256[](1);
        w[0] = makeAddr("winner");
        a[0] = bound(amount, 1, left);
        vm.prank(escrow.getBounty(id).sponsor);
        escrow.award(id, w, a);
    }

    function refund(uint256 seed) external {
        if (ids.length == 0) return;
        uint256 id = ids[seed % ids.length];
        if (escrow.getBounty(id).closed) return;
        vm.prank(arbiter);
        escrow.refund(id);
    }

    function idCount() external view returns (uint256) {
        return ids.length;
    }
}

contract BountyEscrowInvariantTest is Test {
    BountyEscrow internal escrow;
    MockToken internal token;
    EscrowHandler internal handler;

    function setUp() public {
        address arbiter = makeAddr("arbiter");
        escrow = new BountyEscrow(address(this), makeAddr("treasury"), arbiter, 500);
        token = new MockToken();
        escrow.setTokenAllowed(address(token), true);
        handler = new EscrowHandler(escrow, token, arbiter);
        targetContract(address(handler));
    }

    // The escrow always holds exactly what open bounties still owe.
    function invariant_BalanceEqualsWhatIsOwed() public view {
        uint256 owed;
        for (uint256 i; i < handler.idCount(); ++i) {
            owed += escrow.remaining(handler.ids(i));
        }
        assertEq(token.balanceOf(address(escrow)), owed);
    }
}
