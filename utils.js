//export result

//read in csv




module.exports={

	//conversion
	hex2Dec:(hex)=>{return parseInt(num);},
	dec2Hex:(number)=>{return "0x"+number.toString(16);},

	//
	str2Obj:(str,delimiter,separator)=>{
		str = str.substring(1,str.length-1);
		var obj = {};
		str.split(delimiter).forEach((item)=>{
			var pair = item.split(separator);
			obj[pair[0]] = pair[1];
		});
		return obj;
	}

}