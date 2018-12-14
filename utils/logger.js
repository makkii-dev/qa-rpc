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
		if(this.CONSOLE_LOG)console.log("\x1b[37m",msg);
	}
	error(msg){
		if(this.FILE_LOG)fs.appendFileSync(this.PATH,"!! [ERROR]\n"+msg+"\n");
		if(this.CONSOLE_LOG)console.log("\x1b[31m","!! [ERROR]\n"+msg);
	}
	title(title){
		if(this.FILE_LOG)fs.appendFileSync(this.PATH,"\n--------------- [Title] \t\t "+msg+"-------------------------\n");
		if(this.CONSOLE_LOG)console.log("\x1b[44m",msg+"\n");
	}
	info(msg){
		if(this.FILE_LOG)fs.appendFileSync(this.PATH,"[info]\t:\t"+msg+"\n");
		if(this.CONSOLE_LOG)console.log("\x1b[96m",msg+"\n");
	}
}
module.exports = Logger;