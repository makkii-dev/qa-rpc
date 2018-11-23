/*
  sol Counter
  Simple Counter Contract - Increase / Decrease by 1
*/

pragma solidity ^0.4.10;

contract Counter {

  /* State Variables */
  // State variables are values which are permanently stored in contract storage.
  uint8 count=123; // = 0
  uint8 called;
  address owner;

  /* Events */
  event CounterIncreased(bool counter);
  event CounterDecreased(bool counter);
  event CounterValue(uint8 calls, uint8 ct);

  /* Functions */
  // Functions are the executable units of code within a contract.
  function Counter() public {
    owner = msg.sender;
  }

  function incrementCounter() public {
    count += 1;
    called += 1;
    CounterIncreased(true);
    CounterValue(called, count);
  }
  function decrementCounter() public {
    count -= 1;
    called += 1;
    CounterDecreased(true);
    CounterValue(called, count);
  }
  function incDecCounter() public {
  
    called += 1;
    CounterIncreased(true);
    CounterDecreased(true);
    CounterValue(called, count);
  }
  function getCount() public constant returns (uint8) {
    return count;
  }
}
