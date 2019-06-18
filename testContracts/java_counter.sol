pragma solidity ^0.4.10;

contract Counter {
  event MyEvent (
    uint indexed number,
    string word
  );

  function emitEv(uint n, string w) public {
    MyEvent(n, w);
  }

  /* State Variables */
  // State variables are values which are permanently stored in contract storage.
  int private count; // = 0
  address owner;

  /* Events */
  event CounterIncreased(bool counter,int);
  event CounterDecreased(bool counter,int);

  /* Functions */
  // Functions are the executable units of code within a contract.
  function Counter() public {
    owner = msg.sender;
  }

  // Increase counter by 1
  function incrementCounter() public {
    count += 1;
    CounterIncreased(true,count);
  }

  // Decrease counter by 1
  function decrementCounter() public {
    count -= 1;
    CounterDecreased(true,count);
  }

  // Getter function that returns the current counter status
  function getCount() public constant returns (int) {
    return count;
  }
}
