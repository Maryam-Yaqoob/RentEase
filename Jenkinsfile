pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
        PROJECT_REPO = 'https://github.com/Maryam-Yaqoob/RentEase.git'
        SELENIUM_REPO = 'https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git'
    }

    stages {
        stage('Pre-Cleanup') {
            steps {
                echo '========== Force Cleaning Workspace (Root Files) =========='
                // This prevents the "Permission Denied" errors caused by Docker root files
                sh 'sudo rm -rf backend/**/__pycache__ frontend/node_modules selenium-tests/target || true'
            }
        }

        stage('Clone Repository') {
            steps {
                echo '========== Cloning Main Project =========='
                checkout([$class: 'GitSCM', 
                    branches: [[name: '*/main']], 
                    extensions: [[$class: 'CleanBeforeCheckout']], 
                    userRemoteConfigs: [[url: "${env.PROJECT_REPO}"]]
                ])
            }
        }

        stage('Verify Docker Setup') {
            steps {
                echo '========== Checking Docker =========='
                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('Build & Start Services') {
            steps {
                echo '========== Building and Starting Docker Containers =========='
                sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} build --no-cache"
                sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} down || true"
                sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} up -d"
                sh 'sleep 15'
            }
        }

        stage('Health Check') {
            steps {
                echo '========== Verifying Services are Up =========='
                sh '''
                    docker ps | grep rentease_db_p2
                    docker ps | grep rentease_backend_p2
                    docker ps | grep rentease_frontend_p2
                '''
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo '========== Cloning Selenium Test Repo =========='
                dir('selenium-tests') {
                    checkout([$class: 'GitSCM', 
                        branches: [[name: '*/main']], 
                        extensions: [[$class: 'CleanBeforeCheckout']], 
                        userRemoteConfigs: [[url: "${env.SELENIUM_REPO}"]]
                    ])
                }

                echo '========== Executing Tests =========='
                script {
                    def frontendIP = sh(
                        script: "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' rentease_frontend_p2",
                        returnStdout: true
                    ).trim()
                    
                    dir('selenium-tests') {
                        sh "docker run --rm --network rentease-pipeline_default -e BASE_URL=http://${frontendIP}:5173 -v \$(pwd):/tests -w /tests markhobson/maven-chrome mvn clean test"
                    }
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
                -----------------------
                Build Number: ${env.BUILD_NUMBER}
                Status: ${currentBuild.currentResult}
                Triggered by: ${env.GITS_COMMITTER_NAME}

                Check detailed logs here: ${env.BUILD_URL}
                """,
                recipientProviders: [culprits(), developers()]
            )
        }
        
        success {
            echo 'Pipeline Success! Frontend: http://13.48.132.213:5174 | Backend: http://13.48.132.213:8001'
        }

        failure {
            echo 'Pipeline Failed. Stopping services...'
            sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} down || true"
        }
    }
}
