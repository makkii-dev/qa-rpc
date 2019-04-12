const { spawn } = require('child_process');
const fs = require("fs");
class Miner{
  constructor(minerLocation){

      this.path = minerLocation || require("../configs/subProcess.json").miner;
      this.process = null;
      this.config = null;
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

  start(){
    var arg = [];
    for(var opt in this.config){
      arg.push(opt);
      arg.push(this.config[opt]);
    }
    this.process = spawn(this.path,arg,{stdio:[0,"ignore","ignore"]});
    return this.process.pid;
  }

  stop(){
    if(this.process == null){
      console.log("THE MINER NEVER START");
    }else{
      this.process.kill();
      console.log("The miner has stoped");
      this.process = null;
    }
  }
}

module.exports = Miner;
