var fs = require("fs");


class Logger{
	constructor(options) {
		options = options||{};
		this.CONSOLE_LOG = options.CONSOLE_LOG!==undefined?options.CONSOLE_LOG :true;

		this._dir=options.path||"./testlog";
		if (!fs.existsSync(this._dir)){
		    fs.mkdirSync(this._dir);
		}
		let ts = new Date();
		this.logName = "testlog_"+ts.toISOString()+".txt"
		this.logFullPath = this._dir+"/"+this.logName;
		this.step = "";
		this.pLog = (msg,processName)=>{
			if(this.FILE_LOG)fs.appendFileSync(this.logFullPath,"[pLog|"+processName+"]\t:\t"+msg+"\n");
			if(this.CONSOLE_LOG)console.log("[plog|"+processName+"]"+msg+"\n");
		}
	}
	updateName(testfile){
		let ts = new Date();
		this.logFullPath=this._dir+"/"+testfile+ts.toISOString()+".txt"
	}
	log(msg, visible){
		if((visible ==undefined || visible) && this.FILE_LOG)fs.appendFileSync(this.logFullPath,msg+"\n");
		if((visible ==undefined || visible) && this.CONSOLE_LOG)console.log("\x1b[37m%s\x1b[0m",msg);
	}
	error(msg){
		if(this.FILE_LOG)fs.appendFileSync(this.logFullPath," !! [ERROR]----------------------------------------------------------\n"+this.step+msg+"\n");
		if(this.CONSOLE_LOG)console.log("\x1b[31m%s\x1b[0m","[ERROR]"+this.step+msg);
	}
	title(title){
		if(this.FILE_LOG)fs.appendFileSync(this.logFullPath,"\n------------------ [Title] \t\t "+title+"-------------------------\n");
		if(this.CONSOLE_LOG){console.log("\x1b[44m%s\x1b[0m",title);}
		this.step = '';
	}
	info(msg,visible){
		if((visible ==undefined || visible) && this.FILE_LOG)fs.appendFileSync(this.logFullPath,"[info]\t:\t"+msg+"\n");
		if((visible ==undefined || visible) && this.CONSOLE_LOG)console.log("\x1b[96m%s\x1b[0m",msg+"\n");
	}
	testStep(stepDesc){
		this.step =this.step+ stepDesc +"\n";
		if(this.FILE_LOG)fs.appendFileSync(this.logFullPath,"[Test Step]\t:\t"+stepDesc+"\n");
		if(this.CONSOLE_LOG)console.log("\x1b[96m%s\x1b[0m","[Test Step]\t:\t"+stepDesc+"\n");
	}
	warning(warning){
		if(this.FILE_LOG)fs.appendFileSync(this.logFullPath,"[WARNING]\t:\t"+warning+"\n");
		if(this.CONSOLE_LOG)console.log("\x1b[95m%s\x1b[0m", "[WARNING]"+warning+"\n");
	}
}

module.exports = Logger;
