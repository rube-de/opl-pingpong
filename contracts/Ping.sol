// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Host, Result} from "@oasisprotocol/sapphire-contracts/contracts/OPL.sol";

contract Ping is Host {
    event MessageReceived(bytes message);

    constructor(address pong) Host(pong) {
        registerEndpoint("pongMessage", _pongMessage);
    }

    function startPing (bytes calldata _message) external payable {
        postMessage("ping", abi.encode(_message));
    }

    function _pongMessage(bytes calldata _args) internal returns (Result) {
        (bytes memory message) = abi.decode((_args), (bytes));
        emit MessageReceived(message);
        return Result.Success;
    }    
}