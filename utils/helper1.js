var aionLib = require('../packages/aion-lib/src/index');
var aionAccount = aionLib.accounts


class Helper{
	constructor(options){
		this.logger = options.logger||console;
		this.provider = options.provider;
		
	}
	
	/*
	Usage: 
	*/
	WaitNewBlock(timeout,a,b,c){
		var oldBlockNo,newBlockNo;
		var self = this;

		return new Promise((resolve,reject)=>{
			console.log(self.toString());
			self.provider.sendRequest("helper","eth_blockNumber",[]).then((resp)=>{
				oldBlockNo = resp.result;
				console.log(resp);
			});
			console.log("-----------"+oldBlockNo);
			var checkblock = ()=>{

				self.provider.sendRequest("helper","eth_blockNumber",[]).then((resp)=>{
					newBlockNo= resp.result;
					console.log("-----------"+oldBlockNo+" "+newBlockNo);
					if(parseInt(newBlockNo) > parseInt(oldBlockNo)){
						console.log("-----true------"+oldBlockNo+" "+newBlockNo);
						clearInterval(checkloop);
						resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c});
					}
				});

			}
			var checkloop = setInterval(checkblock,3000);
			setTimeout(()=>{clearInterval(checkloop);resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c})},parseInt(timeout)*1000);
		});
	}
	
	/*
		Usage: 
	*/
	delay(timeout,a,b,c){
		return new Promise((resolve,reject)=>{
			setTimeout(()=>{return resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c})},parseInt(timeout)*1000);
		})
	}
	
	/*
		Usage: 
	*/
	createPKAccount(option,RUNTIME_VARIABLES,testRow,VERIFY_VARIABLES){
		console.log(option);
		return new Promise((resolve,reject)=>{
			let account = aionAccount.createKeyPair(option);
			account.addr = aionAccount.createA0Address(account.publicKey);
			RUNTIME_VARIABLES.update("pairKeyCreateAcc", account);
			console.log(JSON.stringify(RUNTIME_VARIABLES));
			testRow.params[0].to = testRow.params[0].to||account.addr;
			resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
		});
	}
	

	
	default(param,a,b,c){
		return new Promise((resolve,reject)=>{resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c});});
	}
	
	
}
module.exports=Helper;