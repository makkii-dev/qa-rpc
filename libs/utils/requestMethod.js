let Ajv = require('ajv');
const OBJECTS_SCHEMA = require("./rpc-schema/object.json");
const TYPES_SCHEMA = require("./rpc-schema/type.json");
const RESPONSE_SCHEMA= require("./rpc-schema/response.json");

const METHODS =[
  "eth_accounts","eth_blockNumber","eth_call","eth_coinbase","eth_estimateGas","eth_gasPrice","eth_getBalance","eth_getBlockByNumber","eth_getBlockByHash",
  "eth_getBlockTransactionCountByHash","eth_getBlockTransactionCountByNumber","eth_getCode","eth_getCompilers","eth_getFilterChanges","eth_getFilterLogs",
  "eth_getLogs","eth_getStorageAt","eth_getTransactionByBlockHashAndIndex","eth_getTransactionByBlockNumberAndIndex","eth_getTransactionByHash",
  "eth_getTransactionByHash","eth_getTransactionCount","eth_getTransactionReceipt","eth_hashrate","eth_mining","eth_newBlockFilter","eth_newFilter",
  "eth_newPendingTransactionFilter","eth_protocolVersion","eth_sendRawTransaction","eth_sendTransaction","eth_sign","eth_signTransaction","eth_submitHashrate",
  "eth_syncing","eth_uninstallFilter","net_listening","net_peerCount","net_version","web3_clientVersion","eth_compileSolidity"
];


class RequestMethod{
	constructor(provider){
		this.provider = provider;
		this.rawRequest= (currentRow,rt_val)=>{
			return this.provider.sendRaw(currentRow.params).then((resp)=>{
					return Promise.resolve(resp);
			});
		};

		// init schemas
		this.ajv = new Ajv({
			allErrors:true
		});
		this.ajv.addSchema(TYPES_SCHEMA);
		this.ajv.addSchema(OBJECTS_SCHEMA);
		this.ajv.addSchema(RESPONSE_SCHEMA);
		let self = this;
		METHODS.forEach((method,index)=>{
		  self.ajv.addSchema(require("../core/requests/"+method+".response.json"));
		});

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

					},2000);

				});

			}).then((resp)=>{
				if(self.ajv.validateSchema("response.json",resp)){
					if(resp.result){
						if(self.ajv.validateSchema(method+".response.json",resp.result)){
							return Promise.resolve(resp);
						}else{
							console.log(resp.result);
							console.log(self.ajv.errors);
							throw new Error("rpc response result format error");
						}
					}else {
						return Promise.resolve(resp);
					}
				}else{
					console.log(resp);
					console.log(self.ajv.errors);
					throw new Error("rpc response format error");
				}
			});
		};
	}

}




module.exports = RequestMethod;
