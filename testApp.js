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
	var param =  str.split('\t');
	logger.log(JSON.stringify(param));
	for(let i = 0; i < param.length;i++){
		if(param[i]=="true")param[i]=true;
		else if(param[i]=="false")param[i]=false;
		else if(/^{\S+}$/.test(param[i])) {
			param[i] = utils.str2Obj(param[i],",",":");
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
				logger.log("\n test log for "+testRow.prefix+testRow.method+testRow.id);	
				testprovider(ENDPOINT,requestID,testRow.method, formParam(testRow.params),JSONRPC_VERSION,logger)
						.then((resp)=>{
							chai.expect(resp).contains({id:requestID,jsonrpc:JSONRPC_VERSION});
							try{
								switch(testRow.valid_method){
									case "value":
										chai.expect(resp).to.matchPattern(EXPECT_RESP(requestID,JSON.parse(testRow.format_name)));
										break;
									case "format":
										switch(testRow.valid_type){
											case "array":
												resp.result.forEach((item)=>{chai.assert.match(item,validFormat.SINGLE[testRow.format_name]);});
												break;
											case "object":
												
												Object.entries(resp.result).forEach((property)=>{
													chai.assert.match(property[1],validFormat.OBJECT[testRow.format_name][property[0]]);
												});
												
												break;
											case "value":
												//logger.log(validFormat.SINGLE[testRow.format_name]);
												chai.assert.match(resp.result,validFormat.SINGLE[testRow.format_name]);
												logger.log(resp.result+testRow.format_name+validFormat.SINGLE[testRow.format_name].test(resp.result))
												break;
											default:

										}
										break;
									default:
										validateRes(done,()=>{chai.expect(resp).to.matchPattern(EXPECT_RESP(requestID,JSON.parse(testRow.format_name)));});
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

