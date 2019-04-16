const { spawn } = require('child_process');
const fs = require("fs");
const CommonProcess = require("./commonProcess");
const DEFAULT_SETTINGS = require("../configs/subProcess.json");

class Kernel extends CommonProcess{


  constructor(kernelDir,network,kernelType){
    super();
    this.type = kernelType||"aionr";
    this.dir = kernelDir || DEFAULT_SETTINGS[this.type].dir;
    this.net = network || "custom";
    this.db = this.type == "aionr"?
                          (DEFAULT_SETTINGS[this.type].db+"/"+this.net)
                          : (DEFAULT_SETTINGS[this.type].dir+"/"+ this.net + "/database");
    return this;
  }

  database(newDbPath){
    if(newDbPath === undefined || newDbPath === null){
      return this.db;
    }else{
      this.db = newDbPath;
      return this;
    }
  }

  updateDB(){
    if(this.type == "aionr"){
      if(this.config["base"]){
        this.db = this.dir + "/"+ this.config["base"]+"/chains/"+this.net;
      }else{
        this.db = DEFAULT_SETTINGS[this.type].db+"/"+this.net;
      }
    }else{
      this.db = this.dir +"/"+this.net+"/database";
    }
    return this;
  }

  resetDB(){
    fs.rmdirSync(this.db);
    return this;
  }

  getName(){
    return this.type+"-"+this.net+"-"+(this.process?this.process.pid:"null");
  }
  static getInstance(kernelDir,network,kernelType){
    if(Kernel.oneInstance == null){
      Kernel.oneInstance = new Kernel(kernelDir,network,kernelType);
    }else{
      Kernel.oneInstance.dir = kernelDir || Kernel.oneInstance.dir;
      Kernel.oneInstance.network(network);
      Kernel.oneInstance.type = kernelType || Kernel.oneInstance.type;
    }
    return  Kernel.oneInstance;
  }

  configure(configObj){
    if(configObj === undefined){
      return this.config;
    }else{
      if(this.config == null)
        this.config = configObj;
      else {
        for(var pro in configObj){
          this.config[pro] = configObj[pro];
        }
      }
      return this.updateDB();
    }
  }

  resetConfig(){
    this.config = null;
    return this.updateDB();
  }

  network(network){
    if(network === undefined || network == null){
      return this.net;
    }else{
      this.net = network;
      return this.updateDB();
    }
  }


  async start(logName){

    let name = this.getName();
    switch (this.type) {
      case "aion":
        this.log("under-construction",name);
        return new Promise.reject();
      default:
        if( this.process && this.process.pid && !this.process.killed ){
          this.log("WARNING: The previous kernel process has not been terminated.", name)
          await this.terminate();
        }
        var arg = [];
        for(var configopt in this.config){
          arg.push("--"+configopt+"="+this.config[configopt]);
        }
        this.process = spawn("./"+this.net+".sh", arg,
                            {
                              cwd:this.dir,
                              stdio:[0,
                                //fs.openSync("log-"+(logName?logName:Date.now())+".out", 'w'),
                                1,
                                fs.openSync(logName?logName:("kernelLog/"+Date.now()+".out"),"a")
                              ]
                            }
                          );
        this.log("kernel is starting; PID: "+ this.process.pid+". Its configure: "+ JSON.stringify(this.config), name);
        return Promise.resolve(this.process.pid);
    }
  }


  stop(){
    let name = this.getName();
    if(this.process == null){
      this.log("THE KERNEL NEVER START",name);
    }else if(this.process.killed){
      this.log("THE KERNEL HAS BEEN STOPPED",name);
    }else{
    //  this.process.kill("SIGSTOP");
      this.terminate().then(()=>{
        if(this.process.killed){
          this.log("The kernel has stoped",name);
        }else{
          this.process.killed = true;
          this.log("The kernel has stoped",name);
        }
      });
    }
  }


  terminate(){
    this.log("Terminate all the child process",this.getName())
    spawn("pkill",["-2","-P",this.process.pid],{stdio:[0,
      //fs.openSync("log-"+(logName?logName:Date.now())+".out", 'w'),
      1,
      2
    ]});
    return new Promise((resolve)=>{
      setTimeout(resolve, 5000);
    })
  }

}
// Kernel static properties
Kernel.oneInstance = null;


module.exports = Kernel;
