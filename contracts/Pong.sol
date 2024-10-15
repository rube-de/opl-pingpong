// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Enclave, Result, autoswitch} from "@oasisprotocol/sapphire-contracts/contracts/OPL.sol";

contract Pong is Enclave {
    event MessageReceived(bytes message);

    constructor(address ping, bytes32 chain) Enclave(ping, autoswitch(chain)) {
        registerEndpoint("ping", _pingMessage);
    }

    function _pingMessage(bytes calldata _args) internal returns (Result) {
        (bytes memory message) = abi.decode((_args), (bytes));
        emit MessageReceived(message);
        return Result.Success;
    }
}