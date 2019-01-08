var aionLib = require('../packages/aion-lib/src/index');
var aionAccount = aionLib.accounts;
var utils = require("./utils2");



var Helper = function(options){
	this.logger;
	this.provider;
	this._init(options.provider,options.logger);

}

Helper.prototype._init = (provider,logger)=>{
	this.logger = logger||console;
	this.provider = provider;
}

Helper.prototype.WaitNewBlock =  (options,rt_var)=>{
	var oldBlockNo, newBlockNo;
	//console.log(this);
	var provider = this.provider;
	var _id = b!==undefined? "helper"+b.id:"helper";
	let newBlockNum=0;
	
	let timeout = 100;
	
	if(options !=null){
		timeout = options[0];
		if(options.length >1)
			newBlockNum = parseInt(options[1]);
	}	
	//console.log("timeout:"+timeout);
	//console.log("newBlockNum:"+typeof newBlockNum + "\t"+newBlockNum)

	timeout = parseInt(timeout);
	return new Promise((resolve,reject)=>{

		provider.sendRequest(_id,"eth_blockNumber",[],false).then((resp)=>{
			oldBlockNo = resp.result
		}).then(()=>{
			
			var checkblock = ()=>{
				provider.sendRequest(_id,"eth_blockNumber",[],false).then((resp)=>{
					newBlockNo= resp.result;
					this.logger.log("-----------"+oldBlockNo+" "+newBlockNo);
					if(parseInt(newBlockNo) > parseInt(oldBlockNo)+ newBlockNum){
						this.logger.log("-----reached------"+oldBlockNo+" "+newBlockNo);
						clearInterval(checkloop);
						resolve(resolves);
					}
				});

			}
			var checkloop = setInterval(checkblock,5000);
			
			setTimeout(()=>{clearInterval(checkloop);resolve(resolves)},parseInt(timeout)*1000);
		
		
		});
		

	});
}


Helper.prototype.delay= (options,rt_var)=>{
	if(Array.isArray(timeout)) timeout = options[0];
	timeout = parseInt(timeout);
	return new Promise((resolve,reject)=>{
		this.logger.log(`wait for : ${timeout} seconds`);
		setTimeout(()=>{
			this.logger.log("\nin delay");
			resolve();
		},parseInt(timeout)*1000);
	})
}

Helper.prototype.createPKAccount = (options,rt_var)=>{
	this.logger.info(options);
	if(Array.isArray(options)) options = options[0];
	return new Promise(()=>{
		let account = aionAccount.createKeyPair(options);
		account.addr = aionAccount.createA0Address(account.publicKey);
		rt_var.update("pairKeyCreateAcc", account);
		this.logger.info(JSON.stringify(rt_var));
		testRow.params[0].to = testRow.params[0].to||account.addr;
		resolve();
	});
}

/*Helper.prototype.default = (param,a,b,c)=>{
	return new Promise((resolve)=>{resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c});});
}*/

Helper.prototype.newContract = (params,rt_var)=>{
	return new Promise((resolve)=>{
		if(rt_var.nextTxObj==undefined) 
			rt_var.nextTxObj = {};
		if(params!==null){
			rt_var.nextTxObj.data = rt_var.contract[params[0]].code
		}else{
			rt_var.nextTxObj.data = rt_var.contract[rt_var.contract.names[0]].code;
		}
		
		resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
	})
}

Helper.prototype.prepareContractCall = (options,RUNTIME_VARIABLES,testRow,VERIFY_VARIABLES) =>{
	

	return new Promise((resolve)=>{
		let newOptions = options.map((value)=>{

			if(typeof value === 'string' && /^_/.test(value) && RUNTIME_VARIABLES[value.substring(1)]!==undefined){
				console.log("replace with new value");
				value =  RUNTIME_VARIABLES[value.substring(1)];
			}
			this.logger.log(value);
			return value;
		})

		//console.log(newOptions);
		//console.log(testRow);
		
		if(/^prec_/.test(newOptions[0])){
			testRow.params[0].data = utils.getContractFuncData(null,newOptions.slice(1));
			testRow.params[0].to = RUNTIME_VARIABLES.precompile[newOptions[0].substring(5)];
		}else{
			console.log(RUNTIME_VARIABLES.contract.func);
			testRow.params[0].data = utils.getContractFuncData(RUNTIME_VARIABLES.contract.func[newOptions[0]],newOptions.slice(1));
			testRow.params[0].to = RUNTIME_VARIABLES.contractAddress;
		}
		this.logger.log(JSON.stringify(testRow.params));
		resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
	
	});
}

Helper.prototype.getEvent=(options,RUNTIME_VARIABLES,testRow, VERIFY_VARIABLES)=>{
	return new Promise((resolve)=>{
		testRow.params[0].topics = ["0x"+utils.getEvent(RUNTIME_VARIABLES.contract.event[testRow.helper_params[0]])];
		this.logger.log(testRow.params);
		resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
	})
}

Helper.prototype.getSign = (options,RUNTIME_VARIABLES,testRow, VERIFY_VARIABLES)=>{
	return new Promise((resolve)=>{
		let obj = Object.create(testRow.params[0]);
		utils.getRawTx(this.provider,obj,RUNTIME_VARIABLES.accounts[testRow.params[0].from]).then((res)=>{
			RUNTIME_VARIABLES.hash = res.raw.messageHash.substring(2);
			RUNTIME_VARIABLES.sign1 =RUNTIME_VARIABLES.accounts[testRow.params[0].from].signature.substring(2,66);
			RUNTIME_VARIABLES.sign2 = RUNTIME_VARIABLES.accounts[testRow.params[0].from].signature.substring(66);
			RUNTIME_VARIABLES.publicKey = RUNTIME_VARIABLES.accounts[testRow.params[0].from].publicKey.substring(2);
			resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
		})
		//RUNTIME_VARIABLES.sign1 = RUNTIME_VARIABLES.accounts[testRow.params[0]].signature.substring(2,66);
		//RUNTIME_VARIABLES.sign2 = RUNTIME_VARIABLES.accounts[testRow.params[0]].signature.substring(66);
		
		
		
	})
}

Helper.prototype.data0xPrefix = async (options,RUNTIME_VARIABLES,testRow, VERIFY_VARIABLES)=>{
	for(let i = 0; i < testRow.params.length;i++){
		if(options[0] && !/^0x/.test(testRow.params[i])){
			testRow.params[i] = "0x" + testRow.params[i];
		}else if(!options[0] && /^0x/.test(testRow.params[i])){
			testRow.params[i] = testRow.params[i].substring(2);
		}
	}
	return Promise.resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
}

Helper.prototype.inc = async (options,RUNTIME_VARIABLES,testRow, VERIFY_VARIABLES)=>{
	options.forEach((item,index)=>{
		let pair = item.split(',');
		RUNTIME_VARIABLES[pair[0]] = RUNTIME_VARIABLES[pair[0]] + parseInt(pair[1]);
	})
	return Promise.resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
}


module.exports=Helper;