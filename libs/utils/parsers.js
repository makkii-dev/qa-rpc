// const assert=  require('chai').assert;

// const testcases = [
// 	["{a:1}",{a:1}],
// 	["{a:[{b:1},[1,3,4,f]]}",{a:[{b:1},[1,3,4,'f']]}],
// 	["[a,s,d,1,0x0,{b:slslsl}]",['a','s','d',1,'0x0',{b:'slslsl'}]],
// 	["string",'string'],
// 	["{d:{c:{b:a},dc:1}}",{d:{c:{b:'a'},dc:1}}],
// 	["{from:0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c,to:0xa054340a3152d10006b66c4248cfa73e5725056294081c476c0e67ef5ad25334,gas:1000000,gasPrice:1,value:1,data:0x2345,nonce:0x20,condition:{block:0x100}}",{from:'0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c',to:'0xa054340a3152d10006b66c4248cfa73e5725056294081c476c0e67ef5ad25334',gas:1000000,gasPrice:1,value:1,data:'0x2345',nonce:'0x20',condition:{block:'0x100'}}],
// 	["{fromBlock:earliest,toBlock:latest,topics:[0x66fa32225b641331dff20698cd66d310b3149e86d875926af7ea2f2a9079e80b]}",{topics:["0x66fa32225b641331dff20698cd66d310b3149e86d875926af7ea2f2a9079e80b"]}]
// ]


// _test();

// function _test(){

// 	testcases.forEach((onecase)=>{
		
// 		console.log("\nresult:"+ JSON.stringify(parseJSONishString(onecase[0])));
// 		console.log(JSON.stringify(onecase[1])+"\n");
// 	});
// }





function parseJSONishString(str, rt_vars){
	console.log(rt_vars);
	if(str.charAt(0) == "["){
		return _parseJsonIshArr(str,1,str.length,rt_vars).res;
	}else if(str.charAt(0)=='{'){
		return _parseJsonIshObj(str,1,str.length,rt_vars).res;
	}else{
		return _parseValue(str,rt_vars);
	}
}

function _parseJsonIshObj(str,start,end,rt_vars){
	
	let partialResult = {};
	let propertyName,value;
	let newEnd;
	for(let i = start; i < end;){
		
		let ichar = str.charAt(i);
		if(ichar == ":"){
			propertyName = str.substring(start,i);
			i++;
			start = i;
		}else if(ichar == ","){			
			value = _parseValue(str.substring(start,i),rt_vars);
			partialResult[propertyName] = value;
			i++;
			start = i;
		}else if(ichar == '['){
			let res = _parseJsonIshArr(str, i+1,end,rt_vars);
			value = res.res;
			i = res.index;
			partialResult[propertyName] = value;
			start = i;
		}else if(ichar == '}'){
			if(start < i ){
				value = _parseValue(str.substring(start,i),rt_vars);
				partialResult[propertyName] = value;
			}
			newEnd = i+1;
			break;
		}else if(ichar == '{'){
			let res = _parseJsonIshObj(str, i+1,end,rt_vars);
			value = res.res;
			i = res.index;
			
			if(str.charAt(i)===',') i++;
			partialResult[propertyName] = value;
			start = i;
		}else{
		 i++;
		}
	}
	
	
	return {res: partialResult, index: newEnd};
}
function _parseJsonIshArr(str,start,end,rt_vars){
	let partialResult = [];
	let value;
	let newEnd;
	for(let i = start; i < end;){

		let ichar = str.charAt(i);
		
		if(ichar == ","){
			value = _parseValue(str.substring(start,i),rt_vars);
			partialResult.push(value);
			i++;
			start = i;
		}else if(ichar == '['){
			let res = _parseJsonIshArr(str, i+1,end,rt_vars);
			value = res.res;
			i = res.index;
			partialResult.push(value);
			start = i;
		}else if(ichar == ']'){
			if(start < i ){
				value = _parseValue(str.substring(start,i),rt_vars);
				partialResult.push(value);
			}
			newEnd = i+1;
			break;
			
		}else if(ichar == '{'){
			let res = _parseJsonIshObj(str, i+1,end,rt_vars);
			value = res.res;
			i = res.index;
			if(str.charAt(i)===',') i++;
			partialResult.push(value);
			start = i;
		}else{
			i++;
		}
	}
	
	return {res: partialResult, index: newEnd};
}

function _parseValue(input,rt_vars){
	if(!isNaN(input) && typeof input ==='string' && !/^0x/.test(input)){
		input = parseInt(input);
	}else if(/^_/.test(input)){
		if(rt_vars==undefined) {
			console.log("no runtimevariables");
		}else
		return rt_vars[input.substring(1)];
	}else if(isNaN(input) && (input.toLowerCase()=='true' || input.toLowerCase()=='false')){
		return input.toLowerCase()=='true';
	}else if(input.toLowerCase() == "null"){
		return null;
	}
	return input;
}


module.exports = parseJSONishString;