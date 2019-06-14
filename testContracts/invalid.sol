pragma solidity ^0.4.0;

contract Recursive {

    event Evt(uint256 n);
    uint128 called = 12;

    function f(address a, uint n) returns (uint) {
        Evt(n);
        Recursive r = Recursive(a);

        if (n <= 1) {
            return n;
        } else {
            return r.f(a, n - 1) + 1;
        }
    }

    function addr() returns (address){
        return address(this);
    }
}
