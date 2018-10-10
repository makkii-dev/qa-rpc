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



var BigNumber = require("bignumber.js");
function str2Obj(str,delimiter,separator){
		
		str = str.substring(1,str.length-1);
		
		var obj = {};
		if(str.length ===0) return obj;
		str.split(delimiter).forEach((item)=>{
			var pair = item.split(separator);
			if(pair[0]=='limit' || pair[0]=='block'){
				obj[pair[0]] = parseInt(pair[1]);
			}else if(pair[0]=='time'){
				obj[pair[0]] = Date.now();
			}else{
				if(/^{\S*}$/.test(pair[1])){
					pair[1]= str2Obj(pair[1],'+','-');
				}
				obj[pair[0]] = pair[1];
			}
		});
		return obj;
}
function dec2Hex(number){
	return "0x"+number.toString(16);
}
function getTimeStampHex(){
	return dec2Hex(Date.now());
}

function getCurrentNonce(provider, accAddr){
	return provider.sendRequest("utils-getValidNonceValue", "eth_getTransactionCount",[accAddr]);
}
function getGasPrice(provider){
	return provider.sendRequest("utils-getGasPrice","eth_gasPrice",[]);
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
	let result = {};
	let preEncodeSeq = [];
	let expectSeq =['nonce','to','value','data','timestamp','gas','gasPrice','type'];
	txObj.timestamp = txObj.timestamp || Date.now() * 1000;
	txObj.nonce = txObj.nonce || (await getCurrentNonce(provider,account.addr)).result;
	txObj.gasPrice = txObj.gasPrice || (await getGasPrice(provider)).result;
	console.log(txObj.gasPrice);
	result.readable = txObj;
	
	
	txObj.gasPrice = toAionLong(txObj.gasPrice);
	txObj.gas = toAionLong(txObj.gas);
	txObj.type = toAionLong(txObj.type || 1);
	
	expectSeq.forEach((property)=>{preEncodeSeq.push(txObj[property]);});
	
	let rlpEncoded = rlp.encode(preEncodeSeq);
	let hash = blake2b256(rlpEncoded);
	let signature = toBuffer(nacl.sign.detached(hash,account._privateKey));
	// ?need? verity nacl signature check aion_web3.web3-eth-accounts line 229 - 231
	let aionPubSig = Buffer.concat([account.publicKey,signature],aionPubSigLen);
	let rawTx = rlp.decode(rlpEncoded).concat(aionPubSig);
	let rawTransaction = rlp.encode(rawTx);
	
	result.raw = {
		messageHash:bufferToZeroXHex(hash),
		signature:bufferToZeroXHex(aionPubSig),
		rawTransaction:bufferToZeroXHex(rawTransaction)
	};
	console.log("getRawTx:"+JSON.stringify(result));
	return Promise.resolve(result);
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

// assume params are primary element
var getContractFuncData = (funcABI, params)=>{
	let funcStr = funcABI.name+"(";
	funcABI.inputs.forEach((input)=>{
		funcStr += input.type + ',';
	});
	funcStr = funcStr.replace(/,$/,')');
	let funcSign = keccak256(funcStr).substring(0,8);
	console.log(funcSign);
	params.forEach((param)=>{
		funcSign += keccak256(param);
	});
	
	return "0x"+funcSign;
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
	getBigNumber:(number)=>{return new BigNumber(number);},
	isBIGNUMBER:()=>{
		return {test:(value)=>{return BigNumber.isBigNumber(value);}};
	},
	isValidTimeStamp:()=>{
		return {test:(ts)=>{
			if(!/^0x/.test(ts)|| ts.length !== 16) return false;
			ts = parseInt(ts);
			let cur_ts =Date.now();
			return (cur_ts>ts && ts > cur_ts-2000);
		}};
	},
	getGasPrice:getGasPrice,
	getRawTx:getRawTx,
	getCurrentNonce:getCurrentNonce,
	getBalance:getBalance,
	getContractFuncData:getContractFuncData
}

module.exports = Utils;