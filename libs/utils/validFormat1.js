var chaiMatchPattern = require('chai-match-pattern');
var chai= require("chai");
chai.use(chaiMatchPattern);
var expect = chai.expect;
var _ = chaiMatchPattern.getLodashModule();
var utils = require("./utils2");


var H160= /^0x[0-9a-f]{1,160}$/;
var H256= /^0x[0-9a-f]{1,256}$/;
var H64=/^0x[0-9a-f]{64}$/;
var HEX=/^0x[0-9a-f]*$/;
var JAVA_HEX = /^[0-9a-f]*$/
var BINARY=()=>{return {test:(val)=>(/^0x[0-9a-f]*$/.test(val) && val.length%2===0)}};



const code_format = /^0x[0-9a-f]+$/;
const transaction_format = /^0x[0-9a-f]{64}$/;
const blockHash_format = H160;
const account_format = H256;
const public_key = H64;
const NULL_N_HEX = ()=>{
		return {test:(value)=>{return HEX.test(value)|| _.isNull(value);}};
	}
const NULL_N_INT = ()=>{return {test:(value)=>{return _.isNull(value) || _.isNumber(value);}}};

const VALID_BLOCK_OBJECT={
	difficulty:HEX,
	extraData:HEX,
	gasLimit:HEX,
	gasUsed:HEX,
	hash:H160,
	logsBloom:HEX,
	miner:H160,
	nonce:HEX,
	number:_.isNumber,
	parentHash:H160,
	receiptsRoot:H160,
	size:HEX,
	solution:HEX,
	stateRoot:H160,
	timestamp:HEX,
	totalDifficulty:HEX,
	transactions:_.isArray,
	transactionsRoot:transaction_format
}

const VALID_SYNCING_INFO = {
       StartingBlock: H160,
       currentBlock:H160,
       highestBlock:H160,
       blockGap: _.isArray
};

const VALID_TRANSACTION_RECEIPT = {
	    blockHash: NULL_N_HEX,
        blockNumber: NULL_N_INT,
        contractAddress: NULL_N_HEX,
        cumulativeGasUsed: HEX,
        from: account_format,
        to: account_format,
        gasUsed: HEX,
        logs: _.isArray,
        logsBloom: JAVA_HEX,
        /*Quantity - ‘0x0’ indicates transaction failure , ‘0x1’ indicates transaction success. Set for blocks mined after Byzantium hard fork EIP609, null before.*/
        status:HEX,
        transactionHash: transaction_format,
        transactionIndex: HEX,
        cumulativeNrgUsed: HEX,
        nrgPrice:HEX,
        nrgUsed:HEX

}

const VALID_TX_RECEIPT = {
	blockHash:NULL_N_HEX,
	blockNumber:NULL_N_INT,
	contractAddress:NULL_N_HEX,
	cumulativeGasUsed:HEX,
	from:HEX,
	gasLimit:HEX,
	gasPrice:HEX,
	gasUsed:HEX,
	logs:_.isArray,
	logsBloom:JAVA_HEX,
	//output:/^0x[0-9]*/,
	root:JAVA_HEX,
	to:NULL_N_HEX,
	transactionHash:HEX,
	transactionIndex:HEX,
	status:HEX,
	cumulativeNrgUsed:HEX,
	nrgPrice:HEX,
	nrgUsed:HEX
}

const TX_OBJECT= {
	blockHash:NULL_N_HEX,
	blockNumber:NULL_N_INT,
	chainId:NULL_N_HEX,
	contractAddress:NULL_N_HEX,
	from:account_format,
	gas:_.isNumber,
	gasPrice:HEX,
	hash:transaction_format,
	input:BINARY,
	nonce:_.isNumber,
	//publicKey:public_key,
	//raw:HEX,
	//sig:BINARY,
	//standardV:HEX,
	timestamp:_.isNumber,
	to:account_format,
	transactionIndex:NULL_N_HEX,
	value:HEX,
	nrg:_.isNumber,
	nrgPrice:HEX
}



const VALID_SIGN_TRANSACTION = {
	raw: HEX,
	tx:TX_OBJECT
}

/*
const expectblk_tx = {
	difficulty:expect.any(BigNumber),
	extraData:expect.anything(),
	gasLimit:expect.anything(),
	gasUsed:expect.anything(),
	hash:expect.anything(),
	logsBloom:expect.anything(),
	miner:expect.anything(),
	nonce:expect.anything(),
	number:expect.any(Number),
	parentHash:expect.anything(),
	receiptsRoot:expect.anything(),
	size:expect.any(Number),
	solution:expect.anything(),
	stateRoot:expect.anything(),
	timestamp:expect.any(Number),
	totalDifficulty:expect.any(BigNumber),
	transactions:expect.arrayContaining([expect.objectContaining(expect_tx)]),
	transactionsRoot:expect.anything(),
	nrgLimit:expect.anything(),
	nrgUsed:expect.anything(),
}

*/




const COMPILE_RESUILT={
	
		code:code_format,
		info:{
			abiDefinition:_.isArray,
			compilerVersion:_.isString,
			language:_.isString,
			languageVersion:_.isString,
			source:_.isString
		}
	
}

const VALID_WORKTEMPLATE={
	blockBaseReward:HEX,
 	blockTxFee:HEX,
 	headerHash:HEX,
	height:_.isNumber,
	previousblockhash:HEX,
	target:HEX
}


const VALID_LOGS={
	
}

var formates ={

		TRANSACTION_HASH:transaction_format,
		ACCOUNT_FORMAT:account_format,
		HEX:HEX,
		H160:H160,
		CONTRACT_VALUE_FORMAT:HEX,
		BALANCE_FORMAT:utils.isBIGNUMBER,
		BLOCK_NUMBER_FORMAT:_.isNumber,
		BOOLEAN:_.isBoolean,
		ARRAY:_.isArray,
		STRING:_.isString,
		BINARY:BINARY,
		NUMBER:_.isNumber,
		NULL:_.isNull,

		VALID_BLOCK_OBJECT:VALID_BLOCK_OBJECT,
		VALID_SYNCING_INFO:VALID_SYNCING_INFO,
		VALID_TRANSACTION_RECEIPT:VALID_TRANSACTION_RECEIPT,
		VALID_WORKTEMPLATE:VALID_WORKTEMPLATE,
		VALID_SIGN_TRANSACTION:VALID_SIGN_TRANSACTION,
		VALID_TX:TX_OBJECT,
		COMPILE_RESUILT:COMPILE_RESUILT,
		VALID_TX_RECEIPT:VALID_TX_RECEIPT,
		RPC_MODULES:{
			eth:'1.0',
			net:'1.0',
			personal:'1.0',
			//pubsub:'1.0',
			rpc:'1.0',
			stratum:'1.0',
			web3:'1.0'
		},
		LOCKED_ERROR:{
			code:-32020,
			message:"Your account is locked. Unlock the account via CLI, personal_unlockAccount or use Trusted Signer.",
			data:"NotUnlocked"
		},
		LOCKED_INVALID_ACC_ERROR:{
			code:-32020,
			message:"Your account is locked. Unlock the account via CLI, personal_unlockAccount or use Trusted Signer.",
			data:"SStore(InvalidAccount)"
		},
		PARAMS_FORMAT_ERROR:`{
			code:-32602,
			message:_.isString
			...
		}`,
		WRONG_PW_ERROR:{
			code:-32023,
			message:_.isString,
			data:"InvalidPassword"
		},
		INVALID_ACC_ERROR:{
			code: -32023,
		  	message: /Unable to \w*lock the account/,
		  	data: 'InvalidAccount'
		},
		INVALID_METHOD:{
			code:-32601,
			message:"Method not found"
		},
		GAS_LOW_ERROR:{
			code:-32010,
			message:/^Transaction gas is too low. There is not enough gas to cover minimal cost of/
		},
		NOT_ENOUGH_BALANCE_ERROR:{
			code:-32010,
			message:/^Insufficient funds. The account you tried to send transaction from does not have enough funds/
		},
		NONCE_CONFLICT_ERROR:{
			code:-32010,
			message:/Transaction gas price is too low. There is another transaction with same nonce in the queue/
		},
		INVALID_GAS_PRICE:{ 
			code: -32010,
  			message:/Transaction gas price is either too low or too high/
  		},
  		INVALID_GAS:{
  			code:-32010,
  			message:/Invalid transaction gas/
  		},
  		INVALID_CREATION_GAS:{
  			code:-32010,
  			message:/Invalid contract creation gas/
  		},
  		PERSONAL_INVALID_PASSWORD:`{
  			code: -32021,
  			data: /InvalidPassword/
  			...
  		}`
	
	
};


module.exports = function(row, rt, resolution){
	let params = row.params;
	console.log(params);
	console.log("validateFormate: ",resolution.result,resolution.error)
	switch(params[0]){

		case 'error':
			expect(resolution.error).to.matchPattern(formates[params[1]]);
			break;
		case 'contains':
			expect(resolution.result).to.include(params[1]);
			break;
		case 'deployedCode':
			resolution.result = resolution.result.substring(2);
			params[1] = params[1].substring(94);
			console.log(resolution.result.length + "\t"+params[1].length)
		case 'equal':
			console.log("\n\n\n\n");
			expect(resolution.result).to.equal(params[1]);
			break;
		case "length":
			expect(resolution.result).to.have.lengthOf(params[1]);
			break;
		case "contract":
			Object.values(resolution.result).forEach((value,index)=>{
				expect(value).to.matchPattern(formates.COMPILE_RESUILT);
			})
			break;
		default:
			expect(resolution.result).to.matchPattern(formates[params[1]]);

	}

	rt.reassign(row.runtimeVal).storeVariables(row.storeVariables,resolution);
	return Promise.resolve(resolution);
}