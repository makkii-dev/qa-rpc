module.exports = (logger)=>{
	this.logger = logger
	var self = this;
	self.name = "RUNTIME_VARIABLES";
	self.accounts = {
		"0xa07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137":{
			_privateKey:"0x23c6a047cc6b88c8e7b023ade132304797ac86675db50673afae7130e2476aaf54c0b58818d59cdf27f7aa7b2ae61e62fac7c3c4fadd3fc737dcf256314992f0",
			publicKey: "0x54c0b58818d59cdf27f7aa7b2ae61e62fac7c3c4fadd3fc737dcf256314992f0",
			addr:      "0xa07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137",
		}
	}
	this.precompile = (()=>{
		let _abis = require("../../testContracts/precompile.json");
		let _res = {};
		_abis.forEach((abi,index)=>{
			_res[abi.name] = abi.addr;
		})
		return _res;
	})();
	this.emptyString="";
	this.update=(method,resp,req)=>{
		
		switch(method){
			case "eth_newPendingTransactionFilter":
			case "eth_newBlockFilter":
			case "eth_newFilter":
				this.lastFilterID = resp.result;
				break;
			case "personal_newAccount":
				this.newAccount = resp.result;
				this.newPassword = req[0];
				break;
			case "eth_getBlockByNumber":
			
			//case "eth_getBlockTransactionCountByNumber":
				this.blockHash = resp.result.hash;
				this.blockNumber = resp.result.number|| resp.result.height;
				break;

			case "eth_sendRawTransaction":
			case "eth_sendTransaction":
				this.txHash = resp.result;
				if(/contract/.test(resp.id)){
					this.contract.hash = resp.result;
				}
				break;
			case "eth_signTransaction":
				console.log(resp.result.tx);
				this.txHash = resp.result.tx.hash;
				this.txRaw = resp.result.tx.raw;
				break;
			case "personal_signTransaction":
				this.txRaw = resp.result;
				break;
			case "pairKeyCreateAcc":
				this.account = resp;
				break;
			case "eth_compileSolidity":
				this.contract = {};
				this.contract.func = {};
				this.contract.event = {};

				//let contractname = Object.keys(resp.result)[0];
				//console.log(contractname);
				this.contract.names = Object.keys(resp.result);
				Object.keys(resp.result).forEach((contract,index)=>{
					console.log(contract);
					this.contract[contract] = {}
					this.contract[contract].code = resp.result[contract].code
					
					resp.result[contract].info.abiDefinition.forEach((item)=>{
						if(item.type == "function"){
							this.contract.func[item.name] = item;
						}else{
							this.contract.event[item.name] = item;
						}
					})
				});
				
				break;
			case "eth_getTransactionReceipt":
				if(resp.result !=null && resp.result.contractAddress !==undefined && resp.result.contractAddress !==null)
					this.contractAddress = resp.result.contractAddress;
				break;
			case "eth_getTransactionByHash":
				if(resp.result.creates!==undefined && resp.result.creates!==null)
				this.contractAddress = resp.result.creates;
				break;
			case "eth_getTransactionCount":
				this.nonce = resp.result;
				break;
			case "eth_coinbase":
				this.coinbase = resp.result;
				break;
			case "eth_blockNumber":
				this.blockNumber = resp.result;
				break;
			case "eth_sign":
				this.signedMsg = resp.result;
				break;


			///stratum rpc variables:
			case "getblocktemplate":
				this.headerHash = resp.result.headerHash;
				this.headerHeight = resp.result.height-1;
				break;
			case "getHeaderByBlockNumber":
				this.headerNonce = resp.result.nonce;
				this.solution = resp.result.solution;
				this.headerHash = resp.result.headerHash;
				break;

		}
		return this;
	}
	this.reset = ()=>{
		self = Object.create(this);
	}
	this.storeVariables = (instructions,resp)=>{
		if(!instructions) return self;
		console.log(instructions);
		let instrs = instructions.split(",");
		instrs.forEach((instr, index)=>{
			console.log(instr);
			vals = instr.split("=>");
			let sourceName = vals[0].split(".");
			let targetName = vals[1].split(".");
			let sourceValue  = resp;
			for(let depth = 0; depth < sourceName.length; depth++){
				let name = sourceName[depth];
				console.log(name);
				if(sourceValue[name]) sourceValue = sourceValue[name];
				else {
					logger.error("fail to find field in response : "+ vals[0]);
					break;
				}
			}

			let target = this;
			for(let depth = 0; depth < targetName.length; depth++){
				let name = targetName[depth];
				if(depth == targetName.length-1){
					target[name] = sourceValue;
				}else{
					if(!target[name]) target[name] = {};
					target = target[name]; 
				}
			}

		});

	}
	this.reassign = (instruction)=>{
		if(!instruction) return this;
		let pairs = instruction.split(',');
		pairs.forEach((pair, index)=>{
			let vals = pair.split("=>");
			this[vals[1]] = this[vals[0]];
		})
		return this;
	}
	this.preStoreVariables = (instruction)=>{
		if(!instruction) return this;
		let pairs = instruction.split(',');
		pairs.forEach((pair, index)=>{
			let vals = pair.split("=");
			this[vals[0]] =vals[1];
		})
		return this;
	}
	return this;
};