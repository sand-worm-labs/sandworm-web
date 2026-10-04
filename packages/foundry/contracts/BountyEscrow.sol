// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Sandworm bounty escrow
/// @notice A sponsor locks a reward for an analytics bounty. The sponsor, or the
/// arbiter once the deadline has passed, pays it out to one or more winners,
/// less the platform fee. Whatever is not paid out goes back to the sponsor once
/// the judging period ends, or earlier if the arbiter cancels the bounty.
contract BountyEscrow is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Bounty {
        address sponsor;
        uint64 deadline;
        uint16 feeBps;
        bool closed;
        IERC20 token;
        uint256 amount;
        uint256 paid;
    }

    uint16 public constant MAX_FEE_BPS = 1_000;
    uint64 public constant JUDGING_PERIOD = 14 days;
    uint256 public constant MAX_WINNERS = 50;

    address public treasury;
    address public arbiter;
    uint16 public feeBps;
    uint256 public bountyCount;

    mapping(address token => bool) public allowedTokens;
    mapping(uint256 id => Bounty) private _bounties;

    event BountyCreated(
        uint256 indexed id,
        address indexed sponsor,
        address indexed token,
        uint256 amount,
        uint64 deadline,
        uint16 feeBps,
        bytes32 ref
    );
    event Awarded(uint256 indexed id, address indexed winner, uint256 amount, uint256 fee);
    event Refunded(uint256 indexed id, address indexed sponsor, uint256 amount);
    event TokenAllowed(address indexed token, bool allowed);
    event TreasuryUpdated(address treasury);
    event ArbiterUpdated(address arbiter);
    event FeeUpdated(uint16 feeBps);

    error TokenNotAllowed();
    error InvalidAmount();
    error InvalidDeadline();
    error InvalidAddress();
    error FeeTooHigh();
    error UnknownBounty();
    error BountyClosed();
    error NotAuthorized();
    error TooEarly();
    error LengthMismatch();
    error TooManyWinners();
    error ExceedsRemaining();

    constructor(address owner_, address treasury_, address arbiter_, uint16 feeBps_) Ownable(owner_) {
        _setTreasury(treasury_);
        _setArbiter(arbiter_);
        _setFee(feeBps_);
    }

    // =====================================
    // ⬢ Sponsor
    // =====================================

    /// @param ref Links the bounty to its record offchain, such as keccak256 of its slug.
    function createBounty(IERC20 token, uint256 amount, uint64 deadline, bytes32 ref)
        external
        nonReentrant
        returns (uint256 id)
    {
        return _create(token, amount, deadline, ref);
    }

    /// @notice Same as createBounty, approving the transfer with an EIP-2612
    /// signature in the same transaction.
    function createBountyWithPermit(
        IERC20 token,
        uint256 amount,
        uint64 deadline,
        bytes32 ref,
        uint256 permitDeadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant returns (uint256 id) {
        // A front-run permit leaves the allowance in place, so a failed call is not fatal.
        try IERC20Permit(address(token)).permit(msg.sender, address(this), amount, permitDeadline, v, r, s) {} catch {}
        return _create(token, amount, deadline, ref);
    }

    /// @notice Pays winners from the bounty. Each receives their amount less the
    /// bounty's fee. The sponsor can award at any time, the arbiter only after the
    /// deadline.
    function award(uint256 id, address[] calldata winners, uint256[] calldata amounts) external nonReentrant {
        Bounty storage bounty = _openBounty(id);
        if (msg.sender != bounty.sponsor) {
            if (msg.sender != arbiter) revert NotAuthorized();
            if (block.timestamp <= bounty.deadline) revert TooEarly();
        }
        if (winners.length != amounts.length) revert LengthMismatch();
        if (winners.length == 0) revert InvalidAmount();
        if (winners.length > MAX_WINNERS) revert TooManyWinners();

        uint256 total;
        for (uint256 i; i < amounts.length; ++i) {
            if (amounts[i] == 0) revert InvalidAmount();
            if (winners[i] == address(0)) revert InvalidAddress();
            total += amounts[i];
        }
        if (total > bounty.amount - bounty.paid) revert ExceedsRemaining();

        bounty.paid += total;
        if (bounty.paid == bounty.amount) bounty.closed = true;

        uint256 fees;
        for (uint256 i; i < winners.length; ++i) {
            uint256 fee = amounts[i] * bounty.feeBps / 10_000;
            fees += fee;
            bounty.token.safeTransfer(winners[i], amounts[i] - fee);
            emit Awarded(id, winners[i], amounts[i] - fee, fee);
        }
        if (fees > 0) bounty.token.safeTransfer(treasury, fees);
    }

    /// @notice Returns what was not awarded to the sponsor and closes the bounty.
    /// The sponsor can do this once the judging period has ended, the arbiter at
    /// any time, for example to cancel a bounty. Funds only ever go back to the
    /// sponsor.
    function refund(uint256 id) external nonReentrant {
        Bounty storage bounty = _openBounty(id);
        if (msg.sender != arbiter) {
            if (msg.sender != bounty.sponsor) revert NotAuthorized();
            if (block.timestamp <= uint256(bounty.deadline) + JUDGING_PERIOD) revert TooEarly();
        }

        uint256 remaining = bounty.amount - bounty.paid;
        bounty.closed = true;
        if (remaining > 0) bounty.token.safeTransfer(bounty.sponsor, remaining);
        emit Refunded(id, bounty.sponsor, remaining);
    }

    // =====================================
    // ⬢ Views
    // =====================================

    function getBounty(uint256 id) external view returns (Bounty memory) {
        return _bounties[id];
    }

    function remaining(uint256 id) external view returns (uint256) {
        Bounty storage bounty = _bounties[id];
        return bounty.closed ? 0 : bounty.amount - bounty.paid;
    }

    // =====================================
    // ⬢ Owner
    // =====================================

    function setTokenAllowed(address token, bool allowed) external onlyOwner {
        if (token == address(0)) revert InvalidAddress();
        allowedTokens[token] = allowed;
        emit TokenAllowed(token, allowed);
    }

    function setTreasury(address treasury_) external onlyOwner {
        _setTreasury(treasury_);
    }

    function setArbiter(address arbiter_) external onlyOwner {
        _setArbiter(arbiter_);
    }

    /// @notice Applies to bounties created after the change.
    function setFee(uint16 feeBps_) external onlyOwner {
        _setFee(feeBps_);
    }

    // =====================================
    // ⬢ Internal
    // =====================================

    function _create(IERC20 token, uint256 amount, uint64 deadline, bytes32 ref) private returns (uint256 id) {
        if (!allowedTokens[address(token)]) revert TokenNotAllowed();
        if (amount == 0) revert InvalidAmount();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        uint256 balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - balanceBefore;
        if (received == 0) revert InvalidAmount();

        id = ++bountyCount;
        _bounties[id] = Bounty({
            sponsor: msg.sender,
            deadline: deadline,
            feeBps: feeBps,
            closed: false,
            token: token,
            amount: received,
            paid: 0
        });
        emit BountyCreated(id, msg.sender, address(token), received, deadline, feeBps, ref);
    }

    function _openBounty(uint256 id) private view returns (Bounty storage bounty) {
        bounty = _bounties[id];
        if (bounty.sponsor == address(0)) revert UnknownBounty();
        if (bounty.closed) revert BountyClosed();
    }

    function _setTreasury(address treasury_) private {
        if (treasury_ == address(0)) revert InvalidAddress();
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    function _setArbiter(address arbiter_) private {
        if (arbiter_ == address(0)) revert InvalidAddress();
        arbiter = arbiter_;
        emit ArbiterUpdated(arbiter_);
    }

    function _setFee(uint16 feeBps_) private {
        if (feeBps_ > MAX_FEE_BPS) revert FeeTooHigh();
        feeBps = feeBps_;
        emit FeeUpdated(feeBps_);
    }
}
