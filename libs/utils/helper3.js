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

Helper.prototype.WaitNewBlock =  (testRow,rt_var)=>{
	var oldBlockNo, newBlockNo;
	//console.log(this);
	var provider = this.provider;
	var _id = "helper"+testRow.id;
	let newBlockNum=0;
	
	let timeout = 100;
	
	if(testRow.params !=undefined){
		timeout = testRow.params[0];
		if(testRow.params.length >1)
			newBlockNum = parseInt(testRow.params[1]);
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


Helper.prototype.delay= (testRow,rt_var)=>{
	this.logger.log(testRow.params);
	
	var timeout = testRow.params[0];
	timeout = parseInt(timeout);
	return new Promise((resolve,reject)=>{
		this.logger.log(`wait for : ${timeout} seconds`);
		setTimeout(()=>{
			this.logger.log("\nin delay");
			resolve();
		},parseInt(timeout)*1000);
	})
}

Helper.prototype.createPKAccount = (testRow,rt_var)=>{
	this.logger.info(testRow.params);
	return new Promise(()=>{
		let account = aionAccount.createKeyPair(testRow.params);
		account.addr = aionAccount.createA0Address(account.publicKey);
		rt_var.update("pairKeyCreateAcc", account);
		this.logger.info(JSON.stringify(rt_var));
		// if(!rt_var.nextTxObj) rt_var.nextTxObj = {};
		// rt_var.nextTxObj.to = r.params[0].to||account.addr;
		resolve();
	});
}

/*Helper.prototype.default = (param,a,b,c)=>{
	return new Promise((resolve)=>{resolve({RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c});});
}*/

Helper.prototype.newContract = (testRow,rt_var)=>{
	return new Promise((resolve)=>{
		if(rt_var.nextTxObj==undefined) 
			rt_var.nextTxObj = {};
		if(testRow.params!==undefined){

			rt_var.nextTxObj.data = rt_var.contract[testRow.params[0]].code
		}else{
			rt_var.nextTxObj.data = rt_var.contract[rt_var.contract.names[0]].code;
		}
		

		resolve();
	})
}

Helper.prototype.prepareContractCall = (testRow,rt_var) =>{
	

	return new Promise((resolve)=>{

		let newOptions = testRow.params;
		if(rt_var.nextTxObj==undefined) 
			rt_var.nextTxObj = {};

		/*
			check whether the function is calling a pre-compiled contract which starting with "prec_"
			or a user defined contract function
		*/

		if(/^prec_/.test(newOptions[0])){
			rt_var.nextTxObj.data = utils.getContractFuncData(null,newOptions.slice(1));
			rt_var.nextTxObj.to = rt_var.precompile[newOptions[0].substring(5)];
		}else{
			console.log(rt_var.contract);

			rt_var.nextTxObj.data = utils.getContractFuncData(rt_var.contract.func[newOptions[0]],newOptions.slice(1));
			rt_var.nextTxObj.to = rt_var.contractAddress;
		}
		this.logger.log(JSON.stringify(testRow.params));
		resolve();
	
	});
}

Helper.prototype.getEvent=(testRow,rt_var)=>{
	return new Promise((resolve)=>{
		if(rt_var.nextTxObj==undefined) 
			rt_var.nextTxObj = {};
		rt_var.nextTxObj.topics = ["0x"+utils.getEvent(rt_var.contract.event[testRow.params])];
		this.logger.log(rt_var.nextTxObj);
		resolve();
	})
}


/// TO BE REVIEWED
Helper.prototype.getSign = (testRow,rt_var)=>{
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



/// TO BE REVIEWED
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



/// TO BE REVIEWED
Helper.prototype.inc = async (options,RUNTIME_VARIABLES,testRow, VERIFY_VARIABLES)=>{
	options.forEach((item,index)=>{
		let pair = item.split(',');
		RUNTIME_VARIABLES[pair[0]] = RUNTIME_VARIABLES[pair[0]] + parseInt(pair[1]);
	})
	return Promise.resolve({RUNTIME_VARIABLES:RUNTIME_VARIABLES,testRow:testRow,VERIFY_VARIABLES:VERIFY_VARIABLES});
}


module.exports=Helper;