"use strict"
var logger = new (require("./utils/logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;
const Provider = require("./utils/provider");
var utils = require("./utils/utils1");
var Helper = require("./utils/helper1");
var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
logger.updatePath("transaction_test");
var provider_type;
//load arguements from command line and create a provider
for(let i = 0; i < process.argv.length; i++){
	if(process.argv[i]=='--type') {
		provider_type= process.argv[++i];
		continue;
	}else if(process.argv[i]== "--step"){
		runMethod = step;
	}
}
provider_type=provider_type||'default';

var cur_provider = new Provider({type:provider_type,logger:logger});
var helper = new Helper({provider:cur_provider,logger:logger});
var txObj = {from:"0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c",to:"0xa054340a3152d10006b66c4248cfa73e5725056294081c476c0e67ef5ad25334",value:"0x12"}


/// main test
describe("transactions",()=>{
	
	
	it("TXTC03 -1:nonce -kernel sign multiple transactions",async()=>{
		var nonce = (await cur_provider.sendRequest("TXTC03-1-nonce","eth_getTransactionCount",["0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c"])).result;
		nonce = parseInt(nonce);
		var reqs = [
					cur_provider.sendRequest("TXTC03-1-unlock","personal_unlockAccount",["0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c","password",100]),
					cur_provider.sendRequest("TXTC03-1-1",'eth_signTransaction',[txObj]),
					cur_provider.sendRequest("TXTC03-1-2",'eth_signTransaction',[txObj]),
					cur_provider.sendRequest("TXTC03-1-3",'eth_signTransaction',[txObj])
					];
		let ress = await Promise.all(reqs);
		
		var txs  = ress.filter((item)=>{
			return typeof item.result == 'Object' || typeof item.result == "object";
		});
		console.log(txs);
		reqs = [];
		txs.forEach((tx)=>{
			reqs.push(cur_provider.sendRequest("TXTC03-1",'eth_sendRawTransaction',[tx.result.raw]));
		});
		console.log(reqs);
		
		await Promise.all(reqs);
		await utils.waitBlock([120,1],cur_provider);
		txs.sort((a,b)=>{
			return a.result.tx.nonce - b.result.tx.nonce;
		})
		return txs.forEach((tx)=>{
				logger.log(tx.result.tx.nonce +" -- "+ nonce)
				chai.expect(parseInt(tx.result.tx.nonce)).to.equal(nonce++);
			});

	});
	it("TXTC04: nonce - send a transaction with the nonce bigger than this account's transaction counts",async()=>{
		/*
			send a transaction with nonce = transactionCounts +2
			wait a few block, no transaction has been sealed
			send another 2 tx without a nonce field
		*/
		var nonce = (await cur_provider.sendRequest("TXTC04-nonce","eth_getTransactionCount",["0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c"])).result;
		nonce = parseInt(nonce);
		let biggerNonceTx = Object.assign({},txObj);
		biggerNonceTx.nonce ="0x" +(nonce+2).toString(16);
		let res = await Promise.all([cur_provider.sendRequest("TXTC04_unlockAcc","personal_unlockAccount",["0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c","password",100]),
									cur_provider.sendRequest("TXTC04_bigger_nonce","eth_sendTransaction",[biggerNonceTx])]);
		let bigTxHash = res[1].result;
		await utils.waitBlock([120,1],cur_provider);
		res = await cur_provider.sendRequest("TXTC04-getTxRpt-null","eth_getTransactionReceipt",[bigTxHash]);
		console.log(res);
		chai.expect(res.result).to.be.null;
		await Promise.all([
				cur_provider.sendRequest("TXTC04_1","eth_sendTransaction",[txObj]),
				cur_provider.sendRequest("TXTC04_2","eth_sendTransaction",[txObj]),
				utils.waitBlock([120,2],cur_provider)
			]);
		res = await cur_provider.sendRequest("TXTC04-getTxRpt","eth_getTransactionReceipt",[bigTxHash]);
		return chai.expect(res.result).not.to.be.null;

	});

})


