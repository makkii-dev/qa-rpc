var fs = require("fs");


class Logger{
	constructor() {
		this.CONSOLE_LOG=true;
		this.FILE_LOG=true;
		this.PATH="./testlog/testlog"+Date.now()+".txt";
	}
	updatePath(testfile){
		let ts = new Date();
		
		this.PATH="./testlog/testlog_"+testfile+ts.toISOString()+".txt"
	}
	log(msg){
		if(this.FILE_LOG)fs.appendFileSync(this.PATH,msg+"\n");
		if(this.CONSOLE_LOG)console.log("\x1b[37m%s\x1b[0m",msg);
	}
	error(msg){
		if(this.FILE_LOG)fs.appendFileSync(this.PATH,"!! [ERROR]\n"+msg+"\n");
		if(this.CONSOLE_LOG)console.log("\x1b[31m%s\x1b[0m","!! [ERROR]\n"+msg);
	}
	title(title){
		if(this.FILE_LOG)fs.appendFileSync(this.PATH,"\n--------------- [Title] \t\t "+title+"-------------------------\n");
		if(this.CONSOLE_LOG)console.log("\x1b[44m%s\x1b[0m",title+"\n");
	}
	info(msg){
		if(this.FILE_LOG)fs.appendFileSync(this.PATH,"[info]\t:\t"+msg+"\n");
		if(this.CONSOLE_LOG)console.log("\x1b[96m%s\x1b[0m",msg+"\n");
	}
}
module.exports = Logger;