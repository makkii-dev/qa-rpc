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
	}/*else if(process.argv[i]=="--eventtype"){
		eventType = process.argv[++i];
	}else if(process.argv[i]=="--option"){
		opt = JSON.parse(process.argv[++i]);
	}*/
}

provider_type = provider_type || "websocket";
path = path || providers_config[provider_type]



var _responses = {};
var _requests = [];
var _reqCounter = 0;
var _isOpen = false;

console.log("start");
console.log(provider_type);
console.log(path);
if(provider_type == "websocket"){
	path = path || providers_config["websocket"];
	connection = new WS(path);
	
}else{
	path = process.env.HOME+ (path? path: providers_config["ipc"]);
	connection = IPC.connect(path);
}


connection.on("data",(data)=>{
	console.log(data.toString('ascii'));
	data = JSON.parse(JSON.stringify(data.toString('ascii')));
	if(data.params){
		_responses[data.params.subscription].logs.push(data.params.result);
	}else{
		_responses[data.result] = {logs:[], params:_requests[data.id]};
	}
	
});

connection.on("message",(data)=>{
	console.log(data);
	data = JSON.parse(data.toString('ascii'));
	console.log(data);
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
	_isOpen = false;
	throw e;
});




var closeProcess = (e)=>{
	if(provider_type=="websocket"){
		connection.termiate();
	}else{
		connection.close();
	}
	if(e) console.log(e);
}


var sendRequest = (id,method,params)=>{
	let _reqObj = {id:id,jsonrpc:"2.0",method:method,params:params};
	console.log(JSON.stringify(_reqObj));
	if(provider_type == "websocket"){
		connection.send(JSON.stringify(_reqObj))
	}else{
		connection.write(JSON.stringify(_reqObj));
	}

}
var createSub = (term,opt)=>{
	if(opt)
		sendRequest(_reqCounter++,"eth_subscribe",[term,opt]);
	else
		sendRequest(_reqCounter++,"eth_subscribe",[term]);
}
///-------------------
if(provider_type=="websocket")
connection.on('open',()=>{
	console.log("connection is on)")
	_isOpen = true;
	createSub("logs",{toBlock:"latest"});
	createSub("newHeads");
	createSub("newPendingTransactions");
	//createSub("syncing");
})
else
connection.on("connect",()=>{
	console.log("connection is on)")
	_isOpen = true;
	createSub("logs",{toBlock:"latest"});
	createSub("newHeads");
	createSub("newPendingTransactions");
	//createSub("syncing");
})






