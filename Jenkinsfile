pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'set up dependencies..'
                sh 'export MY_ENV=$HOME/my_env'
                sh 'printenv'
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
                sh 'npm test'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            
                sh 'npm start'
                
                
            }
        }
       
    }
     post{
            always{
                cleanWs();
            }
            success{
                slackSend channel: '@Miao',
                          color: 'good',
                          message: "The pipeline ${currentBuild.fullDisplayName} completed successfully. Grab the generated builds at ${env.BUILD_URL}"
            }
            failure {
                slackSend channel: '#ci',
                color: 'danger', 
                message: "The pipeline ${currentBuild.fullDisplayName} failed at ${env.BUILD_URL}"
            }
        }
}


