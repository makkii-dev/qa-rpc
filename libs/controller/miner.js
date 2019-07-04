const { spawn } = require('child_process');
const fs = require("fs");
const CommonProcess = require("./commonProcess.js")

class Miner extends CommonProcess{

  constructor(minerLocation){
      super();
      this.path = minerLocation || require("../configs/subProcess.json").miner;
      return this;

  }
  configure(configObj){
    if(configObj===undefined){
      return this.config;
    }else{
      this.config = configObj;
      return this;
    }
  }
  getName(){
    return "Miner-"+(this.process?this.process.pid:"null");
  }
  start(logName){
    var arg = [];
    for(var opt in this.config){
      arg.push(opt);
      arg.push(this.config[opt]);
    }
    if(this.process && !this.process.killed){
      this.terminate();
    }

    this.process = spawn(this.path,arg,{stdio:[0,1,
      (logName?fs.openSync(logName,"a"):2)
      //2
    ]});
    this.log("miner is starting; PID: "+ this.process.pid, this.getName());
    return this.process.pid;
  }

  stop(){
    let name = this.getName();
    if(this.process == null){
      this.log("THE MINER NEVER START",name);
    }else{
      this.process.kill();
      if(this.process.killed)
      this.log("The miner has stoped",name);
    }
    return this;
  }
  terminate(){
    spawn("kill",["-n",2,this.process.pid]);
  }

}

module.exports = Miner;
