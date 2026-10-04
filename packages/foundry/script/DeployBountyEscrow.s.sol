// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./DeployHelpers.s.sol";
import { BountyEscrow } from "../contracts/BountyEscrow.sol";
import { MockToken } from "../test/mocks/MockToken.sol";

/**
 * @notice Deploys BountyEscrow and allows the stablecoins it accepts on the chain.
 * TREASURY and ARBITER in .env default to the deployer. FEE_BPS defaults to 500 (5%).
 * Example:
 * yarn deploy --file DeployBountyEscrow.s.sol --network arbitrumSepolia
 */
contract DeployBountyEscrow is ScaffoldETHDeploy {
    address constant USDC_ARBITRUM = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address constant USDG_ARBITRUM = 0x004B506865409877C9fA29bfb1ebA929984B9bbC;
    address constant USDC_ARBITRUM_SEPOLIA = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;

    function run() external ScaffoldEthDeployerRunner {
        address treasury = vm.envOr("TREASURY", deployer);
        address arbiter = vm.envOr("ARBITER", deployer);
        uint16 feeBps = uint16(vm.envOr("FEE_BPS", uint256(500)));

        BountyEscrow escrow = new BountyEscrow(deployer, treasury, arbiter, feeBps);
        deployments.push(Deployment("BountyEscrow", address(escrow)));

        if (block.chainid == 42161) {
            escrow.setTokenAllowed(USDC_ARBITRUM, true);
            escrow.setTokenAllowed(USDG_ARBITRUM, true);
        } else if (block.chainid == 421614) {
            escrow.setTokenAllowed(USDC_ARBITRUM_SEPOLIA, true);
        } else if (block.chainid == 31337) {
            MockToken token = new MockToken();
            token.mint(deployer, 1_000_000e6);
            escrow.setTokenAllowed(address(token), true);
            deployments.push(Deployment("MockToken", address(token)));
        }
    }
}
