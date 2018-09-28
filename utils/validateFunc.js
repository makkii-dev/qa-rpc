var utils = require("./utils");

var Validation = function(provider){
	var self = this;
	this.provider = provider;
	return self;
}

Validation.prototype.get=(validationName)=>{
	var self = this;	
	return self[validationName];
}
//{RUNTIME_VARIABLES:a,testRow:b,VERIFY_VARIABLES:c,done:done}//
Validation.prototype.balanceValidation = (obj)=>{
	var self = this;
	return new Promise((resolve, reject)=>{

		obj.VERIFY_VALIABLES.from = await utils.getBalance(self.provider, obj.testRow.from);
	});
}


module.exports = Validation
