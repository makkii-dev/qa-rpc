pipeline {
    agent any
    triggers {
        cron('H/20 * * * 1-5')
        pollSCM('* * * * *')
    }
    environment { 
        MY_ENV='${HOME}/my_env'
        JAVA_ARGS='-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai'
        JENKINS_JAVA_OPTIONS='-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai'
    }
    stages {
        stage('Build') {
            steps {
                echo 'set up dependencies..'
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
                slackSend channel: '@Miao',
                color: 'danger', 
                message: "The pipeline ${currentBuild.fullDisplayName} failed at ${env.BUILD_URL}"
            }
        }
}


