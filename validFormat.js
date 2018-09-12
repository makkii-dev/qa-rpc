var chaiMatchPattern = require('chai-match-pattern');
var chai= require("chai");
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();


var H160= /^0x[0-9a-f]{1,160}$/;
var H256= /^0x[0-9a-f]{1,256}$/;
var HEX=/^0x[0-9a-f]+$/;




const transaction_format=H160;
const blockHash_format=H160;
const account_format=H160;

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
		TRANSATION_FORMAT:transaction_format,
		ACCOUNT_FORMAT:account_format,
		HEX:HEX,
		H160:H160,
		CONTRACT_VALUE_FORMAT:HEX,
		BALANCE_FORMAT:HEX,
		BLOCK_NUMBER_FORMAT:H160,
		BOOLEAN:_.isBoolean,
		ARRAY:_.isArray,
		STRING:_.isString
	},
	OBJECT:{
		VALID_BLOCK_OBJECT:VALID_BLOCK_OBJECT,
		VALID_SYNCING_INFO:VALID_SYNCING_INFO,
		VALID_TRANSACTION_RECEIPT:VALID_TRANSACTION_RECEIPT,
		VALID_WORKTEMPLATE:VALID_WORKTEMPLATE,
		LOCKED_ERROR:{
			code:-32020,
			message:"Your account is locked. Unlock the account via CLI, personal_unlockAccount or use Trusted Signer.",
			data:"NotUnlocked"
		},
		ERROR_32602:{
			code:-32602,
			message:_.isString
		},
		WRONG_PW_ERROR:{
			code:-32023,
			message:"Unable to lock the account",
			data:"InvalidPassword"
		}
	},
	

	
};
/*
	error code -32602 messages:
		1. message:"Invalid RLP.", data:"RlpExpectedToBeList"
		2. message: 'Invalid params: Invalid bytes format. Expected a 0x-prefixed hex string with even length.'
		3. message":"Couldn't parse parameters: `params` should have at least 1 argument(s),data:"\"\
		4. message: 'Invalid params: invalid length 1, expected a tuple of size 2.'
*/