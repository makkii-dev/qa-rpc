#！/bin/bash

nohup /run/aionminer -l 127.0.0.1:8008 -d 0 -t 1 &
./node_modules/mocha/bin/mocha testApp.js --type http --testsuite test_cases/smoke-test.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/smoke-test-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp.js --type http --testsuite test_cases/AMO.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/AMO-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp.js --type http --testsuite test_cases/TXTC.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/TXTC-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp.js --type http --testsuite test_cases/FTTC.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/FTTC-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp.js --type http --testsuite test_cases/bugs.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/bugs-$(date +%y%m%d%H%M).xml

./node_modules/mocha/bin/mocha testApp.js --type http --testsuite test_cases/precompile.tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/precompile-$(date +%y%m%d%H%M).xml
