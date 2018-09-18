pipeline {
    agent any
    triggers {
        cron('H/50 * * * 1-5')
        pollSCM('* * * * *')
        upstream(upstreamProjects: 'aion_rust', threshold: hudson.model.Result.SUCCESS) 
    }
    environment { 
        MY_ENV="${env.HOME}/my_env"
        JAVA_ARGS='-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai'
        JENKINS_JAVA_OPTIONS='-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai'
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
                echo 'Testing..'
                sh 'npm test'
            }
        }
       
    }
     post{

            success{
                slackSend channel: '@Miao',
                          color: 'good',
                          message: "The pipeline ${currentBuild.fullDisplayName} completed successfully. \nGrab the generated builds at ${env.BUILD_URL}\nCommit: ${GIT_COMMIT}\n Commit by ${GIT_COMMITTER_NAME}"
            }
            failure {
                cleanWs()
                slackSend channel: '@Miao',
                color: 'danger', 
                message: "The pipeline ${currentBuild.fullDisplayName} failed at ${env.BUILD_URL}"
            }
        }
}


