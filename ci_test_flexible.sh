#！/bin/bash


if [ "$1" == "-h" ] ; then
	echo "USAGE: ./ci_test_flexible.sh <list of test data file names> <list of rpc types> <kernel type>"

else

	echo "$1"

	IFS=',' read -r -a files <<< "$1"
	IFS=',' read -r -a types <<< "$2"

	for f in "${files[@]}"; do

		for t in "${types[@]}"; do
			if [ "$3" == "aion" ] ; then
				./node_modules/mocha/bin/mocha testApp_190408_aion.js --type "$t" --testsuite test_cases/"$f".tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/"$f"-"$t"-$(date +%y%m%d%H%M).xml
			else
				./node_modules/mocha/bin/mocha testApp_190408.js --type "$t" --testsuite test_cases/"$f".tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/"$f"-"$t"-$(date +%y%m%d%H%M).xml
			fi

		done
	done
fi
