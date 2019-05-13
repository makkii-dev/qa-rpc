var aionLib = require('../packages/aion-lib/src/index');
var aionAccount = aionLib.accounts;
var utils = require("./utils2");
var AVM = require('../packages/web3-avm-contract/src/index');
var ABI = require('../packages/web3-avm-codec/src/index');


var Helper = function(options){
	this.logger;
	this.provider;
	this._init(options.provider,options.logger);

}

Helper.prototype._init = (provider,logger)=>{
	this.logger = logger||console;
	this.provider = provider;
}

Helper.prototype.WaitNewBlock =  (testRow,rt_var,resolution)=>{
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
						resolve(resp);
					}
				});

			}
			var checkloop = setInterval(checkblock,5000);

			setTimeout(()=>{clearInterval(checkloop);resolve(resolution)},parseInt(timeout)*1000);

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
	return new Promise((resolve,reject)=>{
		let account = aionAccount.createKeyPair(testRow.params);
		account.addr = aionAccount.createA0Address(account.publicKey);
		rt_var.update("pairKeyCreateAcc", account);
		//this.logger.info(JSON.stringify(rt_var));
		// if(!rt_var.nextTxObj) rt_var.nextTxObj = {};
		// rt_var.nextTxObj.to = r.params[0].to||account.addr;
		resolve();
	});
}

Helper.prototype.prepareRawTx = (testRow,rt_var,resolution)=>{
	return new Promise((resolve,reject)=>{
		this.logger.info(JSON.stringify(testRow.params));
		utils.getRawTx(this.provider,testRow.params,rt_var.account).then( (txObj)=>{

				rt_var.rawTx = txObj.raw;
				rt_var.actualTx = txObj.readable;
				//VERIFY_VARIABLES.vals.toAcc = rt_var.actualTx.to;
				//VERIFY_VARIABLES.vals.actualTx = rt_var.actualTx;
				console.log("\nvpreprocess\n");
				console.log(rt_var.rawTx);
				testRow.params[0] = rt_var.rawTx.rawTransaction;
				resolve();
			}
		);

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
		rt_var.nextTxObj.tx_type = "0x01";

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
		rt_var.nextTxObj.type = "0x01";
		if(/^prec_/.test(newOptions[0])){
			rt_var.nextTxObj.data = utils.getContractFuncData(null,newOptions.slice(1));
			rt_var.nextTxObj.to = rt_var.precompile[newOptions[0].substring(5)];
		}else{
			console.log(rt_var.contract);
			let offset = newOptions.length - rt_var.contract.func[newOptions[0]].inputs.length;
			console.log("offset:\t"+offset);

			let isConvert = offset==1 || newOptions[1];
			console.log("isConvert:\t"+isConvert);
			rt_var.nextTxObj.data = utils.getContractFuncData(rt_var.contract.func[newOptions[0]],newOptions.slice(offset),isConvert);
			rt_var.nextTxObj.to = rt_var.contractAddress;
			console.log(rt_var.nextTxObj);
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
/*
* creates signedtx hash, signatures and publicKey, and stores them in RUNTIME_VARIABLES
*	@param {Object} testRow The object parsed from data file
* @param {Object} rt_var The RUNTIME_VARIABLES object
*/

Helper.prototype.getSign = (testRow,rt_var)=>{
	return new Promise((resolve)=>{
		let obj = Object.create(testRow.params[0]);
		utils.getRawTx(this.provider,obj,rt_var.accounts[testRow.params[0].from]).then((res)=>{
			rt_var.hash = res.raw.messageHash.substring(2);
			rt_var.sign1 =rt_var.accounts[testRow.params[0].from].signature.substring(2,66);
			rt_var.sign2 = rt_var.accounts[testRow.params[0].from].signature.substring(66);
			rt_var.publicKey = rt_var.accounts[testRow.params[0].from].publicKey.substring(2);
			resolve();
		})
		//RUNTIME_VARIABLES.sign1 = RUNTIME_VARIABLES.accounts[testRow.params[0]].signature.substring(2,66);
		//RUNTIME_VARIABLES.sign2 = RUNTIME_VARIABLES.accounts[testRow.params[0]].signature.substring(66);



	})
}


Helper.prototype.data0xPrefix = async (testRow,rt_var,resolution)=>{
	let options = testRow.params.slice(1);
	for(let i = 0; i < testRow.params.length;i++){
		if(options[0] && !/^0x/.test(rt_var[testRow.params[i]])){
			rt_var[testRow.params[i]] = "0x" + rt_var[testRow.params[i]];
		}else if(!options[0] && /^0x/.test(testRow.params[i]) ){
			rt_var[testRow.params[i]] = rt_var[testRow.params[i]].substring(2);
		}
	}
	return Promise.resolve(resolution);
}



Helper.prototype.inc = async (testRow,rt_var,resolution)=>{
	Object.entries(testRow.params).forEach((pair,index)=>{
		let isString = (typeof rt_var[pair[0]] =='String'|| typeof rt_var[pair[0]] =='string')
		let isHEX = isString && /^0x/.test(rt_var[pair[0]]);
		rt_var[pair[0]] = parseInt(rt_var[pair[0]]) + pair[1];
		if(isHEX) rt_var[pair[0]] = "0x"+rt_var[pair[0]].toString(16);
		else if(isString) rt_var[pair[0]] = rt_var[pair[0]].toString();
	})
	return Promise.resolve(resolution);
}


/*****************************************************************
 *  AVM related helper function
******************************************************************/

/********************************************
 *  params expected to be the path(name) of AVM jar and argument type array and arg array
 * e.g [testContract/dapp.jar [string,int],[hello,2]]
*********************************************/
Helper.prototype.newAVMContract = async (testRow, rt_var,resolution)=>{
	rt_var.avmContract = new AVM();
	rt_var.avmContract.deploy(testRow.params[0]);
	if(!rt_var.nextTxObj) rt_var.nextTxObj = {};
	rt_var.nextTxObj.data = testRow.params.length > 1? rt_var.avmContract.args(testRow.params[1],testRow.params[2]).init(): rt_var.avmContract.init();
	rt_var.nextTxObj.tx_type = 2;
	return Promise.resolve(resolution);
};

/********************************************
 *  params expected to be the function name and argument type array and arg array
 * e.g [functon, [string,int],[hello,2]]
*********************************************/
Helper.prototype.callAVMMethod = async(testRow, rt_var, resolution)=>{
	rt_var.avmContract.method(testRow.params[0]);
	if(testRow.params.length > 1) rt_var.avmContract.inputs(testRow.params[1],testRow.params[2]);
	if(!rt_var.nextTxObj) rt_var.nextTxObj={};
	rt_var.nextTxObj.data = rt_var.avmContract.encode();
	rt_var.nextTxObj.tx_type = 1;

	return Promise.resolve(resolution);
};


Helper.prototype.parseAVMResult = async(testRow,rt_var,resolution)=>{
	if(!rt_var.avmContract) rt_var.avmContract = new AVM();
	var new_resol = rt_var.avmContract.decode(testRow.params[0], testRow.params[1]);
	return Promise.resolve(new_resol);
};




module.exports=Helper;
