pipeline {
    agent {
        node {
            label ''
            // Using a specific workspace path to ensure a fresh, unlocked start
            customWorkspace "/var/lib/jenkins/workspace/RentEase-Final-Success"
        }
    }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
        COMPOSE_PROJECT_NAME = "rentease-final"
        MAIN_REPO = "https://github.com/Maryam-Yaqoob/RentEase.git"
        TEST_REPO = "https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git"
    }

    stages {
        stage('Initial Cleanup') {
            steps {
                echo '========== Force Cleaning Workspace via Docker =========='
                sh 'docker run --rm -v ${WORKSPACE}:/ws alpine sh -c "rm -rf /ws/* /ws/.[!.]*"'
            }
        }

        stage('Clone Main Project') {
            steps {
                echo '========== Cloning Main Repository =========='
                git branch: 'main', url: "${env.MAIN_REPO}"
            }
        }

        stage('Build & Start Services') {
            steps {
                echo '========== Launching Backend & Frontend =========='
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} down -v --remove-orphans || true"
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} build --no-cache"
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} up -d"
                echo 'Waiting for services to stabilize (30s)...'
                sh 'sleep 30' 
            }
        }

        stage('Run Selenium Tests') {
            steps {
                script {
                    // Create a separate directory for the test repository
                    dir('test-automation') {
                        echo '========== Cloning Selenium Test Repository =========='
                        git branch: 'main', url: "${env.TEST_REPO}"
                        
                        // Dynamically detect the network name to avoid "Network not found" errors
                        def actualNetwork = sh(
                            script: "docker inspect rentease_frontend_p2 -f '{{range \$k, \$v := .NetworkSettings.Networks}}{{\$k}}{{end}}'",
                            returnStdout: true
                        ).trim()
                        
                        echo "Running tests on network: ${actualNetwork}"
                        
                        sh """
                        docker run --rm \
                          --network ${actualNetwork} \
                          -e BASE_URL=http://rentease_frontend_p2:5173 \
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
                    dir('test-automation') {
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
                    // Extract metadata of the person who pushed the code
                    def authorName = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def authorEmail = sh(script: "git log -1 --pretty=format:'%ae'", returnStdout: true).trim()

                    emailext (
                        to: "${authorEmail}, maryamyaqub616@gmail.com",
                        subject: "RentEase Build Status: ${currentBuild.currentResult} - #${env.BUILD_NUMBER}",
                        body: """
                        RentEase Pipeline Notification
                        ------------------------------
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
                        body: "Pipeline finished. Status: ${currentBuild.currentResult}. (Git metadata unavailable)"
                    )
                }
            }
            echo "Cleaning up Docker resources..."
            sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} down -v || true"
        }
    }
}
