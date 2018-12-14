pragma solidity ^0.4.0;

contract Precompile {
	function blake2b256(bytes32 input) public returns (bytes32){
		return bytes32("placeholder");
	}
	function transactionhash() public returns (bytes32){
		return bytes32("placeholder");
	}
	function edverify(bytes32 verifyHash, bytes32 publicKey, bytes32 sig1, bytes32 sig2) returns (address){
		return address(publicKey);
	}
}