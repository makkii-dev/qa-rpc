var websocket = require("ws");

function requestBody(id,method,params,rpc_version){
	return {id:id,method:method,params:params,jsonrpc:rpc_version};
}
module.exports = {sendRequest:(path,request_id,request_method,request_params,rpc_version,logger,log_visible)=>{
		return new Promise((resolve,reject)=>{
			var ws = new websocket(path);



			ws.on("message",(data)=>{
				logger.log("[WEBSOCKET response]:",log_visible);
				logger.log(data,log_visible);
				resolve(JSON.parse(data));
				ws.terminate();
			})
			ws.on("error",(e)=>{
				logger.error("[WEBSOCKET ERROR]:");
				logger.error(e);
				reject(ERROR(e));
				ws.terminate();
			});
			ws.on("open",()=>{
				logger.log("[WEBSOCKET request]:",log_visible);
				logger.log(JSON.stringify(requestBody(request_id,request_method,request_params,rpc_version)),log_visible);
				ws.send(JSON.stringify(requestBody(request_id,request_method,request_params,rpc_version)));
			});

		});
	},
	sendRaw:(endpoint,jsonString,logger,log_visible)=>{
		return new Promise((resolve,reject)=>{
			var ws = new websocket(path);



			ws.on("message",(data)=>{
				logger.log("[WEBSOCKET response]:",log_visible);
				logger.log(data,log_visible);
				resolve(JSON.parse(data));
				ws.terminate();
			})
			ws.on("error",(e)=>{
				logger.error("[WEBSOCKET ERROR]:");
				logger.error(e);
				reject(ERROR(e));
				ws.terminate();
			});
			ws.on("open",()=>{
				logger.log("[WEBSOCKET request]:",log_visible);
				logger.log(jsonString,log_visible);
				ws.send(jsonString);
			});

		});
	}
}
