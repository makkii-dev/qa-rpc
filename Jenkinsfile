pipeline {
    agent any
    environment { 
        JAVA_ARGS='-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai'
        JENKINS_JAVA_OPTIONS='-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai'

        // aion_rust project configures
        TARGET_NAME="aion_rust_test_deploy"
        AION_RUST_DIR="${WORKSPACE}/../${TARGET_NAME}"
        TESTNET_CONFIG="${AION_RUST_DIR}/aion/cli/config_testnet.toml"
        TESTNET_JSON="${AION_RUST_DIR}/ethcore/res/aion/testnet.json"
        FS_VM_DIR="${AION_RUST_DIR}/vms/fastvm/native/rust_evm_intf/dist"
        LD_LIBRARY_PATH="${env.FS_VM_DIR}:${env.LD_LIBRARY_PATH}"
        LIBRARY_PATH="${env.FS_VM_DIR}"
        
    }

    triggers {
        cron('H/50 * * * 1-5')
        pollSCM('H H H H H')
        upstream(upstreamProjects:"aion_rust_test_deploy", threshold: hudson.model.Result.SUCCESS) 
    }

    stages {
        stage('Build') {
            steps {
                echo 'set up dependencies..'
                sh 'npm install'
            }
        }
      


        stage('Test') {
            steps {
                echo "start aionminer"
                sh 'nohup /run/aionminer -l 172.105.202.95:8008 -u 0xa07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137 -d 0 -t 1 &'
                echo "start aion_rust"
                sh 'nohup ${AION_RUST_DIR}/target/release/aion --config=${TESTNET_CONFIG} --chain=${TESTNET_JSON} &'
                sh 'sleep 7'
                echo 'Testing..'
                sh 'npm test'
                
            }
        }
       
    }
     post{

            success{
                slackSend channel: '@Miao',
                          color: 'good',
                          message: "The pipeline ${currentBuild.fullDisplayName} completed successfully. \nGrab the generated builds at ${env.BUILD_URL}\nCommit: ${GIT_COMMIT}"
            }
            failure {
                //cleanWs()
                slackSend channel: '@Miao',
                color: 'danger', 
                message: "The pipeline ${currentBuild.fullDisplayName} failed at ${env.BUILD_URL}"
            }
        }
}


