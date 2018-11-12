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
	var senderAcc= /*"0xa01f440752714ed46c33503a4c731aa9e81861175934dd12d4888a8778857c62"//*/"0xa07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137";

	var senderPW = "password";

	contract.file = fs.readFileSync(__dirname + '/testContracts/Counter.sol', {
    		encoding: 'utf8'
		});
	
	before(async()=>{
		//let resp = await cur_provider.sendRequest("pre-condition","eth_compileSolidity",[contract.file]);
		let resp = JSON.parse(
				'{"jsonrpc":"2.0","result":{"Counter":{"code":"605060405234156100105760006000fd5b5b3360026000508282909180600101839055555050505b61002c565b61033b8061003b6000396000f30060506040526000356c01000000000000000000000000900463ffffffff1680631a55d28b146100545780635b34b9661461006a578063a87d942c14610080578063f5c5ad83146100aa5761004e565b60006000fd5b34156100605760006000fd5b6100686100c0565b005b34156100765760006000fd5b61007e610199565b005b341561008c5760006000fd5b61009461024b565b6040518082815260100191505060405180910390f35b34156100b65760006000fd5b6100be61025d565b005b6001600160008282825054019250508190909055507f6816b015b746c8c8f573c271468a9bb4b1f0cb04ff12291673f7d2320a4901f76001604051808215151515815260100191505060405180910390a17f09a2ae7b00cae5ecb77463403c1d5d6c03cf6db222a78e22cbcafbe0a1ac9eec6001604051808215151515815260100191505060405180910390a17f62bd5a656ea630f6173e8b6739f7a1d0946d6367fe97c511dc92a0b4de4d20b1600160005054600060005054604051808381526010018281526010019250505060405180910390a15b565b6001600060008282825054019250508190909055506001600160008282825054019250508190909055507f6816b015b746c8c8f573c271468a9bb4b1f0cb04ff12291673f7d2320a4901f76001604051808215151515815260100191505060405180910390a17f62bd5a656ea630f6173e8b6739f7a1d0946d6367fe97c511dc92a0b4de4d20b1600160005054600060005054604051808381526010018281526010019250505060405180910390a15b565b6000600060005054905061025a565b90565b6001600060008282825054039250508190909055506001600160008282825054019250508190909055507f09a2ae7b00cae5ecb77463403c1d5d6c03cf6db222a78e22cbcafbe0a1ac9eec6001604051808215151515815260100191505060405180910390a17f62bd5a656ea630f6173e8b6739f7a1d0946d6367fe97c511dc92a0b4de4d20b1600160005054600060005054604051808381526010018281526010019250505060405180910390a15b5600a165627a7a723058204493a4342a0372449704e2a224dbaa5894b966f44d20488edea8d418aa1db8ad0029","info":{"abiDefinition":[{"anonymous":null,"constant":false,"inputs":[],"name":"incDecCounter","outputs":[],"payable":false,"type":"function"},{"anonymous":null,"constant":false,"inputs":[],"name":"incrementCounter","outputs":[],"payable":false,"type":"function"},{"anonymous":null,"constant":true,"inputs":[],"name":"getCount","outputs":[{"indexed":null,"name":"","type":"int128"}],"payable":false,"type":"function"},{"anonymous":null,"constant":false,"inputs":[],"name":"decrementCounter","outputs":[],"payable":false,"type":"function"},{"anonymous":null,"constant":null,"inputs":[],"name":null,"outputs":null,"payable":false,"type":"constructor"},{"anonymous":false,"constant":null,"inputs":[{"indexed":false,"name":"counter","type":"bool"}],"name":"CounterIncreased","outputs":null,"payable":null,"type":"event"},{"anonymous":false,"constant":null,"inputs":[{"indexed":false,"name":"counter","type":"bool"}],"name":"CounterDecreased","outputs":null,"payable":null,"type":"event"},{"anonymous":false,"constant":null,"inputs":[{"indexed":false,"name":"calls","type":"int128"},{"indexed":false,"name":"count","type":"int128"}],"name":"CounterValue","outputs":null,"payable":null,"type":"event"}]}}},"id":"pre-condition"}'
				);

		contract.name = (Object.keys(resp.result))[0];
		contract.code = "0x"+resp.result[contract.name].code;
		contract=utils.parseContract(resp,contract);
		await cur_provider.sendRequest("pre-condition","personal_unlockAccount",[senderAcc,senderPW,30*60]);
	})


	after(()=>{
		console.log(this);

	});

	xdescribe("FT-TC3: log filter catch the log for a certain contract addr",()=>{
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
					utils.waitBlock([120,1],cur_provider)
				]);
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs","eth_getFilterLogs",[filterID])
				])
			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				chai.expect(res.result).to.have.length(6);
				res.result.forEach((log)=>{
					chai.expect(log.address).to.equal(contract.address[0]);
				});
			});
		});
		it("FT-TC3-1:create a filter only containing fromBlock to this contract address and call 3 methods and check for filterChanges and filter logs",async()=>{
			filterID = (await cur_provider.sendRequest("FT-TC3-createFilter","eth_newFilter",[{address:contract.address[0],fromBlock:"earliest"}])).result;
			

			let resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					utils.waitBlock([120,1],cur_provider)
				]);
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs","eth_getFilterLogs",[filterID])
				])
			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				if(index == 0)
					chai.expect(res.result).to.have.length(6);
				else
					chai.expect(res.result).to.have.length(12);
				res.result.forEach((log)=>{
					chai.expect(log.address).to.equal(contract.address[0]);
				});
			});
		});
		it("FT-TC3-2:create a filter only containing toBlock to this contract address and call 3 methods and check for filterChanges and filter logs",async()=>{
			filterID = (await cur_provider.sendRequest("FT-TC3-createFilter","eth_newFilter",[{address:contract.address[0],toBlock:"latest"}])).result;
			let resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					utils.waitBlock([120,1],cur_provider)
				]);
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs","eth_getFilterLogs",[filterID])
				])

			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				if(index == 0)
					chai.expect(res.result).to.have.length(6);
				else
					chai.expect(res.result).to.have.length(0);
				res.result.forEach((log)=>{
					chai.expect(log.address).to.equal(contract.address[0]);
				});
			});
		});
		it("FT-TC3-3:create a filter without from/toBlock field to this contract address and call 3 methods and check for filterChanges and filter logs",async()=>{
			filterID = (await cur_provider.sendRequest("FT-TC3-createFilter","eth_newFilter",[{address:contract.address[0]}])).result;
			let resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					utils.waitBlock([120,1],cur_provider)
				]);
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs","eth_getFilterLogs",[filterID])
				])

			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				if(index == 0)
					chai.expect(res.result).to.have.length(6);
				else
					chai.expect(res.result).to.have.length(0);
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
		it("FT-TC4: log filter catch the log in certain blocks",async()=>{
			if(contract.address.length ==0) await deploy(senderAcc,contract);
			//get current block number (bn1)
			let resp = await cur_provider.sendRequest("FT-TC4-fromBlock","eth_blockNumber",[]);
			fromBlock = resp.result;
			toBlock = "0x"+(parseInt(fromBlock)+7).toString(16);

			let filterID4_1 = (await cur_provider.sendRequest("FT-TC4-1-createFilter","eth_newFilter",[{fromBlock:"0x"+(parseInt(fromBlock)+3).toString(16),toBlock:"latest"}])).result;
			let filterID4_2 = (await cur_provider.sendRequest("FT-TC4-2-createFilter","eth_newFilter",[{fromBlock:fromBlock,toBlock:toBlock}])).result;

			//call methods to create (en1) events, all transactions mined before bn1+5 block being sealed
			await Promise.all([
					cur_provider.sendRequest("FT-TC4-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC4-meth2","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					
					//wait after bn1+5 block being sealed
					utils.waitBlockUntil([parseInt(fromBlock)+3,120],cur_provider)
				]);
			await Promise.all([
					cur_provider.sendRequest("FT-TC4-meth3","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					utils.waitBlockUntil([toBlock,120],cur_provider)
				]);
			resp = await cur_provider.sendRequest("FT-TC4-createFilter","eth_newFilter",[{fromBlock:fromBlock,toBlock:toBlock}]);

			filterID = resp.result;
			//call methods to create (en2) events
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC4-meth4","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC4-meth5","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC4-meth6","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					utils.waitBlock([120,1],cur_provider)
				]);

			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC4-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC4-getFilterLogs","eth_getFilterLogs",[filterID]),
					cur_provider.sendRequest("FT-TC4-getLogs-this-testsuite","eth_getLogs",[{fromBlock:fromBlock,toBlock:"latest"}]),
					cur_provider.sendRequest("FT-TC4-1-getFilterChanges","eth_getFilterChanges",[filterID4_1]),
					cur_provider.sendRequest("FT-TC4-1-getFilterLogs","eth_getFilterLogs",[filterID4_1]),
					cur_provider.sendRequest("FT-TC4-2-getFilterChanges","eth_getFilterChanges",[filterID4_2]),
					cur_provider.sendRequest("FT-TC4-2-getFilterLogs","eth_getFilterLogs",[filterID4_2])
				])
			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
				if(index == 2){
					chai.expect(res.result).to.have.length(12);
				}else
					chai.expect(res.result).to.have.length(6);

			});
		});
		it("FT-TC4-3: invalid: fromBlock # > toBlock #",async()=>{
			toBlock = (await cur_provider.sendRequest("FT-TC4-3-fromBlock","eth_blockNumber",[])).result;
			fromBlock = "0x"+(parseInt(toBlock)+7).toString(16);
			await Promise.all([
				cur_provider.sendRequest("FT-TC4-3-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
				cur_provider.sendRequest("FT-TC4-3-meth2","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
				
				//wait after bn1+5 block being sealed
				utils.waitBlockUntil([fromBlock,120],cur_provider)
			]);

			let resp  =  await cur_provider.sendRequest("FT-TC4-3-createFilter", "eth_newFilter",[{fromBlock:fromBlock,toBlock:toBlock}]);
			//return chai.expect(res).to.have.property("error");
			filterID = resp.result;


			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC4-getFilterChanges","eth_getFilterChanges",[filterID]),
					cur_provider.sendRequest("FT-TC4-getFilterLogs","eth_getFilterLogs",[filterID])
				])

			return resp.forEach((res,index)=>{
				logger.log("check result: "+index);
		
				chai.expect(res.result).to.have.length(0);

			});



		})

	})
	xdescribe("FT-TC5:",()=>{
		/*
			create a filter for a topic
			call methods to create same event from different contract address
			wait for the transactions mined
			get eth_getFilterChanges
			get eth_getFilterLogs
		*/
		var filterID,fromBlock;
		var topics={};
		before(()=>{
			Object.keys(contract.event).forEach((name)=>{
				topics[name] = {};
				topics[name].hash = "0x"+utils.getEvent(contract.event[name]);
				topics[name].counts = 0;
			});
		});

		it("FT-TC5: log filter catch the log for certain topics", async()=>{
			while(contract.address.length < 3) await deploy(senderAcc,contract);
			
			let resp = await cur_provider.sendRequest("FT-TC5-fromBlock","eth_blockNumber",[]);
			fromBlock = resp.result;
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC5-createFilter","eth_newFilter",[{fromBlock:fromBlock,topics:[topics.CounterIncreased.hash]}]),
					cur_provider.sendRequest("FT-TC5-createFilter","eth_newFilter",[{fromBlock:fromBlock,topics:[topics.CounterDecreased.hash]}]),
					cur_provider.sendRequest("FT-TC5-createFilter","eth_newFilter",[{fromBlock:fromBlock,topics:[[],[]]}]),
					cur_provider.sendRequest("FT-TC5-createFilter","eth_newFilter",[{fromBlock:fromBlock,topics:[topics.CounterValue.hash]}]),

				]);
			let increaseFilter = resp[0].result;
			let decreaseFilter = resp[1].result;
			let combineFilter = resp[2].result;
			let countFilter = resp[3].result;

			//

			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC5-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC5-meth2","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC5-meth3","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC5-meth4","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC5-meth5","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC5-meth6","eth_sendTransaction",[{from:senderAcc,to:contract.address[1],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC5-meth7","eth_sendTransaction",[{from:senderAcc,to:contract.address[2],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC5-meth8","eth_sendTransaction",[{from:senderAcc,to:contract.address[2],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC5-meth9","eth_sendTransaction",[{from:senderAcc,to:contract.address[2],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC5-meth10","eth_sendTransaction",[{from:senderAcc,to:contract.address[2],data:utils.getContractFuncData(contract.func.incDecCounter,[])}]),
					utils.waitBlock([120,1],cur_provider)
				]);
			resp = await Promise.all([
					cur_provider.sendRequest("FT-TC3-getFilterChanges-inc","eth_getFilterChanges",[increaseFilter]), //0
					cur_provider.sendRequest("FT-TC3-getFilterLogs-inc","eth_getFilterLogs",[increaseFilter]),
					cur_provider.sendRequest("FT-TC3-getFilterChanges-dec","eth_getFilterChanges",[decreaseFilter]), //2
					cur_provider.sendRequest("FT-TC3-getFilterLogs-dec","eth_getFilterLogs",[decreaseFilter]),
					cur_provider.sendRequest("FT-TC3-getFilterChanges-combine","eth_getFilterChanges",[combineFilter]), //4
					cur_provider.sendRequest("FT-TC3-getFilterLogs-combine","eth_getFilterLogs",[combineFilter]),
					cur_provider.sendRequest("FT-TC3-getFilterLogs-count","eth_getFilterLogs",[countFilter]), //6
					cur_provider.sendRequest("FT-TC3-getFilterChanges-count","eth_getFilterChanges",[countFilter]),
					cur_provider.sendRequest("FT-TC3-getlogs","eth_getLogs",[{fromBlock:fromBlock}]), //8
					
				])
			return resp.forEach((res,index)=>{
				switch (index){
					case 0:
					case 1:
						chai.expect(res.result).to.have.length(7);
						break;
					case 2:
					case 3:
						chai.expect(res.result).to.have.length(4);
						break;
					case 6:
					case 7:
						chai.expect(res.result).to.have.length(10);
						break;
				}

			});

		});
	});


	xdescribe("FT-TC6: check log filter multiple times",()=>{
		let filterID,fromBlock;
		before(async()=>{
			if(contract.address.length ==0) await deploy(senderAcc,contract);
			fromBlock = (await cur_provider.sendRequest("FT-TC6-get_fromBlock#pre","eth_blockNumber",[])).result;
			//create a filter;
			filterID = (await cur_provider.sendRequest("FT-TC6-createFilter-pre","eth_newFilter",[{fromBlock:fromBlock,address:contract.address}])).result;
		});

		it("FT-TC6:generate events e1",async()=>{
			await Promise.all([
					cur_provider.sendRequest("FT-TC6-meth1","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC6-meth2","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.decrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC6-meth3","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incDecCounter,[])}]),
					utils.waitBlock([120,1],cur_provider)
				]);
			let resp = await Promise.all([
					cur_provider.sendRequest("FT-TC6-getFilterChanges-pre","eth_getFilterChanges",[filterID]), //0
					cur_provider.sendRequest("FT-TC6-getFilterLogs-pre","eth_getFilterLogs",[filterID])
				]);
			return resp.forEach((res)=>{
				chai.expect(res.result).to.have.length(7);
			})

		});

		it("FT-TC6:recheck filter changes and logs",async()=>{
			await utils.waitBlock([120],cur_provider);
			let resp = await Promise.all([
					cur_provider.sendRequest("FT-TC6-getFilterChanges","eth_getFilterChanges",[filterID]), //0
					cur_provider.sendRequest("FT-TC6-getFilterLogs","eth_getFilterLogs",[filterID])
				]);
			return resp.forEach((res,index)=>{
				if(index == 0)
					chai.expect(res.result).to.have.length(0);
				else
					chai.expect(res.result).to.have.length(7);
			});
		});

		it("FT-TC6-1:generate events e2, and recheck filter changes and logs",async()=>{
			await utils.waitBlock([120],cur_provider);
			await Promise.all([
					cur_provider.sendRequest("FT-TC6-1-meth4","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incrementCounter,[])}]),
					cur_provider.sendRequest("FT-TC6-1-meth6","eth_sendTransaction",[{from:senderAcc,to:contract.address[0],data:utils.getContractFuncData(contract.func.incDecCounter,[])}]),
					utils.waitBlock([120,1],cur_provider)
				]);
			let resp = await Promise.all([
					cur_provider.sendRequest("FT-TC6-1-getFilterChanges","eth_getFilterChanges",[filterID]), //0
					cur_provider.sendRequest("FT-TC6-1-getFilterLogs","eth_getFilterLogs",[filterID])
				]);
			return resp.forEach((res,index)=>{
				if(index == 0)
					chai.expect(res.result).to.have.length(5);
				else
					chai.expect(res.result).to.have.length(12);
			});

		});

	})

});