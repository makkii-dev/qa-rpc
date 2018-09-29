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
			reformData.push({name:item.TestSet,tests:[]});
		}else{
			let ts_No = reformData.length-1;
			reformData[ts_No].tests.push(item);
		}
	});
	console.log(JSON.stringify(reformData));

	return reformData;
}