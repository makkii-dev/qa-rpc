var  xhr = require('xhr2');
const JSONRPC_VERSION='2.0';
const IP = "127.0.0.1";
const PORT = "8545";
const ENDPOINT = "http://"+IP+":"+PORT;

const HEADERS= {
		        "Content-Type": "application/json"
		    };
function requestBody(id,method,params){
	return {id:id,method:method,params:params,jsonrpc:JSONRPC_VERSION};
}

const HTTP_PRO = require("xmlhttprequest").XMLHttpRequest;

var httpp = new HTTP_PRO();

httpp.open("POST",ENDPOINT);
httpp.setRequestHeader("Content-Type", "application/json");
httpp.send(JSON.stringify( requestBody("eth_Syncing_smoke","eth_syncing",[])));

setTimeout(()=>{console.log(httpp.responseText);},200);