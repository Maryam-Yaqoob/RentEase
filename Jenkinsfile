pipeline {
    agent {
        node {
            label ''
            customWorkspace "/var/lib/jenkins/workspace/RentEase-Final-v4"
        }
    }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
        COMPOSE_PROJECT_NAME = "rentease-final-v4"
    }

    stages {
        stage('Initialize & Force Cleanup') {
            steps {
                echo '========== Cleaning Workspace via Docker =========='
                // Using Docker to clean ensures root files are deleted without needing EC2 sudo
                sh 'docker run --rm -v ${WORKSPACE}:/ws alpine sh -c "rm -rf /ws/* /ws/.[!.]*"'
            }
        }

        stage('Clone Repository') {
            steps {
                echo '========== Cloning Main Project =========='
                git branch: 'main', url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
            }
        }

        stage('Build & Start Services') {
            steps {
                echo '========== Launching Containers =========='
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} down --remove-orphans || true"
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} build --no-cache"
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} up -d"
                echo 'Waiting for services to stabilize...'
                sh 'sleep 30' 
            }
        }

        stage('Run Selenium Tests') {
            steps {
                script {
                    dir('selenium-tests') {
                        echo '========== Running Selenium Suite =========='
                        git branch: 'main', url: 'https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git'
                        
                        // Robust way to get the internal container name/IP
                        def frontendService = "rentease_frontend_p2"
                        
                        sh """
                        docker run --rm \
                          --network ${COMPOSE_PROJECT_NAME}_default \
                          -e BASE_URL=http://${frontendService}:5173 \
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
                try {
                    // Extracting the actual person who pushed the code
                    def authorName = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def authorEmail = sh(script: "git log -1 --pretty=format:'%ae'", returnStdout: true).trim()

                    emailext (
                        to: "${authorEmail}, maryamyaqub616@gmail.com",
                        subject: "RentEase Build Result: ${currentBuild.currentResult} - #${env.BUILD_NUMBER}",
                        body: """
                        RentEase Pipeline Result
                        -----------------------
                        Build Number: ${env.BUILD_NUMBER}
                        Status: ${currentBuild.currentResult}
                        Triggered by: ${authorName} (${authorEmail})

                        Logs: ${env.BUILD_URL}
                        """,
                        recipientProviders: [culprits(), developers()]
                    )
                } catch (Exception e) {
                    emailext (
                        to: "maryamyaqub616@gmail.com",
                        subject: "RentEase Pipeline Alert #${env.BUILD_NUMBER}",
                        body: "Build failed during initialization. Status: ${currentBuild.currentResult}"
                    )
                }
            }
            // Force down and remove volumes to prevent "Resource in use" errors
            sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} down -v || true"
        }
    }
}
