package avmtest;

import avm.Blockchain;
import org.aion.avm.tooling.abi.Callable;

public class GetStorage_ver2 {
    private static byte[] key = new byte[16];

    static{
        key[0]=0x0;
        key[1]=0x1;
    }

    @Callable
    public static void put() {

        Blockchain.putStorage(key, Blockchain.getCaller().toByteArray());
    }

    @Callable
    public static byte[] get() {

        return Blockchain.getStorage(key);
        //return new byte[0];
    }

    @Callable
    public static void updateJava() {

        Blockchain.putStorage(key, "java".getBytes());
    }


    @Callable
    public static void updateNull() {

        Blockchain.putStorage(key, null);
    }


    @Callable
    public static void updateNewByte(int len) {

        Blockchain.putStorage(key, new byte[len]);
    }

}
