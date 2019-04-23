class RequestMethod{
	constructor(provider){
		this.provider = provider;
		this.rawRequest= (currentRow,rt_val)=>{
			return this.provider.sendRaw(currentRow.params).then((resp)=>{
					return Promise.resolve(resp);
			});
		};
	}
	registerMethod(method){
		if(this[method]) return;
		this[method] = (currentRow,rt_val)=>{
			var startTime = Date.now();
			var self = this;

			return new Promise((resolve)=>{
				delete rt_val.isCall;
				this.provider.sendRequest(currentRow.id,method,currentRow.params).then((resp)=>{
					if(method != "eth_getTransactionReceipt" || resp.result != null || resp.error ){
						if(resp.result){
							rt_val.update(method,resp,currentRow.params);
							//rt_val.reassign(currentRow.runtimeVal).storeVariables(currentRow.storeVariables,resp);
						}
						resolve(resp);
					}
					else
					var receiptLoop = setInterval(()=>{

						this.provider.sendRequest(currentRow.id,method,currentRow.params).then((resp)=>{
							if(resp.result != null || Date.now() > (startTime + 240 * 1000)){
								clearInterval(receiptLoop);
								rt_val.update(method,resp,currentRow.params);
								//rt_val.reassign(currentRow.runtimeVal).storeVariables(currentRow.storeVariables,resp);
								resolve(resp);
							}
						});

					},1200);

				});

			});
		};
	}

}




module.exports = RequestMethod;
