pipeline {
    agent {
        node {
            // By adding '-v2' to the workspace name, we bypass the locked/broken folder entirely
            customWorkspace "/var/lib/jenkins/workspace/RentEase-Pipeline-v2"
        }
    }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
    }

    stages {
        stage('Initial Cleanup') {
            steps {
                echo '========== Cleaning Workspace =========='
                // This wipes the new workspace to keep it tidy
                deleteDir()
            }
        }

        stage('Clone Repository') {
            steps {
                echo '========== Cloning Main Project =========='
                git branch: 'main', 
                    url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
            }
        }

        stage('Build & Start') {
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
                // Logic to identify the committer to fix the 'Triggered by: null' issue
                def authorName = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim() ?: "Committer"
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
            // Cleanup services
            sh "docker compose -f ${env.DOCKER_COMPOSE_FILE} down || true"
        }
    }
}
