'use strict'
//import library
let Ajv = require('ajv');

// import schemas and test data
var schema = {};
var test_data={};
schema.OBJECTS = require('../object.json');
schema.TYPES = require('../type.json');
schema.getBlockByNumber_response = require('../core/responses/eth_getBlockByNumber.response.json');
test_data.getBlockByNumber_response = schema.getBlockByNumber_response.examples;


// initiate valiator
let ajv = new Ajv({
  allErrors:true
});
for(let sname in schema){
  console.log(ajv.validateSchema(schema[sname]));
  if(ajv.validateSchema(schema[sname])){
    ajv.addSchema(schema[sname]);
  }else{
    console.log(ajv.errors);
  }
}


test_data.getBlockByNumber_response.forEach((example,index)=>{
  console.log(example.result);

  if(!ajv.validate("response.json",example.result)){
    console.log("\n validation failed:")
    console.log(ajv.errors);
  }else{
    console.log(":) passed schema validation")
  }
});
