// Keep your original line 1 code

import avm.Address;
import avm.Blockchain;
import org.aion.avm.tooling.abi.Callable;
import org.aion.avm.userlib.abi.ABIDecoder;

import java.math.BigInteger;

public class Counter {
  private static Address owner;
  private static int count = 0;

  static {
    owner = Blockchain.getCaller();
  }

  @Callable
  public static void incrementCounter(int increment){
    count += increment;
    Blockchain.log("CounterIncreased".getBytes(), BigInteger.valueOf(increment).toByteArray());
  }

  @Callable
  public static void decrementCounter(int decrement){
    count -= decrement;
    Blockchain.log("CounterDecreased".getBytes(), BigInteger.valueOf(decrement).toByteArray());
  }

  @Callable
  public static int getCount(){
    return count;
  }

}
