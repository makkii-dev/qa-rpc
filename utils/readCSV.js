var fs = require('fs');
var csvParse = require('csv-parse/lib/sync');

module.exports = (driver_path)=>{
	var testdriver = fs.readFileSync(driver_path);
	var data = csvParse(testdriver,{columns:true/*,auto_parse:true*/,skip_lines_with_empty_values:true,delimiter:"|"});
	var reformData = [];
	data = data.filter((row,index,arr)=>{
		return row.execute!='';
	}).map((row)=>{
		if(row.arrayValue){
			row.arrayValue = row.arrayValue.split('\t');
		}
		for(let pro in row){
			if(row[pro]=='') delete row[pro];
		}
		return row;
	});
	
	data.forEach((item)=>{
		if(item.TestSet!==undefined){
			let oneSet = {name:item.TestSet,tests:[]};
			if(item.rust!==undefined)
				oneSet.rust = item.rust;
			if(item.java != undefined)
				oneSet.java = item.java;
			reformData.push(oneSet);
		}else{
			let ts_No = reformData.length-1;
			reformData[ts_No].tests.push(item);
		}
	});

	return reformData;
}