//test settings

//"use strict"
var logger = new (require("./libs/utils/logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;

var process = require('process');
const fs = require('fs');

//test arguements variables
var DRIVER_PATH = "./test_cases/new.tsv";
var provider_type;

// internal dependencies
const validFormat= require("./libs/utils/validFormat1");
var readCSVDriver = require("./libs/utils/readCSV1");
const Provider = require("./libs/utils/provider");
var utils = require("./libs/utils/utils2");

var Helper = require("./libs/utils/helper3");
var validationFunc= require('./libs/utils/validateFunc1');
var RUNTIME_VARIABLES = require("./libs/utils/RunVariable.js")(logger);

//validate tools
var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var RLP = require("rlp");
var runMethod = it;

var paramsParser = require("./libs/utils/parsers");
var RequestMethod = require("./libs/utils/requestMethod");



/**
* formParam: parse string of params to an array
* @param: str(String) params string in csv file
**/
function formParam(str,currentMethod){
	logger.log("\n----parse params-----------------------\nparams:"+str);
	logger.log("currentMethod:"+currentMethod);
	//logger.log("RUNTIME_VARIABLES: "+ JSON.stringify(RUNTIME_VARIABLES)+"\n-----------------------------");
	if(str===undefined) return [];
	if(str=="null") return null;
	if(currentMethod == 'requestMethod.eth_compileSolidity'){
		let contract = fs.readFileSync(__dirname + '/testContracts/'+str, {
    		encoding: 'utf8'
		});
		return [contract];
	}

	var result = paramsParser(str,RUNTIME_VARIABLES);
	console.log(JSON.stringify(result));
	return result;
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

let newlogfilename = (DRIVER_PATH.match(/\w+\.\w+/))[0]
logger.updateName(newlogfilename.substring(0,newlogfilename.length-4)+"-AionJAVA");

var stepAction = {
	requestMethod: new RequestMethod(cur_provider),
	helper: new Helper({provider:cur_provider,logger:logger}),
	validationFunction: new validationFunc(cur_provider,logger),
	validFormat:validFormat
}

var Step_Action = function(rows,resolves){
	let currentRow = rows.shift();
	var levels  = currentRow.method.split(".");
	var aFunction = stepAction;

//	logger.log(JSON.stringify(rows));
//	logger.log(JSON.stringify(resolves));
	if(currentRow.preStoreVariables){
		RUNTIME_VARIABLES.preStoreVariables(currentRow.preStoreVariables);
	}

	for(let i = 0; i < levels.length; i++){
		aFunction = aFunction[levels[i]];
		if(i==0 && levels[i]=='requestMethod'){
			stepAction.requestMethod.registerMethod(levels[i+1],currentRow.id);
		}
	}

	currentRow.params = formParam(currentRow.params,currentRow.method);

	if(currentRow.usePreparedData){
	//	logger.log(JSON.stringify(RUNTIME_VARIABLES.nextTxObj));
		Object.entries(RUNTIME_VARIABLES.nextTxObj).forEach((pair,index)=>{
			if(currentRow.params && Array.isArray(currentRow.params)){
				currentRow.params[0][pair[0]] = pair[1];
			}else if(typeof currentRow.params=== 'Object' || typeof currentRow.params==='object'){
				currentRow.params[pair[0]] = pair[1];
			}

		});
		delete RUNTIME_VARIABLES.nextTxObj;
	}
	logger.testStep(currentRow.testDescription);
	return aFunction(currentRow,RUNTIME_VARIABLES,resolves).then((result)=>{
		RUNTIME_VARIABLES.reassign(currentRow.runtimeVal).storeVariables(currentRow.storeVariables,result);
		if(rows.length > 0){
			return Step_Action(rows,result);
		}
	});
}

//read driver file
var data = readCSVDriver(DRIVER_PATH);



data.forEach((testSuite)=>{
	describe(testSuite.name,()=>{
		if(testSuite.execute == undefined){
			xit("testSuite.name");
			return;
		}
		if(!testSuite.usePreparedData)
			RUNTIME_VARIABLES.reset();
		//VERIFY_VARIABLES.reset();

		let startTime;
		before(()=>{
			startTime = Date.now();
		})
		after(()=>{
			logger.log(`${testSuite.name} took ${(Date.now()-startTime)/1000} seconds`);
		})
		it(testSuite.name,(done)=>{
			logger.title(testSuite.name);
			let testcases = testSuite.tests;
			Step_Action(testcases).then((res)=>{
				done();
			}).catch((err)=>{
				logger.error(err);
				done(err);
			});
		});
	});
});
