var aionLib = require('../packages/aion-lib/src/index');
var aionAccount = aionLib.accounts;
var utils = require("./utils");



var Helper = function(options){
	this.logger;
	this.provider;
	this._init(options.provider,options.logger);

}

Helper.prototype._init = (provider,logger)=>{
	console.log("logger ?");
	console.log(logger);
	this.logger = logger||console;
	this.provider = provider;
}

Helper.prototype.WaitNewBlock =  (options,a,b,c)=>{
	var oldBlockNo,newBlockNo;
	console.log(this);
	var provider = this.provider;
	var _id = b!==undefined? "helper"+b.id:"helper";
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

		provider.sendRequest(_id,"eth_blockNumber",[]).then((resp)=>{
			oldBlockNo = resp.result
			console.log(resp);
		}).then(()=>{
			console.log("-----------"+oldBlockNo);
			
			
			var checkblock = ()=>{
				provider.sendRequest(_id,"eth_blockNumber",[]).then((resp)=>{
					newBlockNo= resp.result;
					console.log("-----------"+oldBlockNo+" "+newBlockNo);
					if(parseInt(newBlockNo) > parseInt(oldBlockNo)+ newBlockNum){
						console.log("-----reached------"+oldBlockNo+" "+newBlockNo);
						clearInterval(checkloop);
						resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c});
					}
				});

			}
			var checkloop = setInterval(checkblock,5000);
			
			setTimeout(()=>{clearInterval(checkloop);resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c})},parseInt(timeout)*1000);
		
		
		});
		

	});
}


Helper.prototype.delay= (timeout,a,b,c)=>{
	if(Array.isArray(timeout)) timeout = timeout[0];
	timeout = parseInt(timeout);
	return new Promise((resolve,reject)=>{
		for(let i =1;i <parseInt(timeout);i++) setTimeout(()=>{console.log(i)},1000);
		setTimeout(()=>{
			console.log("\nin delay");
			resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c});
		},parseInt(timeout)*1000);
	})
}

Helper.prototype.createPKAccount = (option,RUNTIME_VARIABLES,testRow,VERIFY_VARIABLES)=>{
	console.log(option);
	if(Array.isArray(option)) option = option[0];
	return new Promise((resolve)=>{
		let account = aionAccount.createKeyPair(option);
		account.addr = aionAccount.createA0Address(account.publicKey);
		RUNTIME_VARIABLES.update("pairKeyCreateAcc", account);
		console.log(JSON.stringify(RUNTIME_VARIABLES));
		testRow.params[0].to = testRow.params[0].to||account.addr;
		resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
	});
}

Helper.prototype.default = (param,a,b,c)=>{
	return new Promise((resolve)=>{resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c});});
}

Helper.prototype.newContract = (params,RUNTIME_VARIABLES,testRow,VERIFY_VARIABLES)=>{
	return new Promise((resolve)=>{
		testRow.params[0].data = RUNTIME_VARIABLES.contract.code;
		resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
	})
}

Helper.prototype.prepareContractCall = (options,RUNTIME_VARIABLES,testRow,VERIFY_VARIABLES) =>{
	

	return new Promise((resolve)=>{
		let newOptions = options.map((value)=>{
//			if(!isNaN(value) && !/^0x/.test(value)){
//				return parseInt(value);
//			}
			if(typeof value === 'string' && /^_/.test(value) && RUNTIME_VARIABLES[value.substring(1)]!==undefined){
				console.log("replace with new value");
				value =  RUNTIME_VARIABLES[value.substring(1)];
			}
			console.log(value);
			return value;
		})

		console.log(newOptions);
		testRow.params[0].to = RUNTIME_VARIABLES.contractAddress;
		testRow.params[0].data = utils.getContractFuncData(RUNTIME_VARIABLES.contract.func[newOptions[0]],newOptions.slice(1));
		console.log(JSON.stringify(testRow.params));
		resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
	
	});
}



module.exports=Helper;