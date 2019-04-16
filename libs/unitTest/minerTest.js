
const Miner = require("../controller/miner");
const Kernel = require("../controller/kernel");

var minerConfig = {"-l":"localhost:8008","-t":1};
var kernelConfig = {
  "author":"0xa07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137",
  "base":"base"
  }
describe("Test Miner and Kernel modules",()=>{
  describe("Test Miner",()=>{

    xit("start a miner with default path",()=>{
      var miner = new Miner();
      miner.configure(minerConfig);
      console.log(miner.configure());
      console.log(miner.path);
      console.log(miner.start());
      miner.stop();
    });

    it("start a kernel with default",(done)=>{
      var kernel = Kernel.getInstance();
       console.log(kernel.type);
       console.log(kernel.net);

      console.log(kernel.start("ab"));
     setTimeout(()=>{
       kernel.stop();
       setTimeout(done,1000);
     },5000);

  }).timeout(0);
  after(()=>{
    console.log(Kernel.getInstance().process.pid);
    //Kernel.getInstance().process.kill("SIGTERM");
  })
});
});
