class RequestMethod{
	constructor(provider){
		this.provider = provider;
	}
	registerMethod(method){
		this[method] = (currentRow,rt_val)=>{
			return this.provider.sendRequest(currentRow.id,method,currentRow.params).then((resp)=>{
				
				rt_val.update(method,resp,currentRow.params);
				rt_val.reassign(currentRow.runtimeVal).storeVariables(currentRow.storeVariables,resp);
				return Promise.resolve(resp);
			});
		};
	}

}

module.exports = RequestMethod;
