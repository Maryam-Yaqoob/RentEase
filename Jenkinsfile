pipeline {
    agent {
        node {
            label ''
            customWorkspace "/var/lib/jenkins/workspace/RentEase-Final-v3"
        }
    }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
        // This variable automatically finds the correct network name created by Compose
        COMPOSE_PROJECT_NAME = "rentease-final-v3"
    }

    stages {
        stage('Initialize') {
            steps {
                echo '========== Starting Fresh Pipeline =========='
                deleteDir() 
            }
        }

        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
            }
        }

        stage('Build & Start') {
            steps {
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} build --no-cache"
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} up -d"
                sh 'sleep 15'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                script {
                    dir('selenium-tests') {
                        git branch: 'main', url: 'https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git'
                        
                        def frontendIP = sh(script: "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' rentease_frontend_p2", returnStdout: true).trim()
                        
                        // FIXED: Using ${COMPOSE_PROJECT_NAME}_default to match the new workspace
                        sh """
                        docker run --rm \
                          --network ${COMPOSE_PROJECT_NAME}_default \
                          -e BASE_URL=http://${frontendIP}:5173 \
                          -v \$(pwd):/tests \
                          -w /tests \
                          markhobson/maven-chrome \
                          mvn clean test
                        """
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
                // FIXED: Logic to ensure the committer (triggering person) gets the mail
                def authorName = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim() ?: "Developer"
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
            sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} down || true"
        }
    }
}
