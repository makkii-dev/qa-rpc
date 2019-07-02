//import libraries
var jsf = require('json-schema-faker');
let Ajv = require('ajv');
let ajv = new Ajv({
  allErrors:true
});


// setup schema and validator
var schema = {};
schema.TYPES = require('../type.json');
schema.getBlockByNumber_request = require('../core/requests/eth_getBlockByNumber.request.json');

ajv.addSchema(schema.TYPES);
ajv.addSchema(schema.getBlockByNumber_request);



var runDataGenerator= (options)=>{
  console.log(">>> run data generater with options: %s",JSON.stringify(options));
  jsf.option(options)
  let correct = 0;

  var loopFunction = (index, total)=>{
    if(index < total){
      return jsf.resolve(schema.getBlockByNumber_request,null,"../").then((sample)=>{
          console.log(sample);
          index ++;
          if(ajv.validate('request.json',sample)){
            console.log(":)");
            correct ++;
          }else{
            console.log("\n=_=|||||");
            console.log(ajv.errors);
          }
          return loopFunction(index++,total);
        });
    }else{
      console.log("correctness: %d % ", correct/100*100);
      return Promise.resolve();
    }
  }


  return loopFunction(0,100);
}


runDataGenerator({}).then(()=>{
  return runDataGenerator({alwaysFakeOptionals:false});
}).then(()=>{
  return runDataGenerator({optionalsProbability:0.5,fixedProbabilities:false});
}).then(()=>{
  return runDataGenerator({alwaysFakeOptionals:false,requiredOnly:true});
}).then(()=>{
  return runDataGenerator({defaultInvalidTypeProduct:null});
})
