
class CommonProcess{

    constructor(){
      this.process = null;
      this.config = null;
      this.log = console.log;
    }
    getName(){
      return "one Process";
    }
    setLog(logger){
      this.log = logger?logger.pLog:this.log;
      this.log("initiate log",this.getName());
      return this;
    }

}


module.exports = CommonProcess;
