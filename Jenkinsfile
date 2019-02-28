pipeline {
    agent any
  
    triggers {
        cron('H H H H H')
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
            steps {
               
                

            }
        }

    }
     post{
            always {


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
