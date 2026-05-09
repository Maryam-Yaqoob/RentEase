pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
    }

    stages {
        stage('Environment Setup') {
            steps {
                echo '========== Cleaning Workspace =========='
                // Using internal deleteDir to clear anything not root-owned
                deleteDir() 
            }
        }

        stage('Clone Repository') {
            steps {
                echo '========== Cloning Main Project =========='
                checkout([$class: 'GitSCM', 
                    branches: [[name: '*/main']], 
                    userRemoteConfigs: [[url: 'https://github.com/Maryam-Yaqoob/RentEase.git']]
                ])
            }
        }

        stage('Build & Start Services') {
            steps {
                sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} build --no-cache"
                sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} up -d"
                sh 'sleep 15'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                dir('selenium-tests') {
                    echo '========== Cloning Selenium Test Repo =========='
                    git branch: 'main', url: 'https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git'
                    
                    script {
                        def frontendIP = sh(script: "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' rentease_frontend_p2", returnStdout: true).trim()
                        
                        // We use -u root inside docker to ensure it can write/read its own files
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
            emailext (
                subject: "RentEase Build Status: ${currentBuild.currentResult} - Build #${env.BUILD_NUMBER}",
                body: """Build Number: ${env.BUILD_NUMBER}
                         Status: ${currentBuild.currentResult}
                         Triggered by: ${env.GITS_COMMITTER_NAME}
                         Check logs: ${env.BUILD_URL}""",
                recipientProviders: [culprits(), developers()]
            )
            
            echo "Cleaning up Docker..."
            sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} down || true"
            // This final step tries to fix permissions for the NEXT build
            sh "docker run --rm -v ${WORKSPACE}:/workspace alpine chown -R 1000:1000 /workspace || true"
        }
    }
}
