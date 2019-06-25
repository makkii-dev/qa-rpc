'use strict'
//import library
let Ajv = require('ajv');

// import schemas and test data
var schema = {};
var test_data={};
schema.OBJECTS = require('../object.json');
schema.TYPES = require('../type.json');
schema.getBlockByNumber_response = require('../core/responses/eth_getBlockByNumber.response.json');
schema.getBlockByNumber_request = require('../core/requests/eth_getBlockByNumber.request.json');
test_data.getBlockByNumber_response = schema.getBlockByNumber_response.examples;
test_data.getBlockByNumber_request = schema.getBlockByNumber_request.examples;


// initiate valiator
let ajv = new Ajv({
  allErrors:true
});
for(let sname in schema){
  console.log("checking schema %s",sname);
  if(ajv.validateSchema(schema[sname])){
    ajv.addSchema(schema[sname]);
    console.log("passed")
  }else{
    console.log(ajv.errors);
  }
}



test_data.getBlockByNumber_response.forEach((example,index)=>{
  //console.log(example);

  if(!ajv.validate("response.json",example)){
    console.log("\n validation failed:")
    console.log(ajv.errors);
  }else{
    console.log(":) passed schema validation")
  }
});


test_data.getBlockByNumber_request.forEach((example,index)=>{
   console.log(example);

  if(!ajv.validate("request.json",example)){
    console.log("\nx_x|| validation failed:")
    console.log(ajv.errors);
  }else{
    console.log(":) passed schema validation")
  }
});
