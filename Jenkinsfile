pipeline {
    agent any
  
    triggers {
        pollSCM('H H H H H')
    }

    stages {
        stage('Build') {
            steps {
                echo 'test node'
                sh 'node --version'
                echo 'set up dependencies..'
                sh 'npm install -f'
            }
        }

        stage('Test') {
            when{
                expression {return params.FORM == "normal"}
            }
            steps {
               sh 'files=(smoke-test,AMO,TXTC,FTTC,bugs,precompile)'
               sh 'types=(http,websocket)'

               sh './ci_test_flexiable.sh $files $types true'
            }
        }
        stage("Test Sync"){
            when{
                expression {return params.FORM == "sync"}
            }
            steps{
                sh 'files=(syncing_testcases)'
                sh 'types=(http,websocket)'

                sh './ci_test_flexiable.sh $files $types false'
            }
        }

    }
     post{
            always {
                archiveArtifacts artifacts: 'testlog/*.txt,testReport/*.xml', fringerprint:true
                junit 'testReport/*.xml'
            }

            success{
                slackSend channel: '@Miao',
                          color: 'good',
                          message: "The pipeline ${currentBuild.fullDisplayName} completed successfully. \nGrab the generated builds at ${env.BUILD_URL}"
            }
            failure {
                //cleanWs()
                slackSend channel: '@Miao',
                color: 'danger',
                message: "The pipeline ${currentBuild.fullDisplayName} failed at ${env.BUILD_URL}."
            }
        }
}
