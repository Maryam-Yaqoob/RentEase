pipeline {
    agent {
        node {
            label ''
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
        stage('Initialize & Force Cleanup') {
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

                echo 'Waiting for frontend to be ready...'
                sh '''
                    echo "Waiting for frontend to respond..."
                    for i in $(seq 1 40); do
                        if docker exec rentease_frontend_p2 curl -sf http://localhost:5173 > /dev/null 2>&1; then
                            echo "Frontend is ready after attempt $i!"
                            exit 0
                        fi
                        echo "Attempt $i: not ready yet, waiting 10s..."
                        sleep 10
                    done
                    echo "Frontend did not become ready in time!"
                    exit 1
                '''
            }
        }

        stage('Run Selenium Tests') {
            steps {
                script {
                    dir('test-automation') {
                        echo '========== Cloning Selenium Test Repository =========='
                        git branch: 'main', url: "${env.TEST_REPO}"

                        def actualNetwork = sh(
                            script: "docker inspect rentease_frontend_p2 -f '{{range \$k, \$v := .NetworkSettings.Networks}}{{\$k}}{{end}}'",
                            returnStdout: true
                        ).trim()

                        echo "Running tests on network: ${actualNetwork}"

                        sh """
                        docker run --rm \\
                          --network ${actualNetwork} \\
                          -e BASE_URL=http://rentease_frontend_p2:5173 \\
                          -v \$(pwd):/tests \\
                          -w /tests \\
                          markhobson/maven-chrome \\
                          mvn clean test -Dsurefire.rerunFailingTestsCount=2
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
                    def authorName = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def authorEmail = sh(script: "git log -1 --pretty=format:'%ae'", returnStdout: true).trim()

                    emailext (
                        to: "${authorEmail}, maryamyaqub616@gmail.com",
                        subject: "RentEase Build Status: ${currentBuild.currentResult} - #${env.BUILD_NUMBER}",
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
                        body: "Pipeline finished. Status: ${currentBuild.currentResult}"
                    )
                }
            }
            echo "Cleaning up Docker resources..."
            sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} down -v || true"
        }
    }
}
