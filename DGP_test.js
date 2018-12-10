"use strict"

const { spawn } = require('child_process');
var toBlock, newBlockNum, minerListen, minerAcc, javaHTTP, rustHTTP,curBlock;

for(let i = 0; i < process.argv.length; i++){
	switch(process.argv[i]){
		case "--toBlock":
			toBlock = process.argv[++i];
			break;
		case "--newBlockNum":
			newBlockNum = process.argv[++i];
			break;
		case "--listen":
			minerListen = process.argv[++i];
			break;
		case "--account":
			minerAcc = process.argv[++i];
			break;
		case "--javaRPC":
			javaHTTP = process.argv[++i];
			break;
		case "--rustRPC":
			rustHTTP = process.argv[++i];
			break;
	}
}

if(!(toBlock || newBlockNum)){
	console.log("Either --newBlockNum or --toBlock is required");
	return;
}
minerListen = minerListen || "127.0.0.1:8007";
minerAcc = minerAcc || "0xa07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137";
javaHTTP = javaHTTP || "127.0.0.1:8545";
rustHTTP = rustHTTP || "127.0.0.1:8549";

var Provider = require("./utils/provider.js");
var java_provider = new Provider({type:"http"}).Path(javaHTTP);
var rust_provider = new Provider({type:"http"}).Path(rustHTTP);


//console.log(rust_provider);
// if(newBlockNum){
// 	let res = await rust_provider.sendRequest("getCurrentBlockNumber","eth_blockNumber",[]);
// 	curBlock = res.result;
// 	curBlock = parseInt(curBlock);
// 	toBlock = curBlock + parseInt(newBlockNum);
// }
toBlock = parseInt(toBlock);
const minerProc = spawn(process.env.HOME+"/Downloads/aionminer",["-l", minerListen,"-u",minerAcc,"-d", 0, "-t", 1],{stdio:[0, 1, 2]})

var oneAct = async ()=>{
	curBlock = parseInt((await rust_provider.sendRequest("getCurrentBlockNumber","eth_blockNumber",[])).result);
	if(curBlock >= toBlock){
		minerProc.kill();
		clearInterval(loop);
		
		let blkPriceCnt = 0;
		for(let blkNum = curBlock; blkNum>=0 && blkNum > blkNum-64; blkNum--){
			let res = await rust_provider.sendRequest("check-blocktx-"+blkNum,"eth_getBlockTransactionCountByNumber",[blkNum]);
			if(parseInt(res.result)>0) blkPriceCnt++;
		}
		console.log("[Total block price in 64 block windows] "+ blkPriceCnt);
		console.log("[java]:"+parseInt((await java_provider.sendRequest("java_gasPrice","eth_gasPrice",[])).result));
		console.log("[rust]:"+parseInt((await rust_provider.sendRequest("rust_gasPrice","eth_gasPrice",[])).result));

	}
}
var loop = setInterval(oneAct,700);