class Helper{
	constructor(options){
		this.logger = options.logger||console;
		this.provider = options.provider;
		
	}
	WaitNewBlock(timeout){
		var oldBlockNo,newBlockNo;
		var self = this;

		return new Promise((resolve,reject)=>{
					console.log(self.toString());
					self.provider.sendRequest("helper","eth_blockNumber",[]).then((resp)=>{
						oldBlockNo = resp.result;
						console.log(resp);
					});
					console.log("-----------"+JSON.stringify(oldBlockNo));
					var checkblock = ()=>{

						self.provider.sendRequest("helper","eth_blockNumber",[]).then((resp)=>{
							newBlockNo= resp.result;
							console.log("-----------"+oldBlockNo+" "+newBlockNo);
							if(parseInt(newBlockNo) > parseInt(oldBlockNo)){
								console.log("-----true------"+oldBlockNo+" "+newBlockNo);
								clearInterval(checkloop);
								resolve();
							}
						});

					}
					var checkloop = setInterval(checkblock,2000);
					setTimeout(()=>{clearInterval(checkloop);resolve()},parseInt(timeout)*1000);
		});
	}
	
	delay(timeout){
		return new Promise((resolve,reject)=>{
			setTimeout(resolve,parseInt(timeout)*1000);
		})
	}
	
}
module.exports=Helper;