const net = require("net");

function requestBody(id,method,params,rpc_version){
	return {id:id,method:method,params:params,jsonrpc:rpc_version};
}

module.exports = (path,request_id,request_method,request_params,rpc_version,logger,log_visible)=>{
	return new Promise((resolve,reject)=>{
		var connection;
		try{

			logger.log("[IPC Request]:",log_visible);
			logger.log(JSON.stringify(requestBody(request_id,request_method,request_params,rpc_version)),log_visible);

			let HOME = process.env.HOME;
			connection = net.connect({path:HOME+path});
			var result;
			if(!connection.writable) connection.connect({path:path});
			connection.write(JSON.stringify(requestBody(request_id,request_method,request_params,rpc_version)));
			connection.on('data',(data)=>{
				//logger.log("[IPC Response Buffer]:");
				//logger.log(data);
				data = data.toString('ascii');
				logger.log("[IPC Response]:",log_visible);
				logger.log(data,log_visible);
				resolve(JSON.parse(data));
				connection.end();
			});
		}catch(e){
			logger.error("[IPC_PROVIDER ERROR]:");
			logger.error(e);
			reject(Error(e));
			if(connection)connection.destroy();
		}
	})
}