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
	blockBaseReward:JAVA_HEX,
 	blockTxFee:JAVA_HEX,
 	headerHash:JAVA_HEX,
	height:_.isNumber,
	previousblockhash:JAVA_HEX,
	target:JAVA_HEX
}


const VALID_LOGS={
	
}

/*{"jsonrpc":"2.0","result":
{"blockHeader":
	{"coinBase":"a07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137",
	"difficulty":"11",
	"energyConsumed":"0",
	"energyLimit":"e4e820",
	"extraData":"41494f4e00000000000000000000000000000000000000000000000000000000",
	"logsBloom":"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
	"number":"97f",
	"parentHash":"3c4735f912edb5fe3333822a16077832ae96f234e681131ac582e7e39ea8a6da",
	"receiptTrieRoot":"45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
	"stateRoot":"b9a4e87a91d54bbabc6fa28d4e107eff4ed8107bc2354feaa4aebd64ead4c9f9",
	"timestamp":"5c403d38",
	"txTrieRoot":"45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
	"version":"1"
	},
	"code":0,
	"headerHash":"77545ced7024cfd1315236bd305df016b3ae16fb06ac7ff5b02b2faac0ff8fdb",
	"message":null,
	"nonce":"0700000000000000000000000000000000000000000000000000000000000000",
	"solution":"006195c9fbe1ad99ec10a912197e1fe8a2c24bfa0cb32a72df0f4463fd179238a88435f6b2f8a90c576d293107d741a4feb43fc512f14a3b9bd2e236b9c610bd9d52127b9a172eb2b9eca2ecba6216ae37cc66d480793af102c6acb1b6758b697ccf4c1517e171c9a199a85b5dc207084117bb1257ad50df3a0830d6e71265e565a0abf91208b684196258fa4defa485059fce34885ee9b7bed11ac0b087f108acb9e81e4b75025faaf38a09aa6c4b9406ccbd6cc7849db121b80a547e129505475ba73581a31abf2744f1da8397f7464c2fb6ce023385be86e9fcdf22d95b66f29989182a32dc90fee6c0e32efb427dae3d3656da7704c6ad316745d9c1358f3dad6cb878f928d30d98efc15af4e84ed9c8d9131e1854b21a432f70858b1ac3fcbdeb16fd13de759a25504f0ce7b7c142b0d8702de1e15265c9ae5a7a659748b537aee7384586ede3323333819bdd885a943ba6684605ade34d0ca9e2ff9e4700d13b42da06e3d3b2212d99584398553a3fb76cfe4403606d117ed07412636c3d7dc0bb60ff2abba3eda39105eaf01b31618257a40dbd9b4f5b7560db967df5534529c75723cf74658ed71b553b66c507a7b5674cb9484b08d5a31db943dd027edbbb0c88b86d8644db9758de04173e867588ca6d8731e4cd2c0325dea7d2f3af8c8cce0fcf51063be461cc3acc3b49013fc0dd44cd7ca349542c01e704d7e535129e059e41dbbd1d3b285f2c79a43c0c3f6d7136884841a7f5423d906eec434a349133eefe1af4e2d8433ad7b8b7cf06345f5d2e2077f0a2bc37ee25ad09f8e6c60d1e61b55a2622323bdf441cbe75dfe92e065eaed0c655e2f13c3b39b058f4f48b02f0ffa52915e82bfc455284a5aeb3557fe9db4e9f8b1e2a3c44e124bd7e75040e735b3d38f44ef849f4cd26323f320c2b1955dbb7151a543d35ce6a2dc0c23b6274d8fa24a82f1de135e803022bcaa86b803d0af35162e3fac07a4ff900863ec719c35ea1a853ce7205e3e6197a72bc765fd10b1edbed52b90064eedb703c6e2a43ec8b3ed03c66dd03e84bf80a83db467757c3494b238dd235283ddb2f5a0736124ae351b8fe73392b35df3f21467afc7177ef6f01353870ea838ba32a34a20295b81a0c7b06b87c8fc1094d16405c648bdf2b6a5821ca6ed2ae6990d869f03421c26fbce2f9aaa97e69ab512341866c96dad739137432933b5a73573aba5fa6f34ed5a63da13d1010bffd5302199c56a392672bcff28f6447b1c03fee6eae3be3370789d5f384e142d9d6265412f8d10a063a96cdb72c8f0239b37cff89d2db2790c32527dd1f91c94501b2503b141285a49979624d2b2eeda12c62a5ba2b3db72fe2a4021c99343a18b6dae8abd93dda7900a82521033cacd31f7f2782b3468ebd9d07922faf323b23d3971d1c752e0eb1a0fa73876325a2d1e9676579da622d89a478b1256bd69deb1d18a1fe6cf717a9bfb73d943c33b93b1fcf00c799d0a253a2a8da0ca347964ad32987fa2576775207bd1acffce9bf2df2c399897cf23fabddc2e23ade13176115840f6731133d20af4ab88dd9c1b61836bf0ff82148c51cacc581da2fe43d6ab626e3a7b76c8caf059d013d16099f6140f4a2a22b0aee2225b27191c5bb52a007ba27b796099d7db10fcb8db74b6f5ddf09e0ff9caf0ac2db6f7d50b59b0342d1836c02634dad1562f6d1c818984a96b799bca1febe4b4fd86394f948ccb0ec32200391478d31c3dcfd6484f23a488a268a96bdc1e245e015369bcd13e4d0ec2b2c89638a9626b54e4699bd0b1d084a0653faa243a60f1bf30e6b054d2436be7fb0f387156168cbe80e71ff3e252c25119fe957c34a17787e1e08deeed605075b997b8a4337ebcb4e4aed0b12f5519031a0cfe910b39b76d9e1726beabb285de981607c0b740fe82fa7aaae977e3a80d932efbf35efe6c7fde825852dc40d9f1fef316d7ecdfb3324a205181fc0f9ffd630"
	},"id":"Smoke-other-9"}
*/



var VALID_BLOCK_HEADER = {
	blockHeader:{
		coinBase:JAVA_HEX,
		difficulty:JAVA_HEX,
		energyConsumed:JAVA_HEX,
		energyLimit:JAVA_HEX,
		extraData:JAVA_HEX,
		logsBloom:JAVA_HEX,
		number:JAVA_HEX,
		parentHash:JAVA_HEX,
		receiptTrieRoot:JAVA_HEX,
		stateRoot:JAVA_HEX,
		timestamp:JAVA_HEX,
		txTrieRoot:JAVA_HEX,
		version:_.isString
	},
	code:_.isNumber,
	headerHash:JAVA_HEX,
	message:_.isNull,
	nonce:JAVA_HEX,
	solution:JAVA_HEX
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

		VALID_BLOCK_HEADER:VALID_BLOCK_HEADER,

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
			//console.log("\n\n\n\n");
			expect(resolution.result).to.equal(params[1]);
			break;
		case "length":
			if(params[2]){
				expect(resolution.result).to.have.lengthOf(parseInt(params[2])-parseInt(params[1]));
			}else{
				expect(resolution.result).to.have.lengthOf(params[1]);
			}
			break;
		case "contract":
			Object.values(resolution.result).forEach((value,index)=>{
				expect(value).to.matchPattern(formates.COMPILE_RESUILT);
			})
			break;
		default:
			expect(resolution.result).to.matchPattern(formates[params[1]]);

	}

	//rt.reassign(row.runtimeVal).storeVariables(row.storeVariables,resolution);
	return Promise.resolve(resolution);
}