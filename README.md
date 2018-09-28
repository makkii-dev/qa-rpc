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


**Notes**:
* unlock account w/out timeout (currently is invalid): rust has some problems to overload method with different number of parameters
* unlock account with timeout: if an account unlock time has expired while no transaction is sent by that account since then, isAccountUnlocked will still show this account is unlocked.
* sendTransaction without "to" field causes socket connection refuse
* sendTransaction with empty obj: kernel will consider find null account, which is not unlocked