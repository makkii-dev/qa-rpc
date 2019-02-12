** RUN Test **

```bash
./node_modules/mocha/bin/mocha <testApp_0925.js> [[--type <providertype>]] [[--testsuite <path/to/csv_file>]] [[[--reporter mocha-junit-reporter]][[--reporter-options mochaFile=path/to/result.xml]]]

#example
node_modules/mocha/bin/mocha testApp_1108 --testsuite test_cases/testDriver.csv --type http  --no-timeouts

```

provider type: accept http, default, websocket, ipc. Default type is http

testApp_dummy.js: for test rust input
```bash
./node_modules/mocha/bin/mocha testApp_dummy.js --testsuite test_cases/rust_java_input.csv --type http  --no-timeouts [--string]

# --string: using integer string for nonce, value, gas, gasPrice, blockNumber, storagePosition; otherwise: using integer(number) for those values

```

# View Test Report:
```bash
./node_modules/junit-viewer/bin/junit-viewer --results=testResultReports/ --port=3003
```
Then open browser and navigate to localhost:3003
