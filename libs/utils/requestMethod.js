class RequestMethod{
	constructor(provider){
		this.provider = provider;
	}
	registerMethod(method){
		this[method] = (currentRow,rt_val)=>{
			var startTime = Date.now();
			var self = this;

			return new Promise((resolve)=>{

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
