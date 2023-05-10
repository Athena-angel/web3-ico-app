// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract STKN is ERC20, Ownable {
    constructor() ERC20("Staking Token", "STKN") {
        _mint(msg.sender, 10000000 * 1e18);
    }

    // function mint(address smartcontract_address, uint value) public onlyOwner {
    //     _mint(smartcontract_address, value * 1e18);
    // }
}
