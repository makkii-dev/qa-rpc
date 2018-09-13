//test settings
var logger = new (require("./logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;

//test environment variables
const JSONRPC_VERSION='2.0';
const IP = "127.0.0.1";
const PORT = "8545";
const ENDPOINT = "http://"+IP+":"+PORT;
const IPC_PATH = "/home/aion-aisa-08/.aion/jsonrpc.ipc";
const DRIVER_PATH = "./testDriver.csv";

// internal dependencies
const validFormat= require("./validFormat");
var readCSVDriver = require("./readCSV");
const testprovider = require("./http_provider");
//const testprovider = require("./ipc_provider");
//const testprovider = require("./socket_provider");
var utils = require("./utils")

//validate tools
var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();


//runtime variable:
var currentMethod;


var EXPECT_RESP= (req_id, expect_result)=>{
	return {
		id: req_id,
		jsonrpc:JSONRPC_VERSION,
		result: expect_result
	}
}

/*
	validation handlers
*/

// function validateRes(done,callback){
// 	try{
// 		callback();
// 		done()
// 	}catch(e){
// 		done(e);
// 		console.error(e);
// 		logger.log("[Validation Error]:");
// 		logger.log(e);
// 		//done(e);
// 	}
// }

function formParam(str){
	if(str.length==0)return[];
	//logger.log(param);
	var param =  str.split('\t');
	//logger.log(JSON.stringify(param));
	for(let i = 0; i < param.length;i++){
		if(param[i]=="true")param[i]=true;
		else if(param[i]=="false")param[i]=false;
		else if(/^{\S*}$/.test(param[i])) {
			param[i] = utils.str2Obj(param[i],",",":");
		}else if(currentMethod=="personal_unlockAccount" && i == 2){
			param[i]= parseInt(param[i]);
		}
	}
	return param;
}

//read driver file
var data = readCSVDriver(DRIVER_PATH);

//verify driver file
logger.log("Find "+data.length+" testcases:");

	data.forEach((testRow)=>{
		describe("tests",()=>{
			var requestID = testRow.prefix+"-"+testRow.id;
			if(testRow.execute=='x'){
				it(testRow.prefix+testRow.method+testRow.id,(done)=>{
				currentMethod = testRow.method;
				logger.log("\n test log for "+testRow.prefix+testRow.method+testRow.id);
				logger.log(testRow);	
				testprovider(ENDPOINT,requestID,testRow.method, formParam(testRow.params),JSONRPC_VERSION,logger)
						.then((resp)=>{
							chai.expect(resp).contains({id:requestID,jsonrpc:JSONRPC_VERSION});
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
												break;
											case "error":
												chai.expect(resp.error).to.matchPattern(validFormat.OBJECT[testRow.format_name]);

											default:

										}
										break;
									default:
										chai.expect(resp).to.matchPattern(EXPECT_RESP(requestID,JSON.parse(testRow.format_name)));;
								}
								done();
							}catch(e){
								logger.log("[Validation Error]:");
								logger.log(e);
								done(e);
							}
						
						
					},(err)=>{
						logger.log("[HTTP ERROR]:")
						logger.log(JSON.stringify(err));
						done(err);
					})
				});
			}
		});
		

	})
	
					
//});

