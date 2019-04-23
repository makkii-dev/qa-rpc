## Purpose

A test frame that can run test based on the given tsv file to test Kernel RPC APIs.
Currently, the framework can send RPC requests, validate responses, control the Kernel and miner(testApp_190408).

### updates
testApp_190408.js:
* add controller to start and terminate the **local** kernel and miner;
* no longer need to start the  **local** kernel and miner in the separater terminal;
* udpate the new core RPC spec in validation

#### TO DO
* test java kernel control
* add new field in tsv test file to control the kernel to connect which network;
* add new field in tsv test file to control whether to launch the kernel or not；
* support AVM ABI encode

## configuration:

### configure RPC
Go to `libs/utils/providers/providers_config.json` and edit the fields:
```json
{
	"default":"127.0.0.1:8545",
	"http":"127.0.0.1:8545",
	"websocket":"ws://127.0.0.1:8546",
	"ipc":"/.aion/jsonrpc.ipc"
}
```

### configure kernel and miner
Go to `libs/configs/subProcess.json` and edit the fields:
```json
{
  "miner":"/absolute/path/of/miner",
  "aionr":{
    "dir":"/absolute/path/of/aionr/package/directory",
    "db":"/absolute/path/of/aionr/base/chains/directory"
  },
  "aion": {
    "dir":"/absolute/path/of/aion/package/directory"
    }
}

```

##RUN Test
Require NPM, NODE installed;
optional aionr kernel /miner installed.

### install dependencies
```bash
npm install
```

### run from mocha
```bash
./node_modules/mocha/bin/mocha <testApp.js> [[--type <providertype>]] [[--testsuite <path/to/tsv_file>]] [[[--reporter mocha-junit-reporter]][[--reporter-options mochaFile=path/to/result.xml]]]

#example
node_modules/mocha/bin/mocha testApp_190404 --testsuite test_cases/smoke_test.tsv --type http  --no-timeouts
```

provider type: accept http, default, websocket, ipc. Default type is http

testApp_dummy.js: for test rust input
```bash
./node_modules/mocha/bin/mocha testApp_dummy.js --testsuite test_cases/rust_java_input.csv --type http  --no-timeouts [--string]

# --string: using integer string for nonce, value, gas, gasPrice, blockNumber, storagePosition; otherwise: using integer(number) for those values

```

# View Test Report:
```bash
./node_modules/junit-viewer/bin/junit-viewer --results=testReport/ --port=3003
```
Then open browser and navigate to localhost:3003
