pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
    }

    stages {
        stage('Fix Permissions & Cleanup') {
            steps {
                echo '========== Cleaning Workspace via Docker to bypass sudo restrictions =========='
                // This uses a small docker container to wipe the workspace. 
                // Since Docker created the root files, Docker is the best tool to delete them.
                sh 'docker run --rm -v ${WORKSPACE}:/ws alpine sh -c "rm -rf /ws/* /ws/.[!.]*"'
            }
        }

        stage('Clone Repository') {
            steps {
                echo '========== Cloning Main Project =========='
                git branch: 'main', 
                    url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
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
                script {
                    echo '========== Cloning & Running Selenium Tests =========='
                    dir('selenium-tests') {
                        git branch: 'main', 
                            url: 'https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git'
                        
                        def frontendIP = sh(
                            script: "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' rentease_frontend_p2",
                            returnStdout: true
                        ).trim()

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
            // Requirement: Send mail to the one who triggers (culprits/developers)
            emailext (
                subject: "RentEase Build Status: ${currentBuild.currentResult} - Build #${env.BUILD_NUMBER}",
                body: """Build Number: ${env.BUILD_NUMBER}
                         Status: ${currentBuild.currentResult}
                         Project: RentEase
                         Check logs: ${env.BUILD_URL}""",
                recipientProviders: [culprits(), developers()]
            )
            
            echo "Cleaning up Docker environment..."
            sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} down || true"
        }
    }
}
