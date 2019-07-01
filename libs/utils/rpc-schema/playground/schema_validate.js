'use strict'
//import library
let Ajv = require('ajv');

// import schemas and test data
var schema = {};

schema.OBJECTS = require('../object.json');
schema.TYPES = require('../type.json');
schema.requests={};
schema.responses={};


// setup methods
var methods = [
  "eth_accounts","eth_blockNumber","eth_call","eth_coinbase","eth_estimateGas","eth_gasPrice","eth_getBalance","eth_getBlockByNumber","eth_getBlockByHash",
  "eth_getBlockTransactionCountByHash","eth_getBlockTransactionCountByNumber","eth_getCode","eth_getCompilers","eth_getFilterChanges","eth_getFilterLogs",
  "eth_getLogs","eth_getStorageAt","eth_getTransactionByBlockHashAndIndex","eth_getTransactionByBlockNumberAndIndex","eth_getTransactionByHash",
  "eth_getTransactionByHash","eth_getTransactionCount","eth_getTransactionReceipt","eth_hashrate","eth_mining","eth_newBlockFilter","eth_newFilter",
  "eth_newPendingTransactionFilter","eth_protocolVersion","eth_sendRawTransaction","eth_sendTransaction","eth_sign","eth_signTransaction","eth_submitHashrate",
  "eth_syncing","eth_uninstallFilter","net_listening","net_peerCount","net_version","web3_clientVersion","eth_compileSolidity"
]

//read in schemas

methods.forEach((method,index)=>{
  schema.requests[method] = require("../core/requests/"+method+".request.json");
  schema.responses[method] = require("../core/responses/"+method+".response.json");
})


// initiate valiator
let ajv = new Ajv({
  allErrors:true
});

// validate schemas
ajv.addSchema(schema.TYPES);
ajv.addSchema(schema.OBJECTS);

if(ajv.validateSchema(require("../response.json"))){
  ajv.addSchema(require("../response.json"));
}else{
  console.log(ajv.errors);
}


for(let sname in schema.requests){
  console.log("checking requests schema - %s",sname);

  if(ajv.validateSchema(schema.requests[sname])){
    console.log("passed");
    ajv.addSchema(schema.requests[sname]);
  }else{
    console.log(ajv.errors);
  }
}

for(let sname in schema.responses){
  console.log("checking responses schema - %s",sname);
  if(ajv.validateSchema(schema.responses[sname])){
    ajv.addSchema(schema.responses[sname]);
    console.log("passed")
  }else{
    console.log(ajv.errors);
  }
}

// validate example data based on schema
for(let sname in schema.requests){
  if(schema.requests[sname].examples){
    schema.requests[sname].examples.forEach((example, index)=>{
      console.log("%s request example: %s", sname, JSON.stringify(example));
      if(ajv.validate(sname+".request.json", example)){
        console.log(":)");
      }else{
        console.log("=_=|||");
        console.log(ajv.errors);
      }
    });
  }
}


for(let sname in schema.responses){
  if(schema.responses[sname].examples){
    schema.responses[sname].examples.forEach((example, index)=>{
      console.log("%s response example: %s", sname, JSON.stringify(example));
      if(ajv.validate(sname+".response.json",example)){
        console.log(":)");
      }else{
        console.log("=_=|||");
        console.log(ajv.errors);
      }
    });
  }
}
