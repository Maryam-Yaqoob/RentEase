pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
        PROJECT_DIR = '/var/lib/jenkins/workspace/RentEase-Pipeline'
    }

    stages {

        stage('Clone Repository') {
            steps {
                echo '========== Cloning Main Project =========='
                git branch: 'main',
                    url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
            }
        }

        stage('Verify Docker Setup') {
            steps {
                echo '========== Checking Docker =========='
                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '========== Building Docker Images =========='
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} build --no-cache'
            }
        }

        stage('Start Services') {
            steps {
                echo '========== Stopping Previous Services =========='
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} down || true'
                sh 'sleep 5'

                echo '========== Starting Services =========='
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} up -d'
                sh 'sleep 15'
            }
        }

        stage('Health Check') {
            steps {
                echo '========== Verifying Services =========='
                sh '''
                    echo "Checking PostgreSQL..."
                    docker ps | grep rentease_db_p2

                    echo "Checking Backend..."
                    docker ps | grep rentease_backend_p2

                    echo "Checking Frontend..."
                    docker ps | grep rentease_frontend_p2
                '''
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo '========== Cloning Selenium Test Repo =========='

                dir('selenium-tests') {
                    git branch: 'main',
                        url: 'https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git'
                }

                echo '========== Running Selenium Tests =========='

                script {
                    env.FRONTEND_IP = sh(
                        script: "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' rentease_frontend_p2",
                        returnStdout: true
                    ).trim()
                }

                dir('selenium-tests') {
                    sh '''
                    docker run --rm \
                      --network rentease-pipeline_default \
                      -e BASE_URL=http://$FRONTEND_IP:5173 \
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
                to: 'maryamyaqub616@gmail.com',
                subject: "RentEase Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult}",
                body: """
RentEase Pipeline Result

Build Number: ${env.BUILD_NUMBER}
Build Status: ${currentBuild.currentResult}

Project Repo:
https://github.com/Maryam-Yaqoob/RentEase

Selenium Repo:
https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests

Build URL:
${env.BUILD_URL}
"""
            )
        }

        success {
            echo 'Pipeline completed successfully!'
            echo 'Frontend URL: http://13.48.132.213:5174'
            echo 'Backend URL: http://13.48.132.213:8001'
        }

        failure {
            echo 'Pipeline failed!'
            sh 'docker compose -f ${DOCKER_COMPOSE_FILE} down || true'
        }
    }
}
