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
	WaitNewBlock(timeout){
		var oldBlockNo,newBlockNo;
		var self = this;

		return new Promise((resolve,reject)=>{
			console.log(self.toString());
			self.provider.sendRequest("helper","eth_blockNumber",[]).then((resp)=>{
				oldBlockNo = resp.result;
				console.log(resp);
			});
			console.log("-----------"+JSON.stringify(oldBlockNo));
			var checkblock = ()=>{

				self.provider.sendRequest("helper","eth_blockNumber",[]).then((resp)=>{
					newBlockNo= resp.result;
					console.log("-----------"+oldBlockNo+" "+newBlockNo);
					if(parseInt(newBlockNo) > parseInt(oldBlockNo)){
						console.log("-----true------"+oldBlockNo+" "+newBlockNo);
						clearInterval(checkloop);
						resolve();
					}
				});

			}
			var checkloop = setInterval(checkblock,2000);
			setTimeout(()=>{clearInterval(checkloop);resolve()},parseInt(timeout)*1000);
		});
	}
	
	/*
		Usage: 
	*/
	delay(timeout){
		return new Promise((resolve,reject)=>{
			setTimeout(resolve,parseInt(timeout)*1000);
		})
	}
	
	/*
		Usage: 
	*/
	createAccount(options,RUNTIME_VARIABLES,testRow,VERIFY_VARIABLES,done){
		let account = aionAccount.createKeyPair(options);
		account.addr = aionAccount.createA0Address(account.publicKey);
		RUNTIME_VARIABLES.update("pairKeyCreateAcc",account);
		Promise.resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES,done:done});
	}
	
	default(param,a,b,c,done){
		Promise.resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c,done:done});
	}
	
	
}
module.exports=Helper;