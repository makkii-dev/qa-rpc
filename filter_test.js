"use strict"
var logger = new (require("./utils/logger"))();
logger.CONSOLE_LOG = true;
logger.FILE_LOG = true;
const Provider = require("./utils/provider");
var utils = require("./utils/utils1");
var Helper = require("./utils/helper1");
var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
var fs = require("fs");
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
logger.updatePath("filter_test");
var provider_type;
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


var deploy = async(sender,contract)=>{
	let resp = await cur_provider.sendRequest("FT-TC3-deploy","eth_sendTransaction",[{from:sender,data:contract.code}]);
	contract.address.push(await utils.getTxReceipt(resp.result,cur_provider,100));
	return Promise.resolve();
}



describe("Filter test scenarios",()=>{
	var contract = {};
	contract.address = [];
	var senderAcc= "0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c";
	var senderPW = "password";

	contract.file = fs.readFileSync(__dirname + '/testContracts/Counter.sol', {
    		encoding: 'utf8'
		});
	
	before(async()=>{
		let resp = await cur_provider.sendRequest("pre-condition","eth_compileSolidity",[contract.file]);
		contract.name = (Object.keys(resp.result))[0];
		contract.code = "0x"+resp.result[contract.name].code;
		contract=utils.parseContract(resp,contract);
		await cur_provider.sendRequest("pre-condition","personal_unlockAccount",[senderAcc,senderPW,20*60]);
	})
	describe("FT-TC3: log filter catch the log for a certain contract addr",()=>{
		/*
			deploy a contract, and get the contract address
			create a filter to this contract address
			call methods which create events in that contract address
			call method which create events in different contract address
			wait for the transaction mined
			get eth_getFilterChanges
			get eth_getFilterLogs
		*/
		var filterID;
		it("deploy a contract, and get the contract address",async()=>{
			await Promise.all([deploy(senderAcc,contract),deploy(senderAcc,contract)]);
			return chai.expect(contract.address).to.have.length(2);
		})
		it("create a filter containing fromBlock and toBlock to this contract address and call 3 methods and check for filterChanges and filter logs",async()=>{
			filterID = (await cur_provider.sendRequest("FT-TC3-createFilter","eth_newFilter",[{address:contract.address[0],fromBlock:"earliest",toBlock:"latest"}])).result;
			let resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					utils.waitBlock([120,2],cur_provider)
				]);
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs","eth_getFilterLogs",[filterID])
				])
			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				chai.expect(res.result).to.have.length(3);
				res.result.forEach((log)=>{
					chai.expect(log.address).to.equal(contract.address[0]);
				});
			});
		});
		it("create a filter only containing fromBlock to this contract address and call 3 methods and check for filterChanges and filter logs",async()=>{
			filterID = (await cur_provider.sendRequest("FT-TC3-createFilter","eth_newFilter",[{address:contract.address[0],fromBlock:"earliest"}])).result;
			
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs","eth_getFilterLogs",[filterID])
				])
			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				chai.expect(res.result).to.have.length(3);
				res.result.forEach((log)=>{
					chai.expect(log.address).to.equal(contract.address[0]);
				});
			});
		});
		it("create a filter only containing toBlock to this contract address and call 3 methods and check for filterChanges and filter logs",async()=>{
			filterID = (await cur_provider.sendRequest("FT-TC3-createFilter","eth_newFilter",[{address:contract.address[0],toBlock:"latest"}])).result;
			
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs","eth_getFilterLogs",[filterID])
				])
			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				chai.expect(res.result).to.have.length(3);
				res.result.forEach((log)=>{
					chai.expect(log.address).to.equal(contract.address[0]);
				});
			});
		});
		it("create a filter without from/toBlock field to this contract address and call 3 methods and check for filterChanges and filter logs",async()=>{
			filterID = (await cur_provider.sendRequest("FT-TC3-createFilter","eth_newFilter",[{address:contract.address[0]}])).result;
			
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs","eth_getFilterLogs",[filterID])
				])
			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				chai.expect(res.result).to.have.length(3);
				res.result.forEach((log)=>{
					chai.expect(log.address).to.equal(contract.address[0]);
				});
			});
		});
	});

	describe("FT-TC4: log filter catch the log in certain blocks",()=>{
		/*
			get current block number (bn1)
			create a filter from bn1 block to bn1+5 block
			call methods to create (en1) events, all transactions mined before bn1+5 block being sealed
			wait after bn1+5 block being sealed
			call methods to create (en2) events
			get eth_getFilterChanges
			get eth_getFilterLogs
		*/
		var filterID, fromBlock, toBlock;
		it("",async()=>{
			if(contract.address.length ==0) await deploy(senderAcc,contract);
			//get current block number (bn1)
			let resp = await cur_provider.sendRequest("FT-TC4-fromBlock","eth_blockNumber",[]);
			fromBlock = resp.result;
			toBlock = "0x"+(parseInt(fromBlock)+7).toString(16);
			//create a filter from bn1 block to bn1+5 block

			//call methods to create (en1) events, all transactions mined before bn1+5 block being sealed
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth2","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth3","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					//wait after bn1+5 block being sealed
					utils.waitBlockUntil([toBlock,120],cur_provider)
				]);
			resp = await cur_provider.sendRequest("FT-TC4-createFilter","eth_newFilter",[{fromBlock:fromBlock,toBlock:toBlock}]);
			filterID = resp.result;
			//call methods to create (en2) events
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-meth4","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth5","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth6","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					utils.waitBlock([120,1],cur_provider)
				]);

			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs","eth_getFilterLogs",[filterID]),
					cur_provider.sendRequest("FT-TC3-getLogs-this-testsuite","eth_getLogs",[{fromBlock:fromBlock,toBlock:"latest"}])
				])
			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				if(index == 2){
					chai.expect(res.result).to.have.length(6);
				}else
				chai.expect(res.result).to.have.length(3);

			});
		});
	})
	describe("",()=>{
		/*
			create a filter for a topic
			call methods to create same event from different contract address
			wait for the transactions mined
			get eth_getFilterChanges
			get eth_getFilterLogs
		*/
	})

})