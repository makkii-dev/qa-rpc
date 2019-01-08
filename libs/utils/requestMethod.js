var stepAction = require("./stepAction")

class RequestMethod{
	constructor(provider){
		this.provider = provider;
	}
	registerMethod(method,id,useRestored){

		this[method] = (cur_params)=>{
			return this.provider.sendRequest(id,method,cur_params);
		};
	}

}

module.exports = RequestMethod;
