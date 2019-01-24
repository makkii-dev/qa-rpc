pipeline {
    agent any
  
    triggers {
        cron('H H H H H')
        pollSCM('H H H H H')
        upstream(upstreamProjects:"aion_rust", threshold: hudson.model.Result.SUCCESS)
    }

    stages {
        stage('Build') {
            steps {
                echo 'set up dependencies..'
                sh 'npm install -f'
            }
        }

        stage('Test') {
            steps {
                echo "clean db"
                sh 'rm -rf $HOME/.aion/chains'
                echo "start aionminer"
                // start aionminer
                sh 'nohup $HOME/Downloads/aionminer -l 172.105.202.95:8008 -u 0xa07e185919beef1e0a79fea78fcfabc24927c5067d758e514ad74b905a2bf137 -d 0 -t 1 &'
                echo "start aion_rust"
                sh 'nohup ${AION_RUST_DIR}/target/release/aion --config=${TESTNET_CONFIG} --chain=${TESTNET_JSON} &'
                sh 'sleep 15'
                echo 'Testing..'
                sh 'npm test --detectOpenHandles'

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
                message: "The pipeline ${currentBuild.fullDisplayName} failed at ${env.BUILD_URL}.\nCommit: ${GIT_COMMIT}"
            }
        }
}
