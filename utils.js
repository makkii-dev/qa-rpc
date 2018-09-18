//export result

//read in csv
var BigNumber = require("bignumber.js");


module.exports={

	//conversion
	hex2Dec:(hex)=>{return parseInt(num);},
	dec2Hex:(number)=>{return "0x"+number.toString(16);},

	//
	str2Obj:(str,delimiter,separator)=>{
		str = str.substring(1,str.length-1);
		var obj = {};
		if(str.length ===0) return obj;
		str.split(delimiter).forEach((item)=>{
			var pair = item.split(separator);
			if(pair[0]=='limit'){
				obj.limit = parseInt(pair[1]);
			}else{
				obj[pair[0]] = pair[1];
			}
			
		});
		return obj;
	},
	getBigNumber:(number)=>{return new BigNumber(number);},
	isBIGNUMBER:()=>{return {test:(value)=>{return BigNumber.isBigNumber(value);}};}

}