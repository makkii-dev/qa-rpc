var Helper = require("../utils/helper3");
const fs = require("fs");

describe("new helper method related with AVM ",()=>{
  var testAVMContractPath = "../../testContracts/xx.jar";
  var testAVMABI = [{
    type:"method",
    name:"sayHello"
  },{
    type:"method",
    name:"greet",
    inputs:["string"],
    outputs:["string"]
  },{
    type:"method",
    name:"getString",
    outputs:["string"]
  },{
    type:"method",
    name:"setString",
    inputs:["string"]
  },{
    type:"event",
    outputs:["string"]
  }];


  it("helper.newAVMContract",()=>{

  })

});
