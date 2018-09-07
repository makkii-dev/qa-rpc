const provider = new (require("xmlhttprequest").XMLHttpRequest)();
var xhr = require("xhr")
const JSONRPC_VERSION='2.0';

const HEADERS= {
		        "Content-Type": "application/json"
		    };
function requestBody(id,method,params){
	return {id:id,method:method,params:params,jsonrpc:JSONRPC_VERSION};
}

function syncing(endpoint){

	console.log(endpoint);
	console.log(HEADERS);
	console.log(requestBody("eth_Syncing_smoke","eth_syncing",[]));
	return new Promise((resolve,reject)=>{
		xhr({
		    method: "post",
		    body: requestBody("eth_Syncing_smoke","eth_syncing",[]),
		    uri: endpoint,
		    headers: HEADERS
		}, function (err, res, body) {
			console.log("res");
		    console.log(res);
		    console.log(body);
		    if(err){
		    	reject(Error(err));
		    }else{
		    	
		    	resolve(res.body);
		    }
		})
		// xhr.post(endpoint,
		// 		{	headers:HEADERS,
		// 			body:requestBody("eth_Syncing_smoke","eth_syncing",[])
		// 		},
		// 		(err,res)=>{
		// 				console.log("res");
		// 			    console.log(res);
		// 			    console.log(body);
		// 			    if(err){
		// 			    	reject(Error(err));
		// 			    }else{
					    	
		// 			    	resolve(res.body);
		// 			    }
		// 		})
	});
} 

module.exports={
	syncing: syncing
}