var chaiMatchPattern = require('chai-match-pattern');
var chai= require("chai");
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var utils = require("./utils");


var H160= /^0x[0-9a-f]{1,160}$/;
var H256= /^0x[0-9a-f]{1,256}$/;
var H64=/^0x[0-9a-f]{64}$/;
var HEX=/^0x[0-9a-f]+$/;
var BINARY=()=>{return {test:(val)=>(/^0x[0-9a-f]*$/.test(val) && val.length%2===0)}};





const code_format = /^[0-9a-f]+$/;
const transaction_format = /^0x[0-9a-f]{64}$/;
const blockHash_format = H160;
const account_format = H256;
const public_key = H64;

const VALID_BLOCK_OBJECT={
	difficulty:HEX,
	extraData:HEX,
	gasLimit:HEX,
	gasUsed:HEX,
	hash:H160,
	logsBloom:HEX,
	miner:H160,
	nonce:HEX,
	number:HEX,
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
	    blockHash: blockHash_format,
        blockNumber: _.isString,
        contractAddress: account_format,
        cumulativeGasUsed: HEX,
        from: account_format,
        to: account_format,
        gasUsed: HEX,
        logs: _.isArray,
        logsBloom: HEX,
        root: HEX,
        /*Quantity - ‘0x0’ indicates transaction failure , ‘0x1’ indicates transaction success. Set for blocks mined after Byzantium hard fork EIP609, null before.*/
        status:HEX,
        transactionHash: transaction_format,
        transactionIndex: HEX
}

const TX_OBJECT= {
	blockHash:_.isNull,
	blockNumber:_.isNull,
	chainId:_.isNull,
	condition:_.isNull,
	creates:_.isNull,
	from:account_format,
	gas:HEX,
	gasPrice:HEX,
	hash:transaction_format,
	input:BINARY,
	nonce:HEX,
	publicKey:public_key,
	raw:HEX,
	sig:BINARY,
	standardV:HEX,
	timestamp:utils.isValidTimeStamp,
	to:account_format,
	transactionIndex:_.isNull,
	value:HEX
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
	Recursive:{
		code:code_format,
		info:{
			abiDefinition:_.isArray,
			compilerVersion:_.isString,
			language:_.isString,
			languageVersion:_.isString,
			source:_.isString
		}
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


module.exports={
	SINGLE:{
		TRANSACTION_FORMAT:transaction_format,
		ACCOUNT_FORMAT:account_format,
		HEX:HEX,
		H160:H160,
		CONTRACT_VALUE_FORMAT:HEX,
		BALANCE_FORMAT:utils.isBIGNUMBER,
		BLOCK_NUMBER_FORMAT:H160,
		BOOLEAN:_.isBoolean,
		ARRAY:_.isArray,
		STRING:_.isString,
		BINARY:BINARY
	},
	OBJECT:{
		VALID_BLOCK_OBJECT:VALID_BLOCK_OBJECT,
		VALID_SYNCING_INFO:VALID_SYNCING_INFO,
		VALID_TRANSACTION_RECEIPT:VALID_TRANSACTION_RECEIPT,
		VALID_WORKTEMPLATE:VALID_WORKTEMPLATE,
		VALID_SIGN_TRANSACTION:VALID_SIGN_TRANSACTION,
		VALID_TX:TX_OBJECT,
		COMPILE_RESUILT:COMPILE_RESUILT,
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
		  	message: 'Unable to unlock the account.',
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
		}
	}
	

	
};
/*
	error code -32602 messages:
		1. message:"Invalid RLP.", data:"RlpExpectedToBeList"
		2. message: 'Invalid params: Invalid bytes format. Expected a 0x-prefixed hex string with even length.'
		3. message":"Couldn't parse parameters: `params` should have at least 1 argument(s),data:"\"\
		4. message: 'Invalid params: invalid length 1, expected a tuple of size 2.'
*/
