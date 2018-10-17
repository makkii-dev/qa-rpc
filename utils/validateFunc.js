var utils = require("./utils");
var chai = require('chai');
var Helper = require('./helper1');
var BN = require('bn.js');

const default_gasPrice = 0;


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

	let fromAcc = obj.testRow.params[0].from || obj.VERIFY_VARIABLES.vals.fromAcc;
	let toAcc = obj.testRow.params[0].to || obj.VERIFY_VARIABLES.vals.toAcc;
	
	console.log(fromAcc);
	console.log(toAcc);
	console.log(obj.testRow.params);
	
	obj.VERIFY_VARIABLES.vals.fromBal = new BN((await utils.getBalance(this.provider, fromAcc)).result.substring(2),16);
	obj.VERIFY_VARIABLES.vals.toBal = new BN(toAcc===null||toAcc ===undefined ? "0x" : (await utils.getBalance(this.provider, toAcc)).result.substring(2),16);
	
	let changeValue = obj.testRow.params[0].value;
	obj.VERIFY_VARIABLES.vals.changeValue = (/^0x/.test(changeValue))? new BN(changeValue.substring(2),16): new BN( changeValue,10);

	if(obj.testRow.method === "eth_sendTransaction"){
		obj.VERIFY_VARIABLES.vals.gasPirce = obj.testRow.params[0].gasPrice || default_gasPrice;
		obj.VERIFY_VARIABLES.vals.gasPirce = parseInt(obj.VERIFY_VARIABLES.vals.gasPirce);
	}
	return Promise.resolve(obj);
}

Validation.prototype.balanceValidate.post = async (obj)=>{
	let self = this;
	let fromAcc = obj.testRow.params[0].from || obj.VERIFY_VARIABLES.vals.fromAcc;
	let toAcc = obj.testRow.params[0].to || obj.VERIFY_VARIABLES.vals.toAcc;
	
	await self.helper.WaitNewBlock([70,3]);
	//await self.helper.delay([10]);
	
	let newFromBal = new BN((await utils.getBalance(self.provider, fromAcc)).result.substring(2),16);
	let newToBal = new BN((await utils.getBalance(self.provider, toAcc)).result.substring(2),16);
	
	self.logger.log(newFromBal.toString(16));
	self.logger.log(newToBal.toString(16));
	self.logger.log(obj.VERIFY_VARIABLES.vals);
	
	let gasPrice = obj.VERIFY_VARIABLES.vals.actualTx? new BN(obj.VERIFY_VARIABLES.vals.actualTx.gasPrice.substring(2),16): obj.testRow.params[0].gasPrice? new BN(obj.testRow.params[0].gasPrice.substring(2),16):new BN(0,16);
	let gas = new BN('21000',10);
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
