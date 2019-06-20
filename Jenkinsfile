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
                echo 'set up dependencies..'
                sh './installDependencies'
            }
        }

        stage("get Aionr"){
          when{
            expression {return ${kernel_type} == "aionr"}
          }
          steps{
            sh 'mkdir kernels || echo "kernels folder exist"'
            sh "cp ${kernel_src} kernels/aionr"
            dir('kernels/aionr'){
              echo 'remove custom database'
              sh './custom.sh db kill'
            }
          }
        }
        stage('Test') {
            when{
                expression {return ${run_mode} == "normal"}
            }
            steps {
               sh 'files=(smoke-test,AMO,TXTC,FTTC,bugs,precompile,avm)'
               sh 'types=(http)'

               sh './ci_test_flexiable.sh $files $types aionr'
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
