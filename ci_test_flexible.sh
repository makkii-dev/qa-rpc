
#！/bin/bash
## ./ci_test_flexible.sh "${file[@]}" "${type[@]}" false


if [ "$1" == "-h" ] ; then
	echo "USAGE: ./ci_test.sh <list of test data file names> <list of rpc types> <whether starts miner>"

else
	if [ "$3" == true ] ; then
		nohup /run/aionminer -l 127.0.0.1:8008 -t 2 &
	fi

	echo "$1"

	IFS=',' read -r -a files <<< "$1"
	IFS=',' read -r -a types <<< "$2"

	for f in "${files[@]}"; do
		echo "$f"
		for t in "${types[@]}"; do

			echo "$t"
			./node_modules/mocha/bin/mocha testApp_190408.js --type "$t" --testsuite test_cases/"$f".tsv --no-timeouts --reporter mocha-junit-reporter --reporter-options mochaFile=testReport/"$f"-"$t"-$(date +%y%m%d%H%M).xml
		done
	done
fi
