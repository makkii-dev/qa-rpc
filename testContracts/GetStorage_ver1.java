package avmtest;

import avm.Address;
import avm.Blockchain;
import org.aion.avm.tooling.abi.Callable;

public class GetStorage_ver1 {
    private static final Address deployer;

    static{
        deployer = Blockchain.getCaller();
    }

    @Callable
    public static void put() {
        Blockchain.println("put caller: "+deployer.toString());
        Blockchain.putStorage(deployer.toByteArray(), Blockchain.getCaller().toByteArray());
    }

    @Callable
    public static byte[] get() {
        Blockchain.println("get caller: "+deployer.toString());
        return Blockchain.getStorage(deployer.toByteArray());
        //return new byte[0];
    }

    @Callable
    public static void updateJava() {
        Blockchain.log(Blockchain.getStorage(deployer.toByteArray()));
        Blockchain.putStorage(deployer.toByteArray(), "java".getBytes());
    }


    @Callable
    public static void updateNull() {
        Blockchain.log(Blockchain.getStorage(deployer.toByteArray()));
        Blockchain.putStorage(deployer.toByteArray(), null);
    }


    @Callable
    public static void updateNewByte(int len) {
        Blockchain.log(Blockchain.getStorage(deployer.toByteArray()));
        Blockchain.putStorage(deployer.toByteArray(), new byte[len]);
    }

}
