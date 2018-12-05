var provider_type = "websocket";
var connection;
var IPC = require("net");
var WS = require("ws");
var path = null;
var providers_config = require("./utils/providers/providers_config.json")

for(let i = 0; i < process.argv.length; i++){
	if(process.argv[i]=='--type') {
		provider_type= process.argv[++i];
		continue;
	}else if(process.argv[i]=='--path') {
		path = process.argv[++i];
		continue;
	}
}

var sendRequest = (id,method,params)=>{
	let _reqObj = {id:id,jsonrpc:"2.0",method:method,params:parms};
	if(provider_type == "websocket"){
		connection.send(JSON.stringify(_reqObj))
	}else{
		connection.write(JSON.stringify(_reqObj));
	}

}

describe("pubsub",()=>{
	let responses = {};

	before(()=>{
		if(provider_type == "websocket"){
			path = path || providers_config["websocket"];
			connection = new WS(path);
		}else{
			path = process.env.HOME+ path? path: providers_config["ipc"];
			connection = IPC.connect(path);
		}

		connection.on("data",(data)=>{
			data = JSON.parse(data.toString('ascii'));
			responses[data.id] = data.result;
		});

		connection.on("error",(e)=>{
			console.log(e);
			if(provider_type=="websocket"){
				connection.termiate();
			}else{
				connection.close();
			}
			throw e;
		});
	});

	

})