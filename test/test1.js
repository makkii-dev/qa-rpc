//var  xhr = require('xhr2');
const JSONRPC_VERSION='2.0';
const IP = "127.0.0.1";
const PORT = "8545";
const ENDPOINT = "http://"+IP+":"+PORT;

const testprovider = require("../http_provider");


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

var validFormat= require("../validFormat");


/*
	validation handlers
*/

function validateRes(done,callback){
	try{
		callback();
	}catch(e){
		console.error(e);
		done(e);
	}
}



describe("http_smoke_test",()=>{
	it("eth_getSyncing",(done)=>{
		testprovider(ENDPOINT,"eth_Syncing_smoke","eth_syncing",[])
			.then((resp)=>{
			validateRes(done,()=>{chai.expect(resp).to.matchPattern(EXPECT_RESP("eth_Syncing_smoke",false));});
			done();
		},(err)=>{
			//console.error(JSON.stringify(err));
			done(err);
		})
	});
	it("eth_accounts",(done)=>{
		testprovider(ENDPOINT,"eth_accounts_smoke","eth_accounts",[])
			.then((resp)=>{
			validateRes(done,()=>{chai.expect(resp).to.matchPattern(EXPECT_RESP("eth_accounts_smoke",_.isArray));});
			validateRes(done,()=>{resp.result.forEach((acc)=>{chai.assert(acc,validFormat.SINGLE.ACCOUNT_FORMAT);});});
			done();
		},(err)=>{
			done(err);
		})
	});
	it("eth_getBlockByNumber",(done)=>{
		testprovider(ENDPOINT,"eth_getBlockByNumber_smoke","eth_getBlockByNumber",["latest",true])
			.then((resp)=>{
				validateRes(done,()=>{
					chai.expect(resp).to.matchPattern(EXPECT_RESP("eth_getBlockByNumber_smoke",_.isObject));
				});
				validateRes(done,()=>{
					Object.entries(resp.result).forEach((property)=>{
						chai.assert(validFormat.OBJECT.VALID_BLOCK_OBJECT[property[0]],property[1]);
					})

				});
				done();
			},(err)=>{
				done(err);
			});
	});
});
