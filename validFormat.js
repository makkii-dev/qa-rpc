var chaiMatchPattern = require('chai-match-pattern');
var chai= require("chai");
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();


var H160= /^0x[0~9a~f]{1-160}$/;
var H256= /^0x[0~9a~f]{1-256}$/;
var HEX=/^0x[0~9a~f]+$/;




const transaction_format=H160;
const blockHash_format=H160;
const account_format=H160;

var VALID_BLOCK_OBJECT={
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
	solution:H160,
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


const VALID_ERROR = {
};

module.exports={
	SINGLE:{
		TRANSATION_FORMAT:transaction_format,
		ACCOUNT_FORMAT:account_format,
		HEX:HEX,
		H160:H160,
		CONTRACT_VALUE_FORMAT:HEX,
		BALANCE_FORMAT:HEX,
		BLOCK_NUMBER_FORMAT:H160
	},
	OBJECT:{
		VALID_BLOCK_OBJECT:VALID_BLOCK_OBJECT,
		VALID_SYNCING_INFO:VALID_SYNCING_INFO
	}
};
