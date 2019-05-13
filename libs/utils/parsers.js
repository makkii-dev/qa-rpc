function parseJSONishString(str, rt_vars){
	//console.log(rt_vars);
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
			if(start < i){
				value = _parseValue(str.substring(start,i),rt_vars);
				partialResult[propertyName] = value;
			}
			start = ++i;
		}else if(ichar == '['){
			//console.log(i,ichar);
			let res = _parseJsonIshArr(str, i+1,end,rt_vars);
			value = res.res;
			i = res.index;
			//console.log(i,str.charAt(i));
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
			if(start<i){
				partialResult.push(value);
			}
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
				//console.log("in array",value)
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
	//console.log(input);
	if(!isNaN(input) && typeof input ==='string' && !/^0[0-9a-fA-Fx]+$/.test(input) ){
		input = parseInt(input);
	}else if(/^_/.test(input)){
		if(rt_vars==undefined) {
			console.log("no runtimevariables");
		}else
			return rt_vars.get(input.substring(1));
	}else if(isNaN(input) && (input.toLowerCase()=='true' || input.toLowerCase()=='false')){
		return input.toLowerCase()=='true';
	}else if(input.toLowerCase() == "null"){

		return null;
	}
	return input;
}


module.exports = parseJSONishString;
