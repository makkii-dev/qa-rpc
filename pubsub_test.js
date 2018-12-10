var logger = new (require("./utils/logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;

var provider_type = "websocket";
var connection;
var IPC = require("net");
var WS = require("ws");
var path = null;
var providers_config = require("./utils/providers/providers_config.json");
var eventType, opt

for(let i = 0; i < process.argv.length; i++){
	if(process.argv[i]=='--type') {
		provider_type= process.argv[++i];
		continue;
	}else if(process.argv[i]=='--path') {
		path = process.argv[++i];
		continue;
	}else if(process.argv[i]=="--eventtype"){
		eventType = process.argv[++i];
	}else if(process.argv[i]=="--option"){
		opt = JSON.parse(process.argv[++i]);
	}
}

provider_type = provider_type || "ipc";

var sendRequest = (id,method,params)=>{
	let _reqObj = {id:id,jsonrpc:"2.0",method:method,params:parms};
	if(provider_type == "websocket"){
		connection.send(JSON.stringify(_reqObj))
	}else{
		connection.write(JSON.stringify(_reqObj));
	}

}

var _responses = {};
var _requests = [];
var _reqCounter = 0;

if(provider_type == "websocket"){
	path = path || providers_config["websocket"];
	connection = new WS(path);
}else{
	path = process.env.HOME+ path? path: providers_config["ipc"];
	connection = IPC.connect(path);
}

connection.on("data",(data)=>{
	data = JSON.parse(data.toString('ascii'));
	if(data.params){
		_responses[data.params.subscription].logs.push(data.params.result);
	}else{
		_responses[data.result] = {logs:[], params:_requests[data.id]};
	}
	
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
	

var createSub = async(term,opt)=>{
	sendRequest(_reqCounter++,"eth_subscribe",[term,opt]);
}

var closeProcess = (e)=>{
	if(provider_type=="websocket"){
		connection.termiate();
	}else{
		connection.close();
	}
	if(e) console.log(e);
}


