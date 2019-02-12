var utils = require("./utils2");
var chai = require('chai');
var Helper = require('./helper3');
var BN = require('bn.js');



var Validation = function(provider,logger){
	var self = this;
	this.provider;
	this.helper;
	this.putProvider(provider,logger);
	return self;
}

Validation.prototype.putProvider=(provider,logger)=>{
	console.log(provider);
	this.provider = provider||console;
	this.logger = logger;
	this.helper = new Helper({provider:provider,logger:logger});
}


//{RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c,done:done}//
Validation.prototype.balanceValidate={};
Validation.prototype.balanceValidate.pre = async (testRow, rt_var)=>{

	rt_var._balanceVariables = {};
	if(testRow.params){
		rt_var._balanceVariables.fromAcc = testRow.params.from;
		rt_var._balanceVariables.toAcc = testRow.params.to;
		rt_var.nextTxObj = testRow.params;
	}/*else if(rt_var.tx){
		rt_var._balanceVariables.fromAcc = rt_var.tx.from;
		rt_var._balanceVariables.toAcc = rt_var.tx.to;
	}
*/

	rt_var._balanceVariables.fromBal = new BN((await utils.getBalance(this.provider, rt_var._balanceVariables.fromAcc)).result.substring(2),16);
	rt_var._balanceVariables.toBal = new BN((await utils.getBalance(this.provider, rt_var._balanceVariables.toAcc)).result.substring(2),16);

	let changeValue = testRow.params.value;

	rt_var._balanceVariables.changeValue = (/^0x/.test(changeValue))? new BN(changeValue.substring(2),16)
																	: new BN(typeof changeValue=='number'? changeValue.toString():changeValue,10);

	//if(obj.testRow.method === "eth_sendTransaction"){
	rt_var._balanceVariables.gasPrice = testRow.params.gasPrice || await utils.getGasPrice(this.provider);
	rt_var._balanceVariables.gasPrice = /^0x/.test(rt_var._balanceVariables.gasPrice)? new BN(rt_var._balanceVariables.gasPrice.substring(2),16): new BN(rt_var._balanceVariables.gasPrice,10);
	//}
	return Promise.resolve();
}



Validation.prototype.balanceValidate.post = async (testRow, rt_var, resolution)=>{
	let self = this;
	/* check if rpc request give a transactioin hash; if not return error, no validation is needed*/
	if(!resolution.result) {
		throw new Error("Transaction Failed");
	}
	/* wait until the transation being mined */
	await utils.getTxReceipt(rt_var.txHash,self.provider,120);
	//await self.helper.delay([10]);

	let newFromBal = new BN((await utils.getBalance(self.provider, rt_var._balanceVariables.fromAcc)).result.substring(2),16);
	let newToBal = new BN((await utils.getBalance(self.provider, rt_var._balanceVariables.toAcc)).result.substring(2),16);

	//self.logger.log(rt_var._balanceVariables);

	let gas = new BN(21000);
	// self.logger.log("[gas]: "+gas.toString(10));
	// self.logger.log("[gasPrice]: "+rt_var._balanceVariables.gasPrice.toString(10));
	//self.logger.log(obj.VERIFY_VARIABLES.vals.actualTx);
	//self.logger.log(obj.testRow.params[0].gasPrice);

	let fromChanges = rt_var._balanceVariables.changeValue.add(gas.mul(rt_var._balanceVariables.gasPrice));

	let expectedFrom = rt_var._balanceVariables.fromBal.sub(fromChanges);
	let expectedTo   = rt_var._balanceVariables.toBal.add(rt_var._balanceVariables.changeValue);


	self.logger.info("[fromAcc Balance before tx]\t"+rt_var._balanceVariables.fromBal.toString(10));
	self.logger.info("[fromAcc Balance after tx]\t"+newFromBal.toString(10));
	self.logger.info("[expected new fromAcc Balance]\t"+expectedFrom.toString(10));
	self.logger.info("[toAcc Balance before tx]\t"+rt_var._balanceVariables.toBal.toString(10));
	self.logger.info("[toAcc Balance after tx]\t"+newToBal.toString(10));
	self.logger.info("[expected new toAcc Balance]\t"+expectedTo.toString(10));

	try{
		chai.expect(newFromBal.eq(expectedFrom)).to.be.true;
		chai.expect(newToBal.eq(expectedTo)).to.be.true;
		delete rt_var._balanceVariables;
		return Promise.resolve(resolution);
	}catch(e){
		delete rt_var._balanceVariables;
		self.logger.warning("Check if fromAcc or toAcc is a miner account.")
		return Promise.reject(e);
	}
}


Validation.prototype.validateMining = async (testRow, rt_var, resolution)=>{
	let resp_t0 = await utils.getBalance(this.provider, testRow.params[0]);
	if(resp_t0.error){
		if(testRow.params[1])
			return Promise.reject(resp_t0.error);
		return Promise.resolve(resolution);
	}

	let balance_t0 = new BN(resp_t0.result.substring(2),16);
	// wait for two blocks mined
	await this.helper.WaitNewBlock([120, 1]);
	let balance_t1 = new BN((await utils.getBalance(this.provider, testRow.params[0])).result.substring(2),16);
	try{
		if(testRow.params[1])
			chai.expect(balance_t1.gt(balance_t0)).to.be.true;
		else
			chai.expect(balance_t1.gt(balance_t0)).to.be.false;
		return Promise.resolve(resolution);
	}catch(e){
		this.logger.info(testRow.params+"balance before 2 blocks: "+ balance_t0.toString(10));
		this.logger.info(testRow.params+"balance before 2 blocks: "+ balance_t1.toString(10));
		return Promise.reject(e);
	}
}



Validation.prototype.rptLogs = async (testRow, rt_var, resolution)=>{
	if(resolution.error) return Promise.reject("Request failed: " + JSON.stringify(resolution.error));
	if(resolution.result.status == "0x0") return Promise.reject("tx revert:" + JSON.stringify(resolution.result));

	let params = testRow.params;
	let logs = resolution.result.logs;
	try{
		chai.expect(logs).to.have.lengthOf(params[0]);
		this.logger.info(JSON.stringify(rt_var.contract.event));
		if(params[1]){
			logs.forEach((log,index)=>{
				if(params[1][index].topics)
					chai.expect(log.topics[0]).to.have.string(utils.getEvent(rt_var.contract.event[params[1][index].topics]));
				if(params[1][index].data)
					chai.expect(log.data).to.equal(utils.getEvtData(rt_var.contract.event[params[1][index].topics],params[1][index].data));
				if(params[1][index].logIndex)
					chai.expect(parseInt(log.logIndex)).to.equal(params[1][index].logIndex);
			});
		}
		//rt_var.reassign(testRow.runtimeVal).storeVariables(testRow.storeVariables,resolution);
		return Promise.resolve(resolution);
	}catch(e){
		return Promise.reject(e);
	}
}

Validation.prototype.minerStats = async (testRow,rt_var,resolution)=>{
	//{"minerHashrate":"1.5455","minerHashrateShare":"1.0000","networkHashrate":"1.5455"}
	if(resolution.error) return Promise.reject("Request failed: " + JSON.stringify(resolution.error));
	if(!rt_var.coinbase){
		this.logger.warning("no coinbase defined in runtime variables; unable to verify the result");
		return Promise.resolve(resolution);
	}else{
		try{
			if(rt_var.coinbase === testRow.params){
				chai.expect(parseInt(resolution.result.minerHashrate)).to.be.above(0);
				chai.expect(parseInt(resolution.result.minerHashrateShare)).to.be.above(0);
			}else{
				chai.expect(parseInt(resolution.result.minerHashrate)).to.equal(0);
				chai.expect(parseInt(resolution.result.minerHashrateShare)).to.equal(0);
			}
			chai.expect(parseInt(resolution.result.networkHashrate)).to.be.above(0);
			return Promise.resolve(resolution);
		}catch(e){
			return Promise.reject(e);
		}
	}
}

Validation.prototype.checkRunTimeVarExist = async (testRow,rt_var,resolution)=>{
	let params = testRow.params;
	// params.forEach((key,index)=>{
	// 	if(typeof key !== "string") 
	// })

}


//
// Validation.prototype.validateBlake2b = {};
// Validation.prototype.validateBlake2b.pre = async(obj)=>{
// 	obj.VERIFY_VARIABLES.vals.callMethod = obj.testRow.method == "eth_call"? true: false; // "true" called locally; "false" call in another contract
// 	console.log(obj.testRow.params[0].data.substring(10));
// 	obj.VERIFY_VARIABLES.vals.expectOutput = require("../packages/aion-lib/src/index.js").crypto.blake2b256(Buffer.from(obj.testRow.params[0].data.substring(2)));
// 	return Promise.resolve(obj);
// }
//
// Validation.prototype.validateBlake2b.post = async(obj)=>{
// 	try{
// 		if(obj.VERIFY_VARIABLES.vals.callMethod){
// 			console.log(obj.result +" expect to be "+ obj.VERIFY_VARIABLES.vals.expectOutput);
// 			chai.expect(obj.result).to.equal(obj.VERIFY_VARIABLES.vals.expectOutput);
// 		}else{
// 			var receipt = await utils.getTxReceipt(obj.result,this.provider);
// 			console.log(receipt);
// 		}
// 	}catch(e){
// 		return Promise.reject(e);
// 	}
// }
//

module.exports = Validation;
