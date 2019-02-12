//test settings
"use strict"
var logger = new (require("./libs/utils/logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;

var process = require('process');
const fs = require('fs');
// test arguements variables
var DRIVER_PATH = "./test_cases/rust_java_output.csv";
var provider_type;

// internal dependencies
const validFormat= require("./libs/utils/validFormat");
var readCSVDriver = require("./libs/utils/readCSV");
const Provider = require("./libs/utils/provider");
var utils = require("./libs/utils/utils1");
var Helper = require("./libs/utils/helper");
// var validationFunc= require('./utils/validateFunc');

//validate tools
var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var RLP = require("rlp");
var runMethod = it;

var providers = {list:[]};



/**
* formParam: parse string of params to an array
* @param: str(String) params string in csv file
**/
function formParam(str,currentMethod,RUNTIME_VARIABLES){
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
			
			if(currentMethod == 'eth_sendTransaction'|| currentMethod=="eth_signTransaction"){
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
		}else if((currentMethod == "eth_sign" && i==1)){
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
//var helper = new Helper({provider:cur_provider,logger:logger});
//var valFunc = new validationFunc(cur_provider,logger);

let newlogfilename = (DRIVER_PATH.match(/\w+\.csv/))[0]
logger.updateName(newlogfilename.substring(0,newlogfilename.length-4));



//read driver file
var data = readCSVDriver(DRIVER_PATH);

//verify driver file
logger.log("Find "+data.length+" testcases:");


//runtime variables:
function RUNTIMEVARIABLES(obj){
	var self = this;
	this.name = "RUNTIME_VARIABLES";
	Object.keys(obj).forEach((key,index)=>{
		self[key] = obj[key];
	});

	this.update=(method,resp,req)=>{
	
		switch(method){
			case "eth_newPendingTransactionFilter":
			case "eth_newBlockFilter":
			case "eth_newFilter":
				self.lastFilterID = resp.result;
				break;
			case "personal_newAccount":
				self.newAccount = resp.result;
				self.newPassword = req[1];
				break;
			case "eth_getBlockByNumber":
			//case "eth_getBlockTransactionCountByNumber":
				self.blockHash = resp.result.hash;
				break;
			case "eth_sendRawTransaction":
			case "eth_sendTransaction":
				self.txHash = resp.result;
				if(/contract/.test(resp.id)){
					self.contract.hash = resp.result;
				}
				break;
			case "eth_signTransaction":
				//console.log(resp.result.tx);
				self.txHash = resp.result.tx.hash;
				self.txRaw = resp.result.tx.raw;
				break;
			case "pairKeyCreateAcc":
				self.account = resp;
				break;
			case "eth_compileSolidity":
				self.contract = {};
				let contractname = Object.keys(resp.result)[0];
				//console.log(contractname);
				self.contract.name = contractname;
				if(/^0x/.test(resp.result[contractname].code)){
				 	self.contract.code = resp.result[contractname].code
				}else{
					self.contract.code ="0x"+ resp.result[contractname].code;
				}
				self.contract.func = {};
				self.contract.event = {};
				resp.result[contractname].info.abiDefinition.forEach((item)=>{
					if(item.type == "function"){
						
						self.contract.func[item.name] = item;
					}else{
						
						self.contract.event[item.name] = item;
					}
				})
				
				break;
			case "eth_getTransactionReceipt":
				if(resp.result !=null && resp.result.contractAddress !==undefined && resp.result.contractAddress !==null)
					self.contractAddress = resp.result.contractAddress;
				break;
			case "eth_getTransactionByHash":
				if(resp.result.creates!==undefined && resp.result.creates!==null)
				self.contractAddress = resp.result.creates;
				break;
			case "eth_getTransactionCount":
				self.nonce = resp.result;
				break;
			case "eth_coinbase":
				self.coinbase = resp.result;
				break;
			case "eth_blockNumber":
				self.blockNumber = resp.result;
				break;
		}
	}
	this.reset = ()=>{
		self = Object.create(self);
	}
	return this;
};




var EXPECT_RESP= (req_id, expect_result)=>{
	return {
		id: req_id,
		jsonrpc:cur_provider.rpc_version,
		result: expect_result
	}
}

function createProviderFromConfig(providers,config_string,name){
	name = name?name:"default";
	//if provider with the given name not exist, create one
	if(providers[name]==undefined){
		providers.list.push(name);
		providers[name]={};
		if(config_string!==undefined){
			let config_obj = utils.str2Obj(config_string,",",":");
			providers[name].RUNTIME_VARIABLES = new RUNTIMEVARIABLES(config_obj);
			providers[name].provider = new Provider({type:config_obj.type,logger:logger}).Path(config_obj.path+":"+config_obj.port);


		}else{
			providers[name].RUNTIME_VARIABLES = new RUNTIMEVARIABLES({});
			providers[name].provider = new Provider({type:provider_type,logger:logger});
		}
		providers[name].helper = new Helper({provider:providers[name].provider,logger:logger});
	}else{
		// if provider with the given name exist, update the provider config;
		if(config_string !== undefined){
			let config_string = utils.str2Obj(config_string,",",":");
			providers[name].RUNTIME_VARIABLES = new RUNTIMEVARIABLES(config_obj);
			providers[name].provider.Type(config_obj.type).Path(config_obj.path+":"+config_obj.port);
		}else{
			providers[name].RUNTIME_VARIABLES =  new RUNTIMEVARIABLES();
		}

	}
	//onsole.log(providers[name].helper);
}



data.forEach((testSuite)=>{
	describe(testSuite.name,()=>{
		logger.updateName(testSuite.name);


	/*{type:http,
	path:127.0.0.1:8547,
	account0:0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c,
	account1:0xa054340a3152d10006b66c4248cfa73e5725056294081c476c0e67ef5ad25334,
	password:password}*/	
		console.log(testSuite);
		
		if(testSuite.rust) createProviderFromConfig(providers, testSuite.rust, "rust");
		if(testSuite.java) createProviderFromConfig(providers, testSuite.java, "java");
		if(providers.list.length == 0) createProviderFromConfig(providers);
		
		testSuite.tests.forEach((testRow)=>{
						
			runMethod(`${testRow.prefix}:${testRow.testDescription}`, (done)=>{
				logger.log(JSON.stringify(testRow));
				
			
				var helpName = testRow.helper? testRow.helper:"default";
				
				var helperArr = new Array(providers.list.length);
				var oneRowArr = new Array(providers.list.length);

				providers.list.forEach((oneProvider,index)=>{

					providers[oneProvider].params = formParam(testRow.params,testRow.method,providers[oneProvider].RUNTIME_VARIABLES);
					if(testRow.helper_params!=undefined){
						providers[oneProvider].helperParams = formParam(testRow.helper_params,undefined,providers[oneProvider].RUNTIME_VARIABLES);
					}else{
						providers[oneProvider].helperParams = null;
					}
					
					helperArr[index] = providers[oneProvider].helper[helpName](providers[oneProvider],testRow);
				});
				
				//console.log(helperArr);
								
				
				//helper function
				//helperfunc(helperParams,RUNTIME_VARIABLES,testRow,VERIFY_VARIABLES)
				
				Promise.all(helperArr)
					//validation pre func

					//test body and format validate
					.then((resps)=>{
						//console.log(resps);
						resps.forEach((resp,index)=>{
							oneRowArr[index] = runOneRow(resp);
						})
						return Promise.all(oneRowArr);
					},(e)=>{throw e;})

					//validation post func
					.then((results)=>{

						let err =resultComparision(results[0],results[1]);
						if(testRow.restrict){
							try{
								chai.expect(results[0]).to.equal(results[1]);
							}catch(error){
								err.push(JSON.stringify(results[0]));
								err.push(JSON.stringify(results[1]));
								err.push(error);
							}
						}

						if(err.length == 0)
							done();
						else{
							let errmessage = err.join("\n");
							throw new Error(errmessage);
						}
					})
					.catch((e)=>{
						logger.error(e);
						done(e);
					});
			

			});
		});
	
	});
});



function runOneRow(obj){
	var testRow = obj.testRow;

	var requestID = testRow.prefix+"-"+testRow.id;
	var method = testRow.method;
	var params = obj.provider.params;
	var RUNTIME_VARIABLES = obj.provider.RUNTIME_VARIABLES;
	var provider = obj.provider.provider;
	
	
	var preprocess = ()=>{
		
		return new Promise((resolve)=>{
			//logger.log(RUNTIME_VARIABLES.account);
			if(method==='eth_sendRawTransaction' && RUNTIME_VARIABLES.account!==undefined){
				utils.getRawTx(cur_provider,params[0],RUNTIME_VARIABLES.account).then( (txObj)=>{

						RUNTIME_VARIABLES.rawTx = txObj.raw;
						RUNTIME_VARIABLES.actualTx = txObj.readable;
						//VERIFY_VARIABLES.vals.toAcc = RUNTIME_VARIABLES.actualTx.to;
						//VERIFY_VARIABLES.vals.actualTx = RUNTIME_VARIABLES.actualTx;
						console.log("\nvpreprocess\n");
						console.log(RUNTIME_VARIABLES.rawTx);
						params[0] = RUNTIME_VARIABLES.rawTx.rawTransaction;
						resolve(requestID);
					}
				);

			}else if(method==='eth_sendRawTransaction' && (params == undefined ||params.length== 0)){
				params=[RUNTIME_VARIABLES.txRaw];
				//console.log(params)
				resolve(requestID);
			}else{
				resolve(requestID);
			}
		});
	}
	
	return new Promise((resolve,reject)=>{
		console.log(JSON.stringify(RUNTIME_VARIABLES));
		preprocess()
			.then((requestID)=>{
				return provider.sendRequest(requestID+obj.provider.RUNTIME_VARIABLES.port,testRow.method,params);
			})
			.then(async (resp)=>{

				if(resp.result !==undefined){
					obj.result = resp.result;
					RUNTIME_VARIABLES.update(method,resp,params);
				}
				resolve(resp.result);
		}).catch((err)=>{logger.log(err); reject()});
	});
}
	


function resultComparision(rust,java){
	let errors = [];
	try{
		chai.expect(typeof rust).to.equal(typeof java);
	}catch(err){
		errors.push(JSON.stringify(rust));
		errors.push(JSON.stringify(java));
		errors.push(err);
		return errors;
	}

	if(typeof java == 'object'){
		try{
			if(Array.isArray(java)){
				chai.expect(rust).to.have.lengthOf(java.length);
				java.forEach((elem, index)=>{
					errors = errors.concat(resultComparision(rust[index], elem));
				})
			}else if(java == null){
				chai.expect(rust).to.be.null;
			}else{
				chai.expect(Object.keys(rust)).to.have.lengthOf.at.least(Object.keys(java).length);
				Object.keys(java).forEach((key,index)=>{
					chai.expect(rust).to.have.property(key);
					errors = errors.concat(resultComparision(rust[key],java[key]));
				})
			}
		}catch(err){
			errors.push(JSON.stringify(rust));
			errors.push(JSON.stringify(java));
			errors.push(err);
		}
	}
	if(typeof java == 'string'){
		try{
			chai.expect(rust).to.have.lengthOf(java.length);
		}catch(err){
			errors.push(rust);
			errors.push(java);
			errors.push(err);
		}
	}

	return errors;
}



