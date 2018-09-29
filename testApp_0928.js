//test settings
var logger = new (require("./utils/logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;

var process = require('process');

//test arguements variables
var DRIVER_PATH = "./test_cases/testDriver.csv";
var provider_type;

// internal dependencies
const validFormat= require("./utils/validFormat");
var readCSVDriver = require("./utils/readCSV");
const Provider = require("./utils/provider");
var utils = require("./utils/utils");
var Helper = require("./utils/helper1");
var validationFunc= require('./utils/validateFunc');

//validate tools
var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var RLP = require("rlp");


//runtime variables:
var helper;
var RUNTIME_VARIABLES=(()=>{
	var self = this;
	this.name = "RUNTIME_VARIABLES";
	this.update=(method,resp,req)=>{
	
		switch(method){
			case "eth_newPendingTransactionFilter":
			case "eth_newBlockFilter":
				self.lastFilterID = resp.result;
				break;
			case "personal_newAccount":
				self.newAccount = resp.result;
				self.newPassword = req[1];
				break;
			case "eth_getBlockByNumber":
			case "eth_getBlockTransactionCountByNumber":
				self.blockHash = resp.result.hash;
				break;
			case "eth_sendRawTransaction":
			case "eth_sendTransaction":
				self.transactionHash = resp.result;
				break;
			case "eth_signTransaction":
				self.transactionHash = resp.result.tx.hash;
				break;
			case "pairKeyCreateAcc":
				self.account = resp;
				break;
		}
	}
	this.reset = ()=>{
		self = new self();
	}
	return self;
})();

var VERIFY_VARIABLES =(()=>{
	var self = this;
	this.vals = {};
	this.reset = ()=>{
		delete self.vals;
		self.vals = {};
	}
	return self;
})();


var EXPECT_RESP= (req_id, expect_result)=>{
	return {
		id: req_id,
		jsonrpc:cur_provider.rpc_version,
		result: expect_result
	}
}

/**
* formParam: parse string of params to an array
* @param: str(String) params string in csv file
**/
function formParam(str,currentMethod){
	if((currentMethod=='eth_uninstallFilter'||currentMethod=='eth_getFilterLogs'||currentMethod == "eth_getFilterChanges")){
		return str==undefined?[RUNTIME_VARIABLES.lastFilterID]:[str];
	} 
	if(currentMethod=='eth_getBlockTransactionCountByHash') return str==undefined?[RUNTIME_VARIABLES.blockHash]:[str];
	if(currentMethod=='eth_getBlockByHash'){
		if(str===undefined) return [RUNTIME_VARIABLES.blockHash];
		let params =  str.split(' ');
		if(/^0x[0-9a-f]$/.test(params[0])) return params;
		params[0]=RUNTIME_VARIABLES.blockHash;
		if(params[1]) params[1] = JSON.parse(params[1]);
		return params;
	} 
	if(str===undefined) return[];
	//logger.log(param);
	var param =  str.split(' ');
	//logger.log(JSON.stringify(param));
	for(let i = 0; i < param.length;i++){
		if(param[i]=="true") param[i]=true;
		else if(param[i]=="false") param[i]=false;
		else if(param[i]=="null") param[i]=null;
		else if(/^{\S*}$/.test(param[i])) {
			param[i] = utils.str2Obj(param[i],",",":");
			
			if(currentMethod == 'eth_sendTransaction'||currentMethod=="eth_signTransaction"){
				if(param[i].value) param[i].value = utils.dec2Hex(parseInt(param[i].value));
				if(param[i].gas) param[i].gas = utils.dec2Hex(parseInt(param[i].gas));
				if(param[i].gasPrice) param[i].gasPrice = utils.dec2Hex(parseInt(param[i].gasPrice));
			}
			
		}else if((currentMethod=="personal_unlockAccount" && i == 2)/*||(currentMethod=="eth_getBlockByNumber" && i==0)*/){
			param[i]= parseInt(param[i]);
		}else if((currentMethod == "eth_sign" && i==1)){
			param[i] = utils.string2Hex(param[i]);
		}
	}
	return param;
}


//load arguements from command line and create a provider
for(let i = 0; i < process.argv.length; i++){
	if(provider_type && DRIVER_PATH) break;
	if(process.argv[i]=='--type') {
		provider_type= process.argv[++i];
		continue;
	}else if(process.argv[i]== "--testsuite"){
		DRIVER_PATH = process.argv[++i];
		continue;
	}
}
provider_type=provider_type||'default';
var cur_provider = new Provider({type:provider_type,logger:logger});
helper = new Helper({provider:cur_provider,logger:logger});
var valFunc = new validationFunc(cur_provider);


//read driver file
var data = readCSVDriver(DRIVER_PATH);

//verify driver file
logger.log("Find "+data.length+" testcases:");

data.forEach((testSuite)=>{
	describe(testSuite.name,()=>{
/*		
		var requestID = testRow.prefix+"-"+testRow.id;
		if(testRow.execute=='x'){
			it(`${testRow.prefix}:${testRow.testDescription}`, (done)=>{
			currentMethod = testRow.method;
			var params = formParam(testRow.params);
			logger.log("\n test log for ");
			logger.log(testRow);	
			if(testRow.helper){
				helper[testRow.helper](testRow.timeout).then((pre_process_variables)=>{
					if(pre_process_variables){
						
					}
					runOneRow(testRow,requestID, params,done);
				});
			}else{
				runOneRow(testRow,requestID, params,done);
			}

			}).timeout(30*1000);
		}
*/
		testSuite.tests.forEach((testRow)=>{
		
			testRow.params =formParam(testRow.params,testRow.method);
			step(`${testRow.prefix}:${testRow.testDescription}`, (done)=>{
				var helperfunc = testRow.helper? helper[testRow.helper]:(params,a,b,c,done)=>{ return new Promise((resolve)=>{resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c});})};
				var helperParams = testRow.helper_params? formParam(testRow.helper_params)[0]:null;
				var validPreFunc = (testRow.validateFunction && valFunc[testRow.validateFunction])? valFunc[testRow.validateFunction].pre: valFunc.default;
				var validPostFunc = (testRow.validateFunction && valFunc[testRow.validateFunction])? valFunc[testRow.validateFunction].post: valFunc.default;
				helperfunc(helperParams,RUNTIME_VARIABLES,testRow,VERIFY_VARIABLES)
					.then(validPreFunc,(e,done)=>{throw e;})
					.then(runOneRow,(e)=>{throw e;})
					.then(validPostFunc,(e)=>{throw e})
					.then(()=>{
					if(testRow.helper !== undefined && testRow.helper == 'createPKAccount'){
						VERIFY_VARIABLES.vals.fromAcc = RUNTIME_VARIABLES.account.addr;
					}
					
					
					done();},(e)=>{done(e)});
			//helper func
			//valid pre func
			//main && valid format
			//valid post func
				
			},40*1000);
		});
	
	});
});



function runOneRow(obj){
	var testRow = obj.testRow;
	var done = obj.done;
	var requestID = testRow.prefix+"-"+testRow.id;
	var method = testRow.method;
	var params = testRow.params;
	
	
	var preprocess = ()=>{
		
		return new Promise((resolve)=>{
			logger.log(RUNTIME_VARIABLES.account);
			if(method==='eth_sendRawTransaction' && RUNTIME_VARIABLES.account!==undefined){
				utils.getRawTx(cur_provider,testRow.params[0],RUNTIME_VARIABLES.account).then( (rawTxObj)=>{

						RUNTIME_VARIABLES.rawTx = rawTxObj;
						RUNTIME_VARIABLES.actualTx = testRow.params[0];
						VERIFY_VARIABLES.vals.toAcc = RUNTIME_VARIABLES.actualTx.to;
						console.log("\nvpreprocess\n");
						console.log(RUNTIME_VARIABLES.rawTx);
						testRow.params[0] = RUNTIME_VARIABLES.rawTx.rawTransaction;
						resolve(requestID);
					}
				);

			}else{
				resolve(requestID);
			}
		});
	}
	
	return new Promise((resolve,reject)=>{

		preprocess()
			.then((requestID)=>{
				return cur_provider.sendRequest(requestID,testRow.method,testRow.params);
			})
			.then((resp)=>{
				chai.expect(resp).contains({id:requestID,jsonrpc:cur_provider.rpc_version});
				try{
					switch(testRow.valid_method){
						case "value":
							chai.expect(resp).to.matchPattern(EXPECT_RESP(requestID,JSON.parse(testRow.format_name)));
							break;
						case "exactvalue":
							chai.expect(resp).to.matchPattern(EXPECT_RESP(requestID,testRow.format_name));
							break;
						case "format":
							switch(testRow.valid_type){
								case "array":

									resp.result.forEach((item)=>{
										chai.expect(item).to.matchPattern(validFormat.SINGLE[testRow.format_name]);
									});
									break;
								case "object":
									chai.expect(resp.result).to.matchPattern(validFormat.OBJECT[testRow.format_name]);
									break;
								case "value":
									chai.expect(resp.result).to.matchPattern(validFormat.SINGLE[testRow.format_name]);
									if(testRow.arraySize){chai.expect(resp.result).to.have.lengthOf(parseInt(testRow.arraySize));}
									if(testRow.arrayValue){
										testRow.arrayValue.forEach((oneValue)=>{
											chai.expect(resp.result).to.contains(oneValue);
										});
									}
									break;
								case "error":
									chai.expect(resp.error).to.matchPattern(validFormat.OBJECT[testRow.format_name]);

								default:

							}
							break;
						default:
							if(testRow.formate_name)
							chai.expect(resp).to.matchPattern(EXPECT_RESP(requestID,JSON.parse(testRow.format_name)));;
					}

					RUNTIME_VARIABLES.update(method,resp,params);
					resolve(obj);

				}catch(e){
					reject(e);
				}
		},(err)=>{
			reject(err);

		});
	});
}
	

