** RUN Test **

```bash
./node_modules/mocha/bin/mocha <testApp_0925.js> [[--type <providertype>]] [[--testsuite <path/to/csv_file>]] [[[--reporter mocha-junit-reporter]][[--reporter-options mochaFile=path/to/result.xml]]]

#example
node_modules/mocha/bin/mocha testApp_1108 --testsuite test_cases/testDriver.csv --type http  --no-timeouts

```

provider type: accept http, default, websocket, ipc. Default type is http



** Error format **
See all of validation format in utils/validFormat.js

LOCKED_ERROR
PARAMS_FORMAT_ERROR
WRONG_PW_ERROR
INVALID_ACC_ERROR
INVALID_METHOD


