pipeline {
    agent any

    triggers {
        pollSCM('H H H H H')
    }
    environment{
  		JAVA_HOME="/run/jdk-11"
  		PATH="${JAVA_HOME}/bin:${PATH}"
  		LIBRARY_PATH="${JAVA_HOME}/lib/server"
  		LD_LIBRARY_PATH="${LIBRARY_PATH}:/usr/local/lib:/run/libs"
	 }


    stages {
        stage('Build') {
            steps {
                echo 'test node'
                sh 'node --version'

                script{
                    try{
                        //sh 'set -o pipefail'
                        echo 'set up dependencies..'
                        sh './installDependencies.sh'
                    }catch(e){
                        echo "ignore missing dependencies"
                    }
                }
            }
        }

        stage("get Aionr"){

          steps{
            sh 'mkdir kernels || echo "kernels folder exist"'
            sh "cp -R ${kernel_src} kernels/aionr"
            dir('kernels/aionr'){
              echo 'remove custom database'
              sh './custom.sh db kill || echo "no database"'
            }
          }
        }
        stage('Test') {

            steps {
               script{
                   try{
                       sh 'rm -rf testlog testReport'
                   }catch(e){
                       echo 'no previous test log and resport'
                   }
               }

               sh './ci_test_flexible.sh -h'
               sh "./ci_test_flexible.sh ${test_cases} ${test_socket} aionr"
            }
        }
      

    }
     post{
            always {
                script{
                  sh 'rm -r kernels'
                }
                archiveArtifacts artifacts: 'testlog/*.txt,testReport/*.xml', fingerprint:true
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
