var fs = require("fs");


class Logger{
	constructor() {
		this.CONSOLE_LOG=true;
		this.FILE_LOG=true;
		this.PATH="./testlog/testlog"+Date.now()+".txt";
	}

	log(msg){
		if(this.FILE_LOG)fs.appendFileSync(this.PATH,msg+"\n");
		if(this.CONSOLE_LOG)console.log(msg);
	}
}
module.exports = Logger;