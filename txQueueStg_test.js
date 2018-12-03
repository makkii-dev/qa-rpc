"use strict"
var logger = new (require("./utils/logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;
const DEFAULT_GAS_PRICE = 10000000000;
const Provider = require("./utils/provider");
var utils = require("./utils/utils1");
var Helper = require("./utils/helper1");
logger.updatePath("transaction_test");
var provider_type;
//load arguements from command line and create a provider
for(let i = 0; i < process.argv.length; i++){
	if(process.argv[i]=='--type') {
		provider_type= process.argv[++i];
		continue;
	}
}
provider_type=provider_type||'default';

var cur_provider = new Provider({type:provider_type,logger:logger});
var helper = new Helper({provider:cur_provider,logger:logger});

var accounts = [{
		addr:"0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c",
		password: "password"
	},{
		addr:"0xa054340a3152d10006b66c4248cfa73e5725056294081c476c0e67ef5ad25334",
		password: "password"
	},{
		addr:"0xa07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137",
		password: "password"
	}	
]

var txObj = (from, to , gasPrice, gasLimit)=>{
	let res =  {
		from:accounts[from].addr, 
		to:accounts[to].addr,
		value: utils.dec2Hex(100000000),
		gas: utils.dec2Hex(gasLimit),
		gasPrice: utils.dec2Hex(gasPrice)
	}
	console.log(res);
	return res;
}

var orderNumber = (txRcp)=>{
	return parseInt(txRcp.result.blockNumber)*700+ parseInt(txRcp.result.transactionIndex);
}

describe("Transaction Queue Strategy Test",()=>{

	it("TQS-TC01: gas_price strategy(default)",async(done)=>{
		let accLen = accounts.length;
		let txArr = new Array(accLen);

		let unlockReqs = new Array(accLen);

		accounts.forEach((acc,index)=>{
			unlockReqs[index] = cur_provider.sendRequest("TQS-TC01-unlock"+index, "personal_unlockAccount",[accounts[index].addr, accounts[index].password, null]);
			//txArr[index] = cur_provider.sendRequest("TQS-TC01-tx"+index, "eth_sendTransaction",[txObj(index,(index+1)%accLen,DEFAULT_GAS_PRICE+1000*index,21000)]);
		})
		//send txs
		Promise.all([unlockReqs]).then(()=>{
			accounts.forEach((acc,index)=>{
				//unlockReqs[index] = cur_provider.sendRequest("TQS-TC01-unlock"+index, "personal_unlockAccount",[accounts[index].addr, accounts[index].password, null]);
				txArr[index] = cur_provider.sendRequest("TQS-TC01-tx"+index, "eth_sendTransaction",[txObj(index,(index+1)%accLen,DEFAULT_GAS_PRICE+1000*index,21000)]);
			})
			return Promise.all(txArr);
		}).then((resps)=>{
			let receiptArray = new Array(accLen);
			resps.forEach((resp, index)=>{
				receiptArray[index] = utils.getTxReceipt(resp.result,cur_provider,120);
			})
			return Promise.all(receiptArray);
		}).then((resps)=>{
			let expectOrder=true;
			for(let i = accLen-1;i>0; i --){
				if(orderNumber(resps[i])> orderNumber(resps[i-1])){
					expectOrder = false;
					break;
				}
			}
			chai.expect(expectOrder).to.be.true;
			done();
		}).catch((e)=>{
			done(e);
		});
	});


	it("TQS-TC02: gas strategy(default)",async(done)=>{
		let accLen = accounts.length;
		let txArr = new Array(accLen);
		accounts.forEach((acc,index)=>{
			txArr[index] = cur_provider.sendRequest("TQS-TC02-tx"+index, "personal_sendTransaction",[txObj(index,(index+1)%accLen,DEFAULT_GAS_PRICE,21000+index*100),accounts[index].password]);
		})
		//send txs
		Promise.all(txObj).then((resps)=>{
			let receiptArray = new Array(accLen);
			resps.forEach((resp, index)=>{
				receiptArray[index] = utils.getTxReceipt(resp.result,cur_provider,120);
			})
			return Promise.all(receiptArray);
		},(err)=>{
			console.log(err);
			done(err);
		}).then((resps)=>{
			let expectOrder=true;
			for(let i = accLen-1;i>0; i --){
				if(orderNumber(resps[i])< orderNumber(resps[i-1])){
					expectOrder = false;
					break;
				}
			}
			chai.expect(expectOrder).to.be.true;
			done();
		}).catch((e)=>{
			done(e);
		});
	});



})