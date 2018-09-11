var fs = require('fs');
var csvParse = require('csv-parse/lib/sync');
const DRIVER_PATH = "./testDriver.csv";

// var file = fs.readFileSync(DRIVER_PATH);

// csvParse(file,{columns:(cols)=>{return cols;},auto_parse:true},(err,data)=>{
// 	console.log(data);

// })

// function reader(driver_path){
	
// 	return new Promise((resolve,reject)=>{
// 		var testdriver = fs.readFileSync(driver_path);
// 		csvParse(testdriver,{columns:true,auto_parse:true
// 			,delimiter:",",skip_lines_with_empty_values:true
// 		},(err,data)=>{
// 			if(err){
// 				reject(new Error(err))
// 			}else{
// 				resolve(data);
// 			}
			
// 		});
// 	})
	
// }

module.exports = (driver_path)=>{
	var testdriver = fs.readFileSync(driver_path);
	var data = csvParse(testdriver,{columns:true,auto_parse:true,skip_lines_with_empty_values:true,delimiter:"|"});
	console.log(data);
	return data;
}