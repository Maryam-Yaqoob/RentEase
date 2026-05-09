pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
    }

    stages {
        stage('Self-Heal & Cleanup') {
            steps {
                echo '========== Removing Git Locks and Root Files =========='
                // 1. This deletes the .lock file automatically if it exists
                // 2. This uses Docker to wipe root-owned folders that cause Permission Denied
                sh '''
                    docker run --rm -v ${WORKSPACE}:/ws alpine sh -c "rm -f /ws/.git/config.lock && rm -rf /ws/* /ws/.[!.]*"
                '''
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
            script {
                // Manually extracting committer to fix the "Triggered by: null" issue
                def authorName = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim() ?: "System"
                def authorEmail = sh(script: "git log -1 --pretty=format:'%ae'", returnStdout: true).trim() ?: "maryamyaqub616@gmail.com"

                emailext (
                    to: "${authorEmail}, maryamyaqub616@gmail.com",
                    subject: "RentEase Build Status: ${currentBuild.currentResult} - Build #${env.BUILD_NUMBER}",
                    body: """
                    RentEase Pipeline Result
                    -----------------------
                    Build Number: ${env.BUILD_NUMBER}
                    Status: ${currentBuild.currentResult}
                    Triggered by: ${authorName} (${authorEmail})

                    Check detailed logs here: ${env.BUILD_URL}
                    """,
                    recipientProviders: [culprits(), developers()]
                )
            }
            
            echo "Cleaning up environment..."
            sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} down || true"
        }
    }
}
