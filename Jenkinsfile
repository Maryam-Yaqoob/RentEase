pipeline {
    agent {
        node {
            label ''
            customWorkspace "/var/lib/jenkins/workspace/RentEase-Final-v3"
        }
    }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
        COMPOSE_PROJECT_NAME = "rentease-final-v3"
    }

    stages {

        stage('Initialize') {
            steps {
                echo '========== Starting Fresh Pipeline =========='

                sh '''
                    sudo chmod -R 777 /var/lib/jenkins/workspace/RentEase-Final-v3 || true
                    sudo chown -R jenkins:jenkins /var/lib/jenkins/workspace/RentEase-Final-v3 || true

                    sudo find /var/lib/jenkins/workspace/RentEase-Final-v3 -name "__pycache__" -type d -exec rm -rf {} + || true
                    sudo find /var/lib/jenkins/workspace/RentEase-Final-v3 -name "*.pyc" -delete || true
                '''

                deleteDir()
            }
        }

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
            }
        }

        stage('Build & Start') {
            steps {

                sh """
                    docker compose -p ${COMPOSE_PROJECT_NAME} \
                    -f ${env.DOCKER_COMPOSE_FILE} down || true
                """

                sh """
                    docker compose -p ${COMPOSE_PROJECT_NAME} \
                    -f ${env.DOCKER_COMPOSE_FILE} build --no-cache
                """

                sh """
                    docker compose -p ${COMPOSE_PROJECT_NAME} \
                    -f ${env.DOCKER_COMPOSE_FILE} up -d
                """

                sh 'sleep 20'
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

                // Get latest GitHub committer info
                def authorName = sh(
                    script: "git log -1 --pretty=format:%an",
                    returnStdout: true
                ).trim()

                def authorEmail = sh(
                    script: "git log -1 --pretty=format:%ae",
                    returnStdout: true
                ).trim()

                // fallback email
                if (!authorEmail) {
                    authorEmail = "maryamyaqub616@gmail.com"
                }

                emailext(
                    to: "${authorEmail}",
                    subject: "RentEase Build ${currentBuild.currentResult} - Build #${env.BUILD_NUMBER}",
                    body: """
RentEase CI/CD Pipeline Result

Build Number: ${env.BUILD_NUMBER}
Status: ${currentBuild.currentResult}

Triggered Committer:
${authorName}
${authorEmail}

Build URL:
${env.BUILD_URL}
""",
                    recipientProviders: [
                        culprits(),
                        developers()
                    ]
                )
            }

            sh """
                docker compose -p ${COMPOSE_PROJECT_NAME} \
                -f ${env.DOCKER_COMPOSE_FILE} down || true
            """
        }
    }
}
