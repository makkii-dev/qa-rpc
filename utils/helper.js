var aionLib = require('../packages/aion-lib/src/index');
var aionAccount = aionLib.accounts;
var utils = require("./utils1");



var Helper = function(options){
	this.logger;
	this.provider;
	this._init(options.provider,options.logger);

}

Helper.prototype._init = (provider,logger)=>{
	console.log("logger ?");
	//console.log(logger);
	this.logger = logger||console;
	this.provider = provider;
}


//provider,testRow
Helper.prototype.WaitNewBlock = (providers,a)=>{

	var options = providers.helperParams;
	var oldBlockNo,newBlockNo;
	
	var provider = this.provider;
	var _id = a!==undefined? "helper"+a.id:"helper";
	let newBlockNum=0;
	
	let timeout = 100;
	
	if(options !=null){
		timeout = options[0];
		if(options.length >1)
			newBlockNum = parseInt(options[1]);
			
	}	
	console.log("timeout:"+timeout);
	console.log("newBlockNum:"+typeof newBlockNum + "\t"+newBlockNum)

	timeout = parseInt(timeout);
	return new Promise((resolve,reject)=>{

		providers.provider.sendRequest(_id,"eth_blockNumber",[]).then((resp)=>{
			oldBlockNo = resp.result
			//console.log(resp);
		}).then(()=>{
			console.log("-----------"+oldBlockNo);
			
			
			var checkblock = ()=>{
				providers.provider.sendRequest(_id,"eth_blockNumber",[]).then((resp)=>{
					newBlockNo= resp.result;
					console.log("-----------"+oldBlockNo+" "+newBlockNo);
					if(parseInt(newBlockNo) > parseInt(oldBlockNo)+ newBlockNum){
						console.log("-----reached------"+oldBlockNo+" "+newBlockNo);
						clearInterval(checkloop);
						resolve({provider:providers,testRow:a});
					}
				});

			}
			var checkloop = setInterval(checkblock,5000);
			
			setTimeout(()=>{clearInterval(checkloop);resolve({provider:providers,testRow:a})},parseInt(timeout)*1000);
		
		
		});
		

	});
}


Helper.prototype.delay= (provider,a)=>{
	let timeout = provider.helperParams;
	if(Array.isArray(timeout)) timeout = timeout[0];
	timeout = parseInt(timeout);
	return new Promise((resolve,reject)=>{
		console.log(`wait for : ${timeout} seconds`);
		setTimeout(()=>{
			console.log("\nin delay");
			resolve({provider:provider, testRow:a});
		},parseInt(timeout)*1000);
	})
}

Helper.prototype.createPKAccount = (provider,testRow)=>{
	let option = provider.helperParams;
	console.log(option);
	if(Array.isArray(option)) option = option[0];
	return new Promise((resolve)=>{
		let account = aionAccount.createKeyPair(option);
		account.addr = aionAccount.createA0Address(account.publicKey);
		provider.RUNTIME_VARIABLES.update("pairKeyCreateAcc", account);
		console.log(JSON.stringify(provider.RUNTIME_VARIABLES));
		params[0].to = testRow.params[0].to||account.addr;
		resolve({provider:provider,testRow:testRow});
	});
}

Helper.prototype.default = (provider,a)=>{
	return new Promise((resolve)=>{resolve({provider:provider,testRow:a});});
}

Helper.prototype.newContract = (provider,testRow)=>{
	let RUNTIME_VARIABLES = provider.RUNTIME_VARIABLES;
	return new Promise((resolve)=>{
		provider.params[0].data = RUNTIME_VARIABLES.contract.code;
		resolve({provider:provider,testRow:testRow});
	})
}

Helper.prototype.prepareContractCall = (provider,testRow) =>{
	let options = provider.helperParams;

	return new Promise((resolve)=>{
		let newOptions = options.map((value)=>{
//			if(!isNaN(value) && !/^0x/.test(value)){
//				return parseInt(value);
//			}
			if(typeof value === 'string' && /^_/.test(value) && provider.RUNTIME_VARIABLES[value.substring(1)]!==undefined){
				console.log("replace with new value");
				value =  provider.RUNTIME_VARIABLES[value.substring(1)];
			}
			console.log(value);
			return value;
		})

		console.log(newOptions);
		console.log(provider.params);
		//console.log(JSON.stringify(provider.RUNTIME_VARIABLES.contract));
		provider.params[0].to = provider.RUNTIME_VARIABLES.contractAddress;
		provider.params[0].data = utils.getContractFuncData(provider.RUNTIME_VARIABLES.contract.func[newOptions[0]],newOptions.slice(1));
		console.log(JSON.stringify(provider.params));
		resolve({provider:provider,testRow:testRow});
	
	});
}
Helper.prototype.default = (provider,testRow)=>{ return new Promise((resolve)=>{resolve({provider:provider,testRow:testRow});})};
				


module.exports=Helper;