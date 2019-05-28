var rlp = require("aion-rlp");
var AionLong = rlp.AionLong;
var aionLib = require('../packages/aion-lib/src/index.js');
var blake2b256 = aionLib.crypto.blake2b256;
var toBuffer = aionLib.formats.toBuffer;
var Buffer = aionLib.formats.Buffer;
var keccak256 = aionLib.crypto.keccak256;

var bufferToZeroXHex = aionLib.formats.bufferToZeroXHex;
var nacl = aionLib.crypto.nacl;
var aionPubSigLen = aionLib.accounts.aionPubSigLen;
var removeLeadingZeroX = aionLib.formats.removeLeadingZeroX;
var BN = require('bn.js');
// var BigNumber = require("bignumber.js");

var paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
var paramTypeNumber = new RegExp(/^[0-9]*$/);
var paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/);

function padZeros(value, length) {
    value = arrayify(value);

    if (length < value.length) { throw new Error('cannot pad'); }

    var result = Buffer.alloc(length);
    result.set(value, length - value.length);
    return result;
}

function bigNumberify(val) {
  return new BN(val);
}
function arrayify(value) {
    return toBuffer(value);
}


function str2Obj(str,delimiter,separator, runtime_vars){

		str = str.substring(1,str.length-1);
		console.log(str);
		var obj = {};
		if(str.length ===0) return obj;
		str.split(delimiter).forEach((item)=>{
			var pair = item.split(separator);
			if(/^_/.test(pair[1])){
				if(runtime_vars[pair[1].substr(1)]===undefined) throw new Error(pair[1]+" has not been saved in previous steps");
				pair[1] = runtime_vars[pair[1].substr(1)];
			}
			if(pair[0]=='limit' || pair[0]=='block'){
				obj[pair[0]] = parseInt(pair[1]);
			}else if(pair[0]=='time'){
				obj[pair[0]] = Date.now();
			}else if(/^\[\S*\]$/.test(pair[1])){
				obj[pair[0]] = str2Arr(pair[1],',',runtime_vars);
			}else{
				if(/^{\S*}$/.test(pair[1])){
					pair[1]= str2Obj(pair[1],'+','-',runtime_vars);
				}
				obj[pair[0]] = pair[1];
			}
		});
		return obj;
}


function toUtf8Bytes(str) {
    var result = [];
    var offset = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            result[offset++] = c;
        } else if (c < 2048) {
            result[offset++] = (c >> 6) | 192;
            result[offset++] = (c & 63) | 128;
        } else if (((c & 0xFC00) == 0xD800) && (i + 1) < str.length && ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
            result[offset++] = (c >> 18) | 240;
            result[offset++] = ((c >> 12) & 63) | 128;
            result[offset++] = ((c >> 6) & 63) | 128;
            result[offset++] = (c & 63) | 128;
        } else {
            result[offset++] = (c >> 12) | 224;
            result[offset++] = ((c >> 6) & 63) | 128;
            result[offset++] = (c & 63) | 128;
        }
    }

    return result;
}



function str2Arr(str,delimiter,runtime_vars){
	console.log(str);
	str = str.substring(1,str.length-1);
	var arr = [];
	if(str.length == 0) return arr;
	str.split(delimiter).forEach((item)=>{
		if(/^{\S*}$/.test(item)){
			arr.push(str2Obj(item,',',":",runtime_vars));
		}else{
			if(/^_/.test(item)){
				if(runtime_vars[item.substr(1)]===undefined) throw new Error(item+" has not been saved in previous steps");
				item = runtime_vars[item.substr(1)];
			}
			arr.push(item);
		}
	});
	return arr;
}
function dec2Hex(number){
	return "0x"+number.toString(16);
}
function getTimeStampHex(){
	return dec2Hex(Date.now());
}

function getCurrentNonce(provider, accAddr){
	return provider.sendRequest("utils-getValidNonceValue", "eth_getTransactionCount",[accAddr],false);
}
function getGasPrice(provider){
	return provider.sendRequest("utils-getGasPrice","eth_gasPrice",[],false).then((resp)=>{return Promise.resolve(resp.result);});
}

function getBalance(provider,accAddr){
	return provider.sendRequest("utils-getBalance","eth_getBalance",[accAddr]);
}

/*
	Use account private key to encode transaction object to HEX
	@param txObj(Object):{to: accAddr, value: number, data: number, gas: number, gasPrice:account, nonce:hex,type:?, timestamp:Date.now()*1000}
	@param account(Object){_privateKey: number, privateKey:hex, publicKey:buffer?, addr:accountAddress}
*/
async function getRawTx(provider,txObj,account){
  console.log(txObj);
	let result = {};
	let preEncodeSeq = [];
	let expectSeq =['nonce','to','value','data','timestamp','gas','gasPrice','type'];
	txObj.timestamp = txObj.timestamp || Date.now() * 1000;
	txObj.nonce = txObj.nonce || (await getCurrentNonce(provider, account.addr)).result;
	txObj.gasPrice = txObj.gasPrice || (await getGasPrice(provider)).result;
	console.log("gasPrice"+txObj.gasPrice);
	result.readable = txObj;

  if(typeof txObj.value === "number" || typeof txObj.value === 'Number') txObj.value = '0x'+ txObj.value.toString(16);
	else if(!/^0x/.test(txObj.value)) txObj.value = '0x'+parseInt(txObj.value).toString(16);
	if(!/^0x/.test(txObj.gasPrice)) txObj.gasPrice = '0x'+ parseInt(txObj.gasPrice).toString(16);
	if(!/^0x/.test(txObj.gas)) txObj.gas = '0x'+parseInt(txObj.gas).toString(16);

	console.log(txObj);

	txObj.gasPrice = toAionLong(txObj.gasPrice);
	txObj.gas = toAionLong(txObj.gas);
	txObj.type = toAionLong(txObj.type || 1);

	console.log(txObj);

	expectSeq.forEach((property)=>{preEncodeSeq.push(txObj[property]);});
  console.log("[this is pre-rlp] : ", preEncodeSeq);

	let rlpEncoded = rlp.encode(preEncodeSeq);
	console.log("[this is pre-blake2b] : "+ rlpEncoded);
	let hash = blake2b256(rlpEncoded);
	console.log("[this is post-blake2b] : "+ hash);
	let signature = toBuffer(nacl.sign.detached(hash,Array.isArray(account._privateKey)?account._privateKey:arrayify(account._privateKey)));
	console.log("[this is signature] : "+ bufferToZeroXHex(signature));
	// ?need? verity nacl signature check aion_web3.web3-eth-accounts line 229 - 231
	let aionPubSig = Buffer.concat([Array.isArray(account.publicKey)?account.publicKey:arrayify(account.publicKey),signature],aionPubSigLen);
	console.log("[this is publicSign] : "+ aionPubSig);
	account.signature = bufferToZeroXHex(signature);
	account.aionPubSig = aionPubSig;
	let rawTx = rlp.decode(rlpEncoded).concat(aionPubSig);
	let rawTransaction = rlp.encode(rawTx);

	result.raw = {
		messageHash:bufferToZeroXHex(hash),
		signature:bufferToZeroXHex(aionPubSig),
		rawTransaction:bufferToZeroXHex(rawTransaction),
	};
	console.log("getRawTx:"+JSON.stringify(result));
	return Promise.resolve(result);
}

async function getEncodeTx(provider,txObj){
	let preEncodeSeq = [];
	let expectSeq =['nonce','to','value','data','timestamp','gas','gasPrice','type'];
	txObj.timestamp = txObj.timestamp || Date.now() * 1000;
	txObj.nonce = txObj.nonce || (await getCurrentNonce(provider,txObj.from)).result;
	txObj.gasPrice = txObj.gasPrice || (await getGasPrice(provider)).result;
	console.log("gasPrice"+txObj.gasPrice);
	//result.readable = txObj;

	if(!/^0x/.test(txObj.value)) txObj.value = '0x'+parseInt(txObj.value).toString(16);
	if(!/^0x/.test(txObj.gasPrice)) txObj.gasPrice = '0x'+ parseInt(txObj.gasPrice).toString(16);
	if(!/^0x/.test(txObj.gas)) txObj.gas = '0x'+parseInt(txObj.gas).toString(16);

	console.log(txObj);

	txObj.gasPrice = toAionLong(txObj.gasPrice);
	txObj.gas = toAionLong(txObj.gas);
	txObj.type = toAionLong(txObj.type || "0x00");

	console.log(txObj);

	expectSeq.forEach((property)=>{preEncodeSeq.push(txObj[property]);});

	let rlpEncoded = rlp.encode(preEncodeSeq);
	let hash = blake2b256(rlpEncoded);
	return hash;
}



var toAionLong = function (val) {
    var num;
    if (
        val === undefined ||
        val === null ||
        val === '' ||
        val === '0x'
    ) {
      return null;
    }

    if (typeof val === 'string') {
        if (/^0x[0-9a-f]+$/.test(val)||/^0x[0-9A-F]+$/.test(val)) {
            num = new BN(removeLeadingZeroX(val), 16);
        } else {
            num = new BN(val, 10);
        }
    }

    if (typeof val === 'number') {
      num = new BN(val);
    }

    return new AionLong(num);
};


function getEvent(funcABI){
	let event = funcABI.name+"(";
	funcABI.inputs.forEach((input)=>{
		event += input.type + ',';
	});
	event = event.replace(/,$/,')');
	if(!/\)$/.test(event)) event= event+")";
	console.log(event)
	return keccak256(event);
}

// assume params are primary element
var getContractFuncData = (funcABI, params,isConvert)=>{
  isConvert = isConvert==undefined?true:isConvert;
	if(funcABI==null  || funcABI == undefined || funcABI == {}){
		return "0x"+ params.join("");
	}
	let funcStr = funcABI.name+"(";
	funcABI.inputs.forEach((input)=>{
		funcStr += input.type + ',';
	});
	funcStr = funcStr.replace(/,$/,')');
	if(!/\)$/.test(funcStr)) funcStr= funcStr+")";

	let funcSign = keccak256(funcStr).substring(0,8);
	let check = funcSign;
	let rest = '';
	console.log(params);
	params.forEach((param,index)=>{
		if(funcABI.inputs[index].type=='string' && isConvert){
			let offset = (funcABI.inputs[index].type,params.length -1-index) * 32 + rest.length;
			funcSign += encoder("int",offset);
			rest += encoder(funcABI.inputs[index].type,param)
		}else{
			funcSign += encoder(funcABI.inputs[index].type,param,isConvert);
		}

	});
	return "0x"+funcSign+rest;
}

// assume params are primary element
var getContractConstrData = (funcABI, params)=>{

	let funcSign='';
	//console.log(funcSign);
	let check = funcSign;
	let rest = '';
	params.forEach((param,index)=>{
		if(funcABI.inputs[index].type=='string'){
			let offset = (funcABI.inputs[index].type,params.length -1-index) * 32 + rest.length;
			funcSign += encoder("int",offset);
			rest += encoder(funcABI.inputs[index].type,param)
		}else{
			funcSign += encoder(funcABI.inputs[index].type,param);
		}

	});
	return funcSign+rest;
}


var getEvtData = (funcABI, params)=>{
	let data = '0x';
	let rest = '';
	params.forEach((param,index)=>{
		if(funcABI.inputs[index].type=='string'){
			let offset = (funcABI.inputs[index].type,params.length -1-index) * 32 + rest.length;
			data += encoder("int",offset);
			rest += encoder(funcABI.inputs[index].type,param)
		}else{
			data += encoder(funcABI.inputs[index].type,param);
		}
	});
	return data+rest;
}


var encoder = (type, param,isConvert)=>{

	console.log(type+":"+(typeof param=='object')?JSON.stringify(param):param);
  isConvert = isConvert==undefined?true:isConvert;

  if(!isConvert){
    return /^0x/.test(param)?param.substring(2):param;
  }

	switch(type){
		case "int8":
		case "uint8":
			return padZeros(arrayify(bigNumberify(param).toTwos(8).maskn(8)), 16).toString("hex");
		case 'uint':
		case "int":
		case "uint128":
			return padZeros(arrayify(bigNumberify(param).toTwos(128).maskn(128)), 16).toString("hex");
		case "address":
			return Buffer.from(arrayify(aionLib.accounts.createChecksumAddress(param))).toString("hex");
		case "bool":
			return padZeros(arrayify(bigNumberify(param?1:0).toTwos(128).maskn(128)), 16).toString("hex");
		case "string":
			let resb = Buffer.concat([
					padZeros(arrayify(bigNumberify(param.length).toTwos(128).maskn(128)), 16),
					toBuffer(toUtf8Bytes(param)),
					Buffer.alloc(16 * Math.ceil(param.length/16) - param.length)
				])
			return resb.toString("hex");
		case "bytes32":
			let res = Buffer.concat([


          toBuffer(toUtf8Bytes(param)),
          Buffer.alloc(32 * Math.ceil(param.length/32) - param.length)
				])
			return res.toString("hex");

			 //

	}

}


var waitBlock = (options,provider)=>{
	var oldBlockNo,newBlockNo;

	var _id="checkBlock";
	let newBlockNum=0;

	let timeout = 100;

	if(options !=null){
		timeout = options[0];
		if(options.length >1)
			newBlockNum = parseInt(options[1]);

	}
	//console.log("timeout:"+timeout);
	//console.log("newBlockNum:"+typeof newBlockNum + "\t"+newBlockNum)

	timeout = parseInt(timeout);
	return new Promise((resolve,reject)=>{

		provider.sendRequest(_id,"eth_blockNumber",[]).then((resp)=>{
			oldBlockNo = resp.result
			//console.log(resp);
		}).then(()=>{
			console.log("-----------"+oldBlockNo);


			var checkblock = ()=>{
				provider.sendRequest(_id,"eth_blockNumber",[]).then((resp)=>{
					newBlockNo= resp.result;
					console.log("-----------"+oldBlockNo+" "+newBlockNo);
					if(parseInt(newBlockNo) > parseInt(oldBlockNo)+ newBlockNum){
						console.log("-------reached------"+oldBlockNo+" "+newBlockNo);
						clearInterval(checkloop);
						resolve();
					}
				});

			}
			var checkloop = setInterval(checkblock,5000);

			setTimeout(()=>{clearInterval(checkloop);resolve()},parseInt(timeout)*1000);

		});


	});
}

function waitBlockUntil(option,provider){
	var timeout = 1200, lastBlock = 0;
	var curBlock
	if(Array.isArray(option) && option.length > 0){
		lastBlock = option[0]|| lastBlock;
		timeout = option[1] || timeout;
	}
	if(typeof timeout != "number") timeout = parseInt(timeout);
	if(typeof lastBlock == "string" && !isNaN(parseInt(lastBlock))) lastBlock= parseInt(lastBlock);
	return 	new Promise((resolve,reject)=>{
			var checkblock = ()=>{
				provider.sendRequest("checkBlock","eth_blockNumber",[],false).then((resp)=>{
					curBlock= resp.result;
					console.log("-----------"+curBlock+" "+lastBlock);
					if(parseInt(curBlock) >= parseInt(lastBlock)){
						console.log("-----reached------"+curBlock+" "+lastBlock);
						clearInterval(checkloop);
						resolve();
					}
				});

			}
			var checkloop = setInterval(checkblock,5000);
			setTimeout(()=>{clearInterval(checkloop);resolve()},parseInt(timeout)*1000);
	});
}



function parseContract(resp,contract){
	contract.func={};
	contract.event={};
	contract.constructor={};
	resp.result[contract.name].info.abiDefinition.forEach((item)=>{
		if(item.type == "function"){
			contract.func[item.name] = item;
		}else if(item.type == 'event'){
			contract.event[item.name] = item;
		}else if(item.type == 'constructor'){
			contract.constructor= item;
		}
	});
	return contract;
}

function getTxReceipt(txHash,provider,timeout){
	return new Promise((resolve,reject)=>{
		timeout = timeout || 60;//(sec)
		var loop =  setInterval(async()=>{
				let res  = await provider.sendRequest("check receipt", "eth_getTransactionReceipt",[txHash],true);
				timeout--;
				if(res.result !==undefined && res.result != null){
					clearInterval(loop);
					console.log("[deploy contract address]\t"+res.result.contractAddress);
					resolve(res);
				}
				if(timeout == 0){
					clearInterval(loop);
					reject(new Error("[get tx receipt] TIMEOUT"));
				}
			},1300);
	});
}



var Utils={

	//conversion
	hex2Dec:(hex)=>{return parseInt(num);},
	dec2Hex:dec2Hex,
	string2Hex:(str)=>{
		if(/^0x/.test(str)) return str;
		hex = "0x";
		for(let i=0; i < str.length;i++){
			let ext = str.charCodeAt(i).toString(16);
			ext=(ext.length==2)?ext:'0'+ext;
			hex = hex+ext;
		}
		return hex;
	},
	//
	str2Obj:str2Obj,
	getBigNumber:(number)=>{return new BN(number);},
	isBIGNUMBER:()=>{
		return {test:(value)=>{return BN.isBN(value);}};
	},
	isValidTimeStamp:()=>{
		return {test:(ts)=>{
			return !(!/^0x/.test(ts)|| ts.length !== 16);
		}};
	},
	getGasPrice:getGasPrice,
	getRawTx:getRawTx,
	getCurrentNonce:getCurrentNonce,
	getBalance:getBalance,
	getContractFuncData:getContractFuncData,
	waitBlock:waitBlock,
	parseContract:parseContract,
	getTxReceipt:getTxReceipt,
	waitBlockUntil:waitBlockUntil,
	getEvent:getEvent,
	getEncodeTx:getEncodeTx,
	getEvtData:getEvtData,
  encoder:encoder
}

module.exports = Utils;
