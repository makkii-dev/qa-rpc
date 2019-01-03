"use strict"
var logger = new (require("./utils/logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;
const DEFAULT_GAS_PRICE = 10000000000;
const Provider = require("./utils/provider");
var utils = require("./utils/utils1");
var Helper = require("./utils/helper1");
logger.updatePath("transaction_test");
var provider_type;

var ACC ;
var receiver = "0xa054340a3152d10006b66c4248cfa73e5725056294081c476c0e67ef5ad25334";
var password;
//load arguements from command line and create a provider
for(let i = 0; i < process.argv.length; i++){
	if(process.argv[i]=='--type') {
		provider_type= process.argv[++i];
		continue;
	}else if(process.argv[i]=='--account'){
		ACC = process.argv[++i];
		continue;
	}else if(process.argv[i]=='--password'){
		password = process.argv[++i];
	}
}
provider_type=provider_type||'default';

var cur_provider = new Provider({type:provider_type,logger:logger});
var helper = new Helper({provider:cur_provider,logger:logger});

var resp = {result:"something"};

async function main(){
	let nonce = parseInt((await cur_provider.sendRequest("getNonce","eth_getTransactionCount",[ACC])).result);
	console.log(nonce);
	resp = await cur_provider.sendRequest("unlockedAccount","personal_unlockAccount",[ACC,password,200000]);
	let index = 0;
	while(resp.result){
		resp = await cur_provider.sendRequest(index++,"eth_sendTransaction",[{from:ACC, to:receiver, value:"0x1", nonce:utils.dec2Hex(nonce++),gasPrice:12000000000}]);
	}

	console.log(nonce);
}

main();
