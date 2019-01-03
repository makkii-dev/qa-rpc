//test settings

//"use strict"
var logger = new (require("./utils/logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;

var process = require('process');
const fs = require('fs');
//test arguements variables
var DRIVER_PATH = "./test_cases/testDriver.csv";
var provider_type;

// internal dependencies
const validFormat= require("./utils/validFormat");
var readCSVDriver = require("./utils/readCSV");
const Provider = require("./utils/provider");
var utils = require("./utils/utils1");
var Helper = require("./utils/helper1");
var validationFunc= require('./utils/validateFunc');

//validate tools
var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var RLP = require("rlp");
var runMethod = it;




/**
* formParam: parse string of params to an array
* @param: str(String) params string in csv file
**/
function formParam(str,currentMethod){
	//logger.log("\n----parse params-----------------------\nparams:"+str);
	//logger.log("currentMethod:"+currentMethod);
	//logger.log("RUNTIME_VARIABLES: "+ JSON.stringify(RUNTIME_VARIABLES)+"\n-----------------------------");
	if((currentMethod=='eth_uninstallFilter'||currentMethod=='eth_getFilterLogs'||currentMethod == "eth_getFilterChanges")){

		return str===undefined||str===null?[RUNTIME_VARIABLES.lastFilterID]:[str];
	} 
	if(currentMethod == 'eth_compileSolidity'){
		let constract = fs.readFileSync(__dirname + '/testContracts/'+str, {
    		encoding: 'utf8'
		});
		//logger.log(constract);
		return [constract];
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
	if(currentMethod == 'eth_getTransactionByHash' || currentMethod == "eth_getTransactionReceipt") return str == undefined? [RUNTIME_VARIABLES.txHash]:(/^_/.test(str) && RUNTIME_VARIABLES[str.substr(1)]?[RUNTIME_VARIABLES[str.substr(1)]]:[str]);
	if(str===undefined) return[];
	//logger.log(param);
	var param =  str.split(' ');
	//logger.log(JSON.stringify(param));
	for(let i = 0; i < param.length;i++){
		if(param[i]=="true") param[i]=true;
		else if(param[i]=="false") param[i]=false;
		else if(param[i]=="null") param[i]=null;
		else if(/^{\S*}$/.test(param[i])) {
			param[i] = utils.str2Obj(param[i],",",":",RUNTIME_VARIABLES);
			
			if(currentMethod == 'eth_sendTransaction'|| currentMethod=="eth_signTransaction"||currentMethod=="personal_sendTransaction"){
				if(param[i].value) param[i].value = utils.dec2Hex(parseInt(param[i].value));
				if(param[i].gas) param[i].gas = utils.dec2Hex(parseInt(param[i].gas));
				if(param[i].gasPrice) param[i].gasPrice = utils.dec2Hex(parseInt(param[i].gasPrice));
				if(param[i].nonce) param[i].nonce = utils.dec2Hex(parseInt(param[i].nonce));
			}
			
		}else if(/^_/.test(param[i])){
			if(RUNTIME_VARIABLES[param[i].substr(1)]==undefined) throw new Error(param[i]+" is missing");
			param[i] = RUNTIME_VARIABLES[param[i].substr(1)];
		}else if((currentMethod=="personal_unlockAccount" && i == 2)/*||(currentMethod=="eth_getBlockByNumber" && i==0)*/){
			param[i]= parseInt(param[i]);
		}else if((currentMethod == "eth_sign" && i ==1)){
			param[i] = utils.string2Hex(param[i]);
		}
	}
	return param;
}


//load arguements from command line and create a provider
for(let i = 0; i < process.argv.length; i++){
	if(process.argv[i]=='--type') {
		provider_type= process.argv[++i];
		continue;
	}else if(process.argv[i]== "--testsuite"){
		DRIVER_PATH = process.argv[++i];
		continue;
	}else if(process.argv[i]== "--step"){
		runMethod = step;
	}
}
provider_type=provider_type||'default';
var cur_provider = new Provider({type:provider_type,logger:logger});
var helper = new Helper({provider:cur_provider,logger:logger});
var valFunc = new validationFunc(cur_provider,logger);

let newlogfilename = (DRIVER_PATH.match(/\w+\.csv/))[0]
logger.updatePath(newlogfilename.substring(0,newlogfilename.length-4));



//read driver file
var data = readCSVDriver(DRIVER_PATH);

//verify driver file
logger.log("Find "+data.length+" testcases:");


//runtime variables:


var RUNTIME_VARIABLES = require("./utils/RunVariable.js")();


var VERIFY_VARIABLES =(()=>{
	var self = {};
	self.vals = {};
	self.defaultGasPrice;
	utils.getGasPrice(cur_provider).then((resp)=>{
		self.defaultGasPrice = resp.result;
	})
	self.reset = ()=>{
		self.vals = {};
		return self;
	};
	return self;
})();




var EXPECT_RESP= (req_id, expect_result)=>{
	return {
		id: req_id,
		jsonrpc:cur_provider.rpc_version,
		result: expect_result
	}
}



data.forEach((testSuite)=>{
	describe(testSuite.name,()=>{
		logger.updatePath(testSuite.name);
		RUNTIME_VARIABLES.reset();
		VERIFY_VARIABLES.reset();
		
		let startTime;
		before(()=>{
			console.log(this)
			startTime = Date.now();
		})

		after(()=>{
			logger.log(`${testSuite.name} took ${(Date.now()-startTime)/1000} seconds`);
		})


		testSuite.tests.forEach((testRow)=>{
						
			it(`${testRow.prefix}:${testRow.testDescription}`, (done)=>{
				let title = `${testRow.prefix}:${testRow.testDescription}`;
				logger.title(title);
				logger.info(JSON.stringify(testRow));
				logger.info(JSON.stringify(this));
				RUNTIME_VARIABLES.preStoreVariables(testRow.preStoreVariables);
				testRow.params = formParam(testRow.params,testRow.method);
			
				var helperfunc = testRow.helper? helper[testRow.helper]:(params,a,b,c,done)=>{ return new Promise((resolve)=>{resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c});})};
				
				var helperParams;
				if(testRow.helper_params!=undefined){
					helperParams = formParam(testRow.helper_params);
				}else{
					helperParams = null;
				}
								
				var validPreFunc = (testRow.validateFunction && valFunc[testRow.validateFunction])? valFunc[testRow.validateFunction].pre: valFunc.default;
				
				var validPostFunc = (testRow.validateFunction && valFunc[testRow.validateFunction])? valFunc[testRow.validateFunction].post: valFunc.default;
				
				//helper function
				helperfunc(helperParams,RUNTIME_VARIABLES,testRow,VERIFY_VARIABLES)
					//validation pre func
					.then(validPreFunc,(e)=>{logger.error("after help:"+e.stack)})

					//test body and format validate
					.then(runOneRow,(e)=>{throw e;})

					//validation post func
					.then(validPostFunc,(e)=>{throw e})

					.then(()=>{
						if(testRow.helper !== undefined && testRow.helper == 'createPKAccount'){
							VERIFY_VARIABLES.vals.fromAcc = RUNTIME_VARIABLES.account.addr;
						}
						done();
					})
					.catch((e)=>{
						logger.error(e);
						done(e);
					});
			

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
				utils.getRawTx(cur_provider,testRow.params[0],RUNTIME_VARIABLES.account).then( (txObj)=>{

						RUNTIME_VARIABLES.rawTx = txObj.raw;
						RUNTIME_VARIABLES.actualTx = txObj.readable;
						VERIFY_VARIABLES.vals.toAcc = RUNTIME_VARIABLES.actualTx.to;
						VERIFY_VARIABLES.vals.actualTx = RUNTIME_VARIABLES.actualTx;
						console.log("\nvpreprocess\n");
						console.log(RUNTIME_VARIABLES.rawTx);
						testRow.params[0] = RUNTIME_VARIABLES.rawTx.rawTransaction;
						resolve(requestID);
					}
				);

			}else if(method==='eth_sendRawTransaction' && (params == undefined ||params.length== 0)){
				testRow.params=[RUNTIME_VARIABLES.txRaw];
				console.log(testRow.params)
				resolve(requestID);
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

				if(resp.result !==undefined){
					obj.result = resp.result;
					RUNTIME_VARIABLES.update(method,resp,params);
				}
				RUNTIME_VARIABLES.reassign(testRow.runtimeVal).storeVariables(testRow.storeVariables,resp);

				console.log(JSON.stringify(RUNTIME_VARIABLES));

				chai.expect(resp).contains({id:requestID,jsonrpc:cur_provider.rpc_version});
				try{
					switch(testRow.valid_method){
						case "value":
							if(/^_/.test(testRow.format_name)){
								chai.expect(resp).to.matchPattern(EXPECT_RESP(requestID,RUNTIME_VARIABLES[testRow.format_name.substring(1)]));
							}else{
								chai.expect(resp).to.matchPattern(EXPECT_RESP(requestID,JSON.parse(testRow.format_name)));
							}
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
									if(method=="eth_compileSolidity"){
										let contractName = Object.keys(resp.result)[0];
										chai.expect(resp.result[contractName]).to.matchPattern(validFormat.OBJECT[testRow.format_name]);
									}else{
										chai.expect(resp.result).to.matchPattern(validFormat.OBJECT[testRow.format_name]);
									}
									break;
								case "value":
									if(testRow.format_name)
										chai.expect(resp.result).to.matchPattern(validFormat.SINGLE[testRow.format_name]);
									if(testRow.arraySize){chai.expect(resp.result).to.have.lengthOf(parseInt(testRow.arraySize));}
									if(testRow.arrayValue){
										testRow.arrayValue.forEach((oneValue)=>{
											if(/^_/.test(oneValue)){
												oneValue =  RUNTIME_VARIABLES[oneValue.substr(1)];
											}
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
					resolve(obj);

				}catch(e){
					reject(e);
				}
		});
	});
}
	



