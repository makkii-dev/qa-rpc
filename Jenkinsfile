pipeline {
    agent any

    triggers {
        cron('H 7 * * *')
        pollSCM('* * * * *')
    }
    environment{
        FS_VM_DIR="${WORKSPACE}/vms/fastvm/native/rust_evm_intf/dist"
        LD_LIBRARY_PATH="${env.FS_VM_DIR}:${env.LD_LIBRARY_PATH}"
        LIBRARY_PATH="${env.FS_VM_DIR}"
        OLD_PATH="${env.pwd}"
        JAVA_ARGS="-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai"
        JENKINS_JAVA_OPTIONS="-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai"
        TEST_DIRCTORY="aion_web3_test"
        TEST_CONFIG="${WORKSPACE}/aion/cli/config_testnet.toml"
    }
    options {
        timeout(time: 75, unit: 'MINUTES') 
    }
    stages {
        stage('Build') {
            steps {
                sh 'set -e'
                echo "format testing..."
                sh 'cargo +nightly fmt --all -- --check'
            }
        }
        stage('Format_Test'){
            steps{
                echo "building..."
                sh 'RUSTFLAGS="-D warnings" cargo build --release' 
                sh 'RUSTFLAGS="-D warnings" cargo +nightly test --all --no-run --release'
                sh 'RUSTFLAGS="-D warnings" cargo +nightly test --all -j1 --release -- --test-threads 1'

                sh 'rm -rf $HOME/.aion/chains'
             
                sh 'nohup /run/aionminer -l 172.105.202.95:8009 -u 0xa07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137 -d 0 -t 1 &'
                sh 'nohup ./target/release/aion --config=${TEST_CONFIG} &'
                sh 'sleep 7'
                
            }
        }
        stage('Unit_Test') {
            steps {
                echo '==============Testing===================='
                sh 'cd ${WORKSPACE}/${TEST_DIRCTORY}'
                sh 'yarn test --detectOpenHandles'
                echo '==============Test end===================='
                sh 'cd ${WORKSPACE}'
            }
        }

    }
    post{

        success{
            slackSend channel: '@Miao',
                      color: 'good',
                      message: "The pipeline ${currentBuild.fullDisplayName} completed successfully. Grab the generated builds at ${env.BUILD_URL}"
        }
        failure {
            cleanWs();
            slackSend channel: '@Miao',
            color: 'danger', 
            message: "The pipeline ${currentBuild.fullDisplayName} failed at ${env.BUILD_URL}"
        }
    }
}
