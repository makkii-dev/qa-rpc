var chaiMatchPattern = require('chai-match-pattern');
var chai= require("chai");
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var utils = require("./utils");


var H160= /^0x[0-9a-f]{1,160}$/;
var H256= /^0x[0-9a-f]{1,256}$/;
var HEX=/^0x[0-9a-f]+$/;





const transaction_format=/^0x[0-9a-f]{64}$/;
const blockHash_format=H160;
const account_format=H256;

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


/*transaction_block: {
	"blockHash":null,
	"blockNumber":null,
	"chainId":null,
	"condition":null,
	"creates":null,
	"from":"0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c",
	"gas":"0xffffff",
	"gasPrice":"0x3",
	"hash":"0x4899fd166e6dfb08a473c0e9e6b565832567f99c6d2a767dda08c2b4b6ba7401",
	"input":"0x2345",
	"nonce":"0x0",
	"publicKey":"0x8bc5c4e5599afac7cb0efcb0010540017dda3e80870bb543b356867b2a8cacbf",
	"raw":"0xf89880a0a054340a3152d10006b66c4248cfa73e5725056294081c476c0e67ef5ad2533481f982234588000575b7455e451c83ffffff0301b8608bc5c4e5599afac7cb0efcb0010540017dda3e80870bb543b356867b2a8cacbf104883b7b23b1b5029bce3ea5cfc5bf1d72108fe197b68802bc9b685a7067b88e2109278631773933dd66f28629b62dd193e665f7c8c7baa0c962c91c4e5fc03",
	"sig":"0x8bc5c4e5599afac7cb0efcb0010540017dda3e80870bb543b356867b2a8cacbf104883b7b23b1b5029bce3ea5cfc5bf1d72108fe197b68802bc9b685a7067b88e2109278631773933dd66f28629b62dd193e665f7c8c7baa0c962c91c4e5fc03",
	"standardV":"0x0",
	"timestamp":"0x000575b7455e451c",
	"to":"0xa054340a3152d10006b66c4248cfa73e5725056294081c476c0e67ef5ad25334",
	"transactionIndex":null,
	"value":"0xf9"
}


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
		ERROR_32602:`{
			code:-32602,
			message:_.isString
			...
		}`,
		WRONG_PW_ERROR:{
			code:-32023,
			message:"Unable to lock the account",
			data:"InvalidPassword"
		},
		INVALID_METHOD:{
			code:-32601,
			message:"Method not found"
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