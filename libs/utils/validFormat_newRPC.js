var chaiMatchPattern = require('chai-match-pattern');
var chai= require("chai");
chai.use(chaiMatchPattern);
var expect = chai.expect;
var _ = chaiMatchPattern.getLodashModule();
var utils = require("./utils2");


_.isH160= /^0x[0-9a-f]{160}$/;
_.isH256= /^0x[0-9a-f]{256}$/;
_.isH64=/^0x[0-9a-f]{64}$/;
_.isHEX=/^0x[0-9a-f]*$/;
_.isJAVA_HEX = /^[0-9a-f]*$/
_.isBINARY=()=>{return {test:(val)=>(/^0x[0-9a-f]*$/.test(val) && val.length%2===0)}};



_.iscode_format = _.isHEX;
_.istransaction_format =_.isH64;
_.isblockHash_format = _.isH64;
_.isaccount_format = _.isH64;
_.ispublic_key = _.isH64;
_.isNULL_N_HEX = ()=>{
		return {test:(value)=>{return HEX.test(value)|| _.isNull(value);}};
	}
_.isNULL_N_INT = ()=>{return {test:(value)=>{return _.isNull(value) || _.isNumber(value);}}};

const VALID_BLOCK_OBJECT={
	difficulty:_.isHEX,
	extraData:_.isHEX,
	gasLimit:_.isHEX,
	gasUsed:_.isHEX,
	hash:_.isH160,
	logsBloom:_.isHEX,
	miner:_.isH160,
	nonce:_.isNULL_N_HEX,
	number:_.isNumber,
	parentHash:_.isH160,
	receiptsRoot:_.isH160,
	size:_.isHEX,
	solution:_.isNULL_N_HEX,
	stateRoot:_.isH160,
	timestamp:_.isHEX,
	totalDifficulty:_.isHEX,
	transactions:_.isArray,
	transactionsRoot:_.istransaction_format
}

const VALID_FULL_BLOCK_OBJECT =```
		difficulty:_.isHEX,
		extraData:_.isHEX,
		gasLimit:_.isHEX,
		gasUsed:_.isHEX,
		hash:_.isH160,
		logsBloom:_.isHEX,
		miner:_.isH160,
		nonce:_.isNULL_N_HEX,
		number:_.isNumber,
		parentHash:_.isH160,
		receiptsRoot:_.isH160,
		size:_.isHEX,
		solution:_.isNULL_N_HEX,
		stateRoot:_.isH160,
		timestamp:_.isHEX,
		totalDifficulty:_.isHEX,
		transactions:{
			<=: {
				nrgPrice:_.isHEX,
				nrg:_.isHEX,
				transactionIndex:_.isHEX,
				nonce:_.isHEX,
				input:_.isHEX,
				blockNumber:_.isH64,
				gas:_.isHEX,
				gasPrice:_.isHEX,
				from:_.isaccount_format,
				to:_.isaccount_format,
				value:_.isHEX,
				hash:_.istransaction_format,
				timestamp:_.isHEX
			}
		},
		transactionsRoot:_.istransaction_format
```

const VALID_SYNCING_INFO = {
       startingBlock: _.isHEX,
       currentBlock: _.isHEX,
       highestBlock: _.isHEX
			 // ,
       // blockGap: _.isArray
};

const VALID_TRANSACTION_RECEIPT = {
	    blockHash:  _.isNULL_N_HEX,
        blockNumber:  _.isNULL_N_HEX,
        contractAddress:  _.isNULL_N_HEX,
        cumulativeGasUsed:  _.isHEXHEX,
        from:  _.isaccount_format,
        to:  _.isaccount_format,
        gasUsed:  _.isHEX,
				gasPrice: _.isHEX,
        logs: _.isArray,
        logsBloom: _.isH256,
        /*Quantity - ‘0x0’ indicates transaction failure , ‘0x1’ indicates transaction success. Set for blocks mined after Byzantium hard fork EIP609, null before.*/
        status:_.isHEX,
        transactionHash: _.istransaction_format,
        transactionIndex: _.isHEX,
        cumulativeNrgUsed: _.isHEX,
        nrgPrice:_.isHEX,
        nrgUsed:_.isHEX

}

const TX_OBJECT= {
	blockHash:_.isNULL_N_HEX,
	blockNumber:_.isNULL_N_HEX,
	chainId:_.isNULL_N_HEX,
	contractAddress:_.isNULL_N_HEX,
	from:_.isaccount_format,
	gas:_.isHEX,
	gasPrice:_.isHEX,
	hash:_.istransaction_format,
	input:_.isBINARY,
	nonce:_.isHEX,

	timestamp:_.isHEX,
	to:_.isaccount_format,
	transactionIndex:_.isNULL_N_HEX,
	value:_.isHEX,
	nrg:_.isHEX,
	nrgPrice:_.isHEX
}



const VALID_SIGN_TRANSACTION = {
	raw: _.isHEX,
	tx:{
		nrgPrice:_.isHEX,
		gasPrice:_.isHEX,
		input:_.isHEX,
		nrg:_.isHEX,
		gas:_.isHEX,
		to: _.isaccount_format,
		nonce:_.isHEX,
		value:_.isHEX,
		hash:_.istransaction_format,
		timestamp:_.isHEX,
		signature:_.isHEX,
		type:_.isString
	}
}



const COMPILE_RESUILT={

		code:_.isHEX,
		info:{
			abiDefinition:_.isArray,
			compilerVersion:_.isString,
			language:_.isString,
			languageVersion:_.isString,
			source:_.isString
		}

}

const VALID_WORKTEMPLATE={
	blockBaseReward:_.isJAVA_HEX,
 	blockTxFee:_.isJAVA_HEX,
 	headerHash:_.isJAVA_HEX,
	height:_.isNumber,
	previousblockhash:_.isJAVA_HEX,
	target:_.isJAVA_HEX
}


const VALID_LOGS={

}

var VALID_BLOCK_HEADER = {
	blockHeader:{
		coinBase:_.isJAVA_HEX,
		difficulty:_.isJAVA_HEX,
		energyConsumed:_.isJAVA_HEX,
		energyLimit:_.isJAVA_HEX,
		extraData:_.isJAVA_HEX,
		logsBloom:_.isJAVA_HEX,
		number:_.isJAVA_HEX,
		parentHash:_.isJAVA_HEX,
		receiptTrieRoot:_.isJAVA_HEX,
		stateRoot:_.isJAVA_HEX,
		timestamp:_.isJAVA_HEX,
		txTrieRoot:_.isJAVA_HEX,
		version:_.isString
	},
	code:_.isNumber,
	headerHash:_.isJAVA_HEX,
	message:_.isNull,
	nonce:_.isJAVA_HEX,
	solution:_.isJAVA_HEX
}


var formats ={

		TRANSACTION_HASH:_.istransaction_format,
		ACCOUNT_FORMAT:_.isaccount_format,
		HEX:_.isHEX,
		H160:_.isH160,
		CONTRACT_VALUE_FORMAT:_.isHEX,
		BALANCE_FORMAT:utils.isBIGNUMBER,
		BLOCK_NUMBER_FORMAT:_.isNumber,
		BOOLEAN:_.isBoolean,
		ARRAY:_.isArray,
		STRING:_.isString,
		BINARY:BINARY,
		NUMBER:_.isNumber,
		NULL:_.isNull,

		VALID_BLOCK_OBJECT:VALID_BLOCK_OBJECT,
		VALID_FULL_BLOCK_OBJECT:VALID_FULL_BLOCK_OBJECT,
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
			pubsub:'1.0',
			rpc:'1.0',
			stratum:'1.0',
			web3:'1.0',
			ping:'1.0'
		},

		VALID_BLOCK_HEADER:VALID_BLOCK_HEADER,

		LOCKED_ERROR:{
			code:2,
			message:"Unauthorized",
			data:"NotUnlocked"
		},
		LOCKED_INVALID_ACC_ERROR:{
			code:2,
			message:"Unauthorized",
			data:"SStore(InvalidAccount)"
		},
		PARAMS_FORMAT_ERROR:`{
			code:-32602,
			message:_.isString
			...
		}`,


		// WRONG_PW_ERROR:{
		// 	code:-32023,
		// 	message:_.isString,
		// 	data:"InvalidPassword"
		// },
		// INVALID_ACC_ERROR:{
		// 	code: -32023,
		//   	message: /Unable to \w*lock the account/,
		//   	data: 'InvalidAccount'
		// },
		INVALID_METHOD:{
			code:-32601,
			message:"Method not found"
		},

		/*
		// Expect error code upate to 3

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
  		}
     */
		 EXECUTION_ERROR:`{
			 code:3
			 ...
		 }`


  		// PERSONAL_INVALID_PASSWORD:`{
  		// 	code: -32021,
  		// 	data: /InvalidPassword/
  		// 	...
  		// }`


};


module.exports = function(row, rt, resolution){
	let params = row.params;
	console.log(params);
	console.log("validateFormate: ",resolution.result,resolution.error)
	switch(params[0]){

		case 'error':
			expect(resolution.error).to.matchPattern(formats[params[1]]);
			break;
		case "errorCode":
			expect(resolution.error.code).to.equal(params[1]);
			break;
		case 'contains':
			expect(resolution.result).to.include(params[1]);
			break;
		case 'deployedCode':
			resolution.result = resolution.result.substring(2);
			params[1] = params[1].substring(params[1].length-resolution.result.length);
			//console.log(resolution.result.length + "\t"+params[1].length);
			expect(resolution.result).to.equal(params[1]);
			break;
		case 'equal':
			if(params[2]){
				let chain = params[2].split('.');
				let actualValue = resolution.result;
				chain.forEach((value,index)=>{
					if(!isNaN(value)){
						value = parseInt(value);
					}
					actualValue = actualValue[value];
				});
				if((typeof params[1] != typeof actualValue) && (typeof params[1] =='number' || typeof actualValue == 'number')){
					params[1]=parseInt(params[1]);
					actualValue = parseInt(actualValue);
				}
				expect(actualValue).to.equal(params[1]);
			}else{
				expect(resolution.result).to.equal(params[1]);
			}
			break;
		case "length":
			if(params[2]){
				expect(resolution.result).to.have.lengthOf(parseInt(params[2])-parseInt(params[1]));
			}else{
				expect(resolution.result).to.have.lengthOf(parseInt(params[1]));
			}
			break;
		case "contract":
			Object.values(resolution.result).forEach((value,index)=>{
				expect(value).to.matchPattern(formats.COMPILE_RESUILT);
			});
			break;
		case "atLeast":
			if(params[2]){
				expect(parseInt(resolution.result)).to.be.at.least(parseInt(params[2])-parseInt(params[1]));
			}else{
				expect(parseFloat(resolution.result)).to.be.at.least(parseFloat(params[1]));
			}
			break;
		default:
			expect(resolution.result).to.matchPattern(formats[params[1]]);

	}

	//rt.reassign(row.runtimeVal).storeVariables(row.storeVariables,resolution);
	return Promise.resolve(resolution);
}
