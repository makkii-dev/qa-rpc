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
}