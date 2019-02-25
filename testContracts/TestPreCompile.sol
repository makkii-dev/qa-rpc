pragma solidity ^0.4.0;
contract ContractDepth2 {
    event Depth(bytes32);

    function deeperCall(uint8 n) public returns (bytes32){
        n = n+1;
        bytes32 txhash= transactionhash();
        Depth(txhash);
        return txhash;
    }
}

contract TestPrecompile {

    event Blake(bytes32,bytes32);
    event TxHash(bytes32);
    event VerifyInfo(address);

    //  function blake2b256(...) public returns (bytes32);

    function testBlake2b256(bytes32 _input){
         Blake(_input,blake2b256(_input));
    }

    // function transactionhash() public returns (bytes32);

    function testTransactionhash(){
        TxHash(transactionhash());
    }


    // function edverify(bytes32 verifyHash, bytes32 publicKey, bytes32 sig1, bytes32 sig2) returns (address)

    function testEdverify(bytes32 verifyHash, bytes32 publicKey, bytes32 sig1, bytes32 sig2){
       VerifyInfo( edverify(verifyHash,publicKey,sig1,sig2));
    }

    //  test call transactionhash in a another contract
    function testTransactionhashFromAnotherCnt(address secCnt){
        TxHash(ContractDepth2(secCnt).deeperCall(1));
    }

}
