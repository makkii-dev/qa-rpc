const { spawn } = require('child_process');
const fs = require("fs");

class Kernel{
  constructor(kernelDir,network,kernelType){
    this.type = kernelType||"aionr";

    this.dir = kernelDir || require("../configs/subProcess.json")[this.type];
    this.process = null;
    this.config = null;
    this.net = network || "custom";
    return this;
  }

  configure(configObj){
    if(configObj === undefined){
      return this.config;
    }else{
      this.config
      this.config = configObj;
      return this;
    }
  }

  network(network){
    if(network === undefined){
      return this.net;
    }else{
      this.net = network;
      return this;
    }
  }


  start(logName){
    switch (this.type) {
      case "aion":
        console.log("underconstruction")
        return;
      default:
        var arg = [];
        for(var configopt in this.config){
          arg.push("--"+configopt+"="+this.config[configopt]);
        }
        this.process = spawn("./"+this.net+".sh", arg,
                            {
                              cwd:this.dir,
                              stdio:[0,
                                fs.openSync("log"+(logName?logName:Date.now())+".out", 'w'),
                                fs.openSync("err"+(logName?logName:Date.now())+".out", 'w')
                              ]
                            }
                          );
        return this.process.pid;
    }
  }
  stop(){
    if(this.process == null){
      console.log("THE KERNEL NEVER START");
    }else{
      this.process.kill();
      if(this.process.killed){
        console.log("The miner has stoped");
        this.process = null;
      }
    }
  }
}

module.exports = Kernel;
