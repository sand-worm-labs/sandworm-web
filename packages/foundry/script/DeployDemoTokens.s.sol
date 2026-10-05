// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console } from "forge-std/Script.sol";

import { BountyEscrow } from "../contracts/BountyEscrow.sol";
import { DemoToken } from "../contracts/DemoToken.sol";

/**
 * @notice Deploys the demo tokens, mints some to the deployer and allows them in the escrow.
 * ESCROW must be set to a BountyEscrow the deployer owns. Testnet only.
 * Addresses are written to deployments/tokens-<chain id>.json.
 */
contract DeployDemoTokens is Script {
    uint256 constant COUNT = 10;
    uint256 constant MINT_WHOLE = 1_000_000;

    function names() internal pure returns (string[COUNT] memory n, string[COUNT] memory s, uint8[COUNT] memory d) {
        n = ["Global Dollar", "USD Coin", "Tether USD", "Dai", "Pyth Network", "Arbitrum", "Uniswap", "Optimism", "Mantle", "Wrapped Ether"];
        s = ["USDG", "USDC", "USDT", "DAI", "PYTH", "ARB", "UNI", "OP", "MNT", "WETH"];
        d = [6, 6, 6, 18, 6, 18, 18, 18, 18, 18];
    }

    function run() external {
        BountyEscrow escrow = BountyEscrow(vm.envAddress("ESCROW"));
        (string[COUNT] memory n, string[COUNT] memory s, uint8[COUNT] memory d) = names();

        vm.startBroadcast();
        (, address deployer,) = vm.readCallers();
        string memory json;
        for (uint256 i; i < COUNT; ++i) {
            DemoToken token = new DemoToken(n[i], s[i], d[i]);
            token.mint(deployer, MINT_WHOLE * 10 ** d[i]);
            escrow.setTokenAllowed(address(token), true);
            json = vm.serializeAddress("tokens", s[i], address(token));
            console.log(s[i], address(token));
        }
        vm.stopBroadcast();

        vm.writeJson(json, string.concat(vm.projectRoot(), "/deployments/tokens-", vm.toString(block.chainid), ".json"));
    }
}
