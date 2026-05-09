pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo '========== Cloning Main Project =========='
                checkout([$class: 'GitSCM', 
                    branches: [[name: '*/main']], 
                    extensions: [[$class: 'CleanBeforeCheckout']], 
                    userRemoteConfigs: [[url: 'https://github.com/Maryam-Yaqoob/RentEase.git']]
                ])
            }
        }

        stage('Verify Docker Setup') {
            steps {
                sh 'docker --version && docker compose version'
            }
        }

        stage('Build & Start') {
            steps {
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} build --no-cache'
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} down || true'
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} up -d'
                sh 'sleep 15'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo '========== Cleaning and Cloning Test Repo =========='
                // This SH command solves the "Permission Denied" nonsense permanently
                sh "sudo rm -rf ${WORKSPACE}/selenium-tests/target || true"
                
                dir('selenium-tests') {
                    checkout([$class: 'GitSCM', 
                        branches: [[name: '*/main']], 
                        extensions: [[$class: 'CleanBeforeCheckout']], 
                        userRemoteConfigs: [[url: 'https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git']]
                    ])
                    
                    sh '''
                    docker run --rm \
                      --network rentease-pipeline_default \
                      -e BASE_URL=http://rentease_frontend_p2:5173 \
                      -v $PWD:/tests \
                      -w /tests \
                      markhobson/maven-chrome \
                      mvn clean test
                    '''
                }
            }
            post {
                always {
                    dir('selenium-tests') {
                        junit '**/target/surefire-reports/*.xml'
                    }
                }
            }
        }
    }

    post {
        always {
            emailext(
                // Added your email directly so it never fails even if GitHub noreply is used
                to: 'maryamyaqub616@gmail.com',
                subject: "RentEase Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult}",
                body: "Build ${currentBuild.currentResult}. Check logs: ${env.BUILD_URL}",
                recipientProviders: [culprits(), developers()]
            )
        }
        failure {
            sh 'docker compose -f ${DOCKER_COMPOSE_FILE} down || true'
        }
    }
}
