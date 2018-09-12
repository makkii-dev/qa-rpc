var fs = require('fs');
var csvParse = require('csv-parse/lib/sync');

module.exports = (driver_path)=>{
	var testdriver = fs.readFileSync(driver_path);
	var data = csvParse(testdriver,{columns:true/*,auto_parse:true*/,skip_lines_with_empty_values:true,delimiter:"|"});
	//console.log(data);
	return data;
}