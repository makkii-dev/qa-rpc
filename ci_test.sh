#！/bin/bash

#nohup /run/aionminer -l 127.0.0.1:8008 -t 2 &
./node_modules/mocha/bin/mocha testApp_190408.js --type http --testsuite test_cases/smoke-test.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/smoke-test-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type http --testsuite test_cases/AMO.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/AMO-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type http --testsuite test_cases/TXTC.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/TXTC-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type http --testsuite test_cases/FTTC.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/FTTC-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type http --testsuite test_cases/bugs.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/bugs-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type http --testsuite test_cases/precompile.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/precompile-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type websocket --testsuite test_cases/smoke-test.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/ws-smoke-test-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type websocket --testsuite test_cases/AMO.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/ws-AMO-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type websocket --testsuite test_cases/TXTC.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/ws-TXTC-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type websocket --testsuite test_cases/FTTC.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/ws-FTTC-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type websocket --testsuite test_cases/bugs.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/ws-bugs-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp_190408.js --type websocket --testsuite test_cases/precompile.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/ws-precompile-$(date +%y%m%d%H%M).xml
