** RUN Test **

```bash
node_modules/mocha/bin/mocha <testApp_0925.js> [[--type <providertype>]] [[--testsuite <path/to/csv_file>]] [[--reporter mocha-junit-reporter]][[--reporter-options mochaFile=path/to/result.xml]]
```

provider type: accept http, default, websocket, ipc. Default type is http

** Error format **
See all of validation format in utils/validFormat.js

LOCKED_ERROR
PARAMS_FORMAT_ERROR
WRONG_PW_ERROR
INVALID_ACC_ERROR
INVALID_METHOD


** Notes **:
* unlock account w/out timeout (currently is invalid): rust has some problems to overload method with different number of parameters
* unlock account with timeout: if an account unlock time has expired while no transaction is sent by that account since then, isAccountUnlocked will still show this account is unlocked.
* sendTransaction without "to" field causes socket connection refuse
	** sendTransaction without "to" field usually means creating a contract.
* sendTransaction with empty obj: kernel will consider find null account, which is not unlocked
* default gas use for each tx is 21,000
* to calculate tx sender's balance = old_balance - sendValue - gas * gasPrice;
* steps to create a contract and validate it:
	1. create a solidity contract
	2. send the sol file in string to eth_compileSolidity, get bytecode in response; (negative testcase: solidity file contains compile error);
	3. unlock an acouunt, use the bytecode as data, eth_sendTransaction without "to" field;
	4. wait block to seal this transaction, use eth_getTransactionByHash or eth_getTransactionReceipt to access contractAddress(eth_getTransactionByHash.result.contractAddress, eth_getTransactionReceipt)
* steps to use a contract:
	1. store bytecode, abiDefinition, and contractAddress
	2. create a transaction that use the contract (see https://solidity.readthedocs.io/en/develop/abi-spec.html ) and send
	3. wait block to seal, use get
