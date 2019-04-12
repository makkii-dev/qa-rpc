
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

    xit("start a kernel with default",(done)=>{
      var kernel = new Kernel(undefined,undefined,undefined);
       console.log(kernel.type);
       console.log(kernel.net);

       new Promise((res)=>{
         console.log(kernel.start("a"));
         setTimeout(()=>{
           resolve();
         },1000000);
       }).then(()=>{
         kernel.stop();
         done();
       })
    })
    
  })
})
