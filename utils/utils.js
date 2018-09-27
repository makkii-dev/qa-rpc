//export result

//read in csv
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
	}
}

module.exports = Utils;