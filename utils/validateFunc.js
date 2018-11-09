var utils = require("./utils1");
var chai = require('chai');
var Helper = require('./helper1');
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
Validation.prototype.balanceValidate.pre = async (obj)=>{

	let fromAcc = obj.testRow.params[0].from || obj.VERIFY_VARIABLES.vals.fromAcc||obj.VERIFY_VARIABLES.account.addr;
	let toAcc = obj.testRow.params[0].to || obj.VERIFY_VARIABLES.vals.toAcc;

	
	obj.VERIFY_VARIABLES.vals.fromBal = new BN((await utils.getBalance(this.provider, fromAcc)).result.substring(2),16);
	obj.VERIFY_VARIABLES.vals.toBal = new BN(toAcc===null||toAcc ===undefined ? "0x" : (await utils.getBalance(this.provider, toAcc)).result.substring(2),16);
	
	let changeValue = obj.testRow.params[0].value;
	obj.VERIFY_VARIABLES.vals.changeValue = (/^0x/.test(changeValue))? new BN(changeValue.substring(2),16): new BN( changeValue,10);

	if(obj.testRow.method === "eth_sendTransaction"){
		obj.VERIFY_VARIABLES.vals.gasPirce = obj.testRow.params[0].gasPrice || obj.VERIFY_VARIABLES.defaultGasPrice;
		obj.VERIFY_VARIABLES.vals.gasPirce = parseInt(obj.VERIFY_VARIABLES.vals.gasPirce);
	}
	return Promise.resolve(obj);
}

Validation.prototype.balanceValidate.post = async (obj)=>{
	let self = this;
	let fromAcc = obj.testRow.params[0].from || obj.VERIFY_VARIABLES.vals.fromAcc||obj.VERIFY_VARIABLES.account.addr;
	let toAcc = obj.testRow.params[0].to || obj.VERIFY_VARIABLES.vals.toAcc;
	
	await self.helper.WaitNewBlock([120,1]);
	//await self.helper.delay([10]);
	
	let newFromBal = new BN((await utils.getBalance(self.provider, fromAcc)).result.substring(2),16);
	let newToBal = new BN((await utils.getBalance(self.provider, toAcc)).result.substring(2),16);
	
	self.logger.log("new from balance: "+newFromBal.toString(16));
	self.logger.log("new to balance: "+newToBal.toString(16));
	self.logger.log(obj.VERIFY_VARIABLES.vals);
	
	console.log(obj.VERIFY_VARIABLES.defaultGasPrice);
	let gasPrice = obj.VERIFY_VARIABLES.vals.actualTx? new BN(obj.VERIFY_VARIABLES.vals.actualTx.gasPrice.buf): (obj.testRow.params[0].gasPrice? new BN(obj.testRow.params[0].gasPrice.substring(2),16):new BN(obj.VERIFY_VARIABLES.defaultGasPrice.substr(2),16));

	let gas = new BN(21000);
	self.logger.log(gas.toString(10));
	self.logger.log(gasPrice.toString(10));
	self.logger.log(obj.VERIFY_VARIABLES.vals.actualTx);
	self.logger.log(obj.testRow.params[0].gasPrice);
	
	let fromChanges = obj.VERIFY_VARIABLES.vals.changeValue.add(gas.mul(gasPrice));
	
	let checkFrom = obj.VERIFY_VARIABLES.vals.fromBal.isub(fromChanges);
	let checkTo   = obj.VERIFY_VARIABLES.vals.toBal.iadd(obj.VERIFY_VARIABLES.vals.changeValue);

	self.logger.log(checkFrom.toString(16));
	self.logger.log(checkTo.toString(16));
	self.logger.log(gas.mul(gasPrice).toString(10))

	try{
		chai.expect(newFromBal.eq(checkFrom)).to.be.true;
		chai.expect(newToBal.eq(checkTo)).to.be.true;
		obj.VERIFY_VARIABLES.reset();
		return Promise.resolve();
	}catch(e){
		return Promise.reject(e);
	}
}


Validation.prototype.default = (obj)=>{
//	console.log("\n\n\n------\n\n"+JSON.stringify(obj));
	return new Promise((resolve, reject)=>{
//		console.log("\n\n\n\n\n"+JSON.stringify(obj));
		resolve(obj);
	});
};

module.exports = Validation;
