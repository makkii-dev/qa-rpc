## Purpose

A test frame that can run test based on the given tsv file to test Kernel RPC APIs.
Currently, the framework can send RPC requests, validate responses, control the Kernel and miner(testApp_190408/testApp_190408_aion).

### updates
testApp_190408.js:
* add controller to start and terminate the **local** kernel and miner and for Java Kernel as well
* no longer need to start the  **local** kernel and miner in the separater terminal;
* update the new core RPC spec in validation
* support AVM ABI

#### TO DO
* add new field in tsv test file to control the kernel to connect which network;
* add new field in tsv test file to control whether to launch the kernel or not；

# Content
* [Configuration](#configuration)
  * [configure RPC](#configure-rpc)
    * [configure kernel and miner](#configure-kernel-and-miner)
* [RUN Test](#run-test)
  * [install dependencies](#install-dependencies)
  * [Create / Check Test Cases](#create-/-Check-test-cases)
  * [run tests using quick run script](#run-tests-using-quick-run-script)
  * [run from mocha](#run-from-mocha)
* [View Test Report](#view-test-report)
* [Customed TestCases](#Custom-TestCases)
  * [Test Case Files](#Test-Case-Files)
    * [Table Header](#Table-Header)


## Configuration:

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

### configure kernel and miner locations
If launching test script using `./ci_test_flexible.sh`, go to `libs/configs/subProcess.json` and edit the fields:

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
*`miner` field is the miner for Aionr Kernel.*

### configure kernels and test Accounts
Update the genesis file and configuration of each kernel(`kernel_configs/aion` and `kernel_configs/aionr`), so the test account can have some pre-mined balance.

Many test cases use keystore accounts to perform the transactions, the test accounts `kernel_configs/testing_accounts.tar.gz` needs to be added into each kernel.
* aion (JAVA):
```bash
cp <extracted account folder> custom/keystore

# check if account has been imported
./aion.sh -n -a list

```
* aionr (Rust):
```bash
./custom.sh account import <extracted account folder>/*

# check if account has been imported
./custom.sh account list

```



## RUN Test
Require NPM, NODE installed;
optional aionr kernel /miner installed.

### install dependencies
```bash
./installDependencies.sh
```

### Create / Check Test Cases
This tool is data-driven test tool. All the test data files are located `test_cases`. The contracts that may be used by the tests are located at `testContracts`.

Before running the testcases, you need to
1. Check if `libs/utils/providers/providers_config.json` and `libs/configs/subProcess.json` contains the correct information.
2. All the test accounts have enough balance and the keystores are accessiable to the Kernel. Some testdcases involve balance validation, make sure those testcases use an account other than the coinbase.
3. For Aion (JAVA) Kernel check if the miner and RPC is enabled.

### run tests using quick run script
```bash
./ci_test_flexible.sh <tsv test case files> <socket type> <kernel type>
```
**tsv test case file** *should be placed in "test_cases" folder.*
**socket type** *accept http,websocket,ipc*
**kernel type** *accept "aion","aionr" (default value is aionr)*

### run from mocha
```bash
./node_modules/mocha/bin/mocha <testApp.js> [[--type <providertype>]] [[--testsuite <path/to/tsv_file>]] [[[--reporter mocha-junit-reporter]][[--reporter-options mochaFile=path/to/result.xml]]]

#example
node_modules/mocha/bin/mocha testApp_190404 --testsuite test_cases/smoke_test.tsv --type http  --no-timeouts
```

provider type: accept http, default, websocket, ipc. Default type is http


## View Test Report:
```bash
./node_modules/junit-viewer/bin/junit-viewer --results=testReport/ --port=3003
```

Then open browser and navigate to localhost:3003

## Custom TestCases

### Test Case Files

File type: .tsv (Tab Separated Values)

#### Table Header:  

TestSet|execute|usePreparedData|testDescription|id|method|params|runtimeVal|storeVariables|preStoreVariables
---|---|---|---|---|---|---|---|---|---


* **TestSet**: defines the test case name.
* **execute**: whether to execute the line. If the cell is marked, that line will be executed.
* **usePreparedData**: whether to use the prepared data from previous steps. If the line has TestSet cell filled and usePreparedData cell filled, the test case will use the runtime variables from the last test case; if the line is a test step and have usePreparedData cell filled, the test step will load data that collected from previous test steps.
* **testDescription**: describes the test steps.
* **id**: the ID may be put into RPC requests.
* **method**: the major function call names. It presents in the format [module][.[method]].

  * Method modules and methods:

module|method|description|params|Require PreparedData
---|---|---|---|---
requestMethod|JSON-RPC methods|send RPC request; <br> * eth_getTransactionReceipt will keep sending requests until the response is not null or reaching the timeout (4 min);<br> * Customed method: rawRequest – for sending invalid rpc request objects | JSON-RPC params, except for rawRequest. rawRequest takes entire rpcjson string|Depend on situations; often used by eth_sendTransaction / personal_sendTransaction
validFormat|none|the valid basic RPC response format / value|[ keyword, defined_format or value[, additional_value]) ]|No
helper|delay|pause the test for certain seconds|[timeout_in_sec]|no
helper|createPKAccount|create a pair-key account and store account info into runtime_variables.account and runtime_variables.newCreateAccount|[ option object ]|no
helper|prepareRawTx|prepare the signed transaction using the info of runtime_variables.account, and store the signed transaction into runtime_variables.rawTx for future usage|[ transaction object ]|No;
helper|newContract|prepare the deploy code for certain contract that has been compiled, and store the compiled code into runtime_variables.nextObj.data for future usage|[contract_name]|No; but to deploy the contract, eth_sendTransaction needs to mark yes.
helper|prepareContractCall|prepare the tx data for a contract function call, and store the compiled code into runtime_variables.nextObj.data for future usage|[func_name[, param1[,...]]|No; but to call the contract method, eth_sendTransaction needs to mark yes.
helper|getEvent|prepare the event signature for next filter, and store the compiled code into runtime_variables.nextObj.topics for future usage|event_name|No, but to put topics when eth_getLogs need the topics that row need to mark yes
helper|data0xPrefix|add/remove "0x" for given variables|[ boolean,runtime_variable_names ]|no
helper|inc|increase runtime_variables by given amounts (can be negative value)|{  runtime_variable_name: amount , ...  }|no
helper|newAVMContract|Prepare tx data for avm contract|[contract.jar[, argument types array, argument array] ]|No; but to deploy the contract, eth_sendTransaction needs to mark yes.
helper|callAVMMethod|Prepare tx data for avm contract call|[method r[, argument types array, argument array] ]|No; but to call the contract method, eth_sendTransaction/eth_call needs to mark yes.
helper|parseAVMResult|Decode avm return data||
validateFunction|balanceValidate.pre|a function paired with balanceValicate.post; check sender and receiver's balance and track down gasPrice, transaction value before sending the transaction; the transaction object will be stored in runtime_variables.nextObj for future usage|transaction object|No; but to call the send the trx, eth_sendTransaction needs to make yes.
validateFunction|balanceValidate.post|a function paired with balanceValicate.pre; check sender and receiver's balance and validate the result with the expected result.|null|no
validateFunction|validateMining|a function to validate if an account receives mining rewards|[ test_account, boolean (whether the acc gets rewards) ]|no
validateFunction|rptLogs|validate the logs in receipt|[logs_number,[ logObjectCriteria ] ]|no
validateFunction|minerStats|validate the minerStats|test_account|no

* **params**: a JSON-liked string that presents the method params: the string contains no quotation marks
  * any number without "0x" will parse into a number
	* any string starting with "_" will be replaced with the value in runtime_variables
  * "true", "false", "null" will parse into true, false, null
  * eth_compileSolidity read file from ./testContract/{ params_value }
  * no whitespace allowed
* **runtimeVal (optional)**: rename a runtime_variable.  
  * Data Format : old_variable_name1=>new_variable_name1[,old_variable_name2=>new_variable_name2,...]  (no white space allowed).
* **storeVariables (optional)**: save response fields into runtime_variables for future usages.  
  * Data format: field_name1=>variable_name1[,field_name2=>variable_name2,...] (no white space allowed).  
* **preStoreVariables (optional)**:  pre-defined some runtime_variables before running current step.
* **Data Format**: runtime_variable_name1=value1[,runtime_variable_name2=value2] (no white space allowed)

### Test Tutorials
#### Tutorial 1: Run a Simple RPC Test

Expect to run a rpc request and validate its response, for example: eth_blockNumber

First break the test into steps:
1.Send a Rpc request to the kernel; method is eth_blockNumber, params is an empty array.
2.When get the response, check if the result is QUANTITY [1].

Secondly, start to write a tsv file:

* Open an old test case file in a text editor, remove data except the header row and save it as new tsv file
* (optional) Open the new tsv file in spreadsheet editor and select “separated by tab”
* Give a name to “TestSet”, for example: eth_blockNumber smoke
* Mark “execute” column in the same row
* Put the test steps above into “testDescription” column and fill other columns, like this

TestSet |execute |usePreparedData |testDescription |id |method |params
---|---|---|---|---|---|---
Eth_blockNumber smoke |x| | | | |
  |x| |Send a Rpc request to the kernel; method is eth_blockNumber, params is an empty array |Eth_blockNumber-request |requestMethod.eth_blockNumber |[]
  |x| |When get the response, check if the result is QUANTITY|Eth_blockNumber-valid|validFormat|[match,HEX]

* Save the file, in case the spreadsheet editor will auto reformat the file. Reopen the file in a plain text editor to double check if each field are separated by tab.
* Go to `chaion_qa` folder, run “./ci_test_flexible.sh <new test name> < RPC connection type >”

#### Tutorial 2: Run RPC test with helper and validateFunc
Here comes a test scenario that create local account, and send value from this account and check if the transaction succeeded:

Steps:
1. Create a paired keys with helper.createPKAccount
2. Receive some value from pre-mined account:
  a. Check the balance of both the pre-mined account and new created account(validationFunction.balanceValidate.pre)
  b. Unlock the pre-mined account
  c. Send the value to the new account
  d. Validate the transaction result (validationFunction.balanceValidate.post)
3. Send some value back to the pre-mined account:
  a. Sign transaction local(helper.prepareRawTx)
  b. Check the balance of both account (validationFunction.balanceValidate.pre)
  c. Send the signed transaction
  d. Validate the transaction result (validationFunction.balanceValidate.post)

Translate to steps in tsv file.

TestSet |execute |usePreparedData |testDescription |id |method |params |runtimeVal |storeVariables |preStoreVariables
---|---|---|---|---|---|---|---|---|---
Create a local account and receive and send value |x| | | | | | | |
 |x| |Create a paired keys with helper.createPKAccount |1|helper.createPKAccount|{}| | |Acc1= 0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c
 |x| |Check the balance of both the pre-mined account and new created account|2a|validationFunction.balanceValidate.pre|{from:_Acc1,to:_newCreateAccount,value: 20000000000000000}| | |
 |x| |Unlock the pre-mined account|2b|requestMethod.personal_unlockAccount|[_Acc1,password,10]| | |
 |x|x|Send the value to the new account|2c|requestMethod.eth_sendTransaction|[{}]| | |  
 |x| |Validate the transaction result|2d|validationFunction.balanceValidate.post| | | |
 |x| |Sign transaction local|3a|helper.prepareRawTx|{from:_newCreateAccount,to:_Acc1,value: 10000000000000000}| | |
 |x|x|Check the balance of both account|3b|validationFunction.balanceValidate.pre|{}| | |
 |x| |Send the signed transaction|3c|requestMethod.eth_sendRawTransaction|[_rawTx.rawTransaction]| | |
 |x| |Validate the transaction result|3d|validationFunction.balanceValidate.post| | | |


### availiable test cases:
Under "test_cases" folder:
- AMO.tsv : account management related testcases
- bugs.tsv : previous bugs
- FTTC.tsv : filter testcases
- TXTC.tsv : transaction testcases
- precompile.tsv: precompile related testcases
- avm.tsv: avm related testcase
- smoke-test: rpc smoke testcases

For RPC normalization:
- newRPCtests: update testcases to match the new RPC specifications
- RPC_normalization_tests: the testcases aiming at the known differencies between the old rpc and new standards
