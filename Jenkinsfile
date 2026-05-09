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
    }

    stages {
        stage('Initial Cleanup') {
            steps {
                echo '========== Force Cleaning Workspace =========='
                // Docker is used to wipe everything because it has permission to delete its own root files
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
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} down -v --remove-orphans || true"
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
                        
                        // Finds the actual network name dynamically
                        def actualNetwork = sh(
                            script: "docker inspect rentease_frontend_p2 -f '{{range \$k, \$v := .NetworkSettings.Networks}}{{\$k}}{{end}}'",
                            returnStdout: true
                        ).trim()
                        
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
                    // This captures the committer name and email for the requirement
                    def authorName = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def authorEmail = sh(script: "git log -1 --pretty=format:'%ae'", returnStdout: true).trim()

                    emailext (
                        // Mail goes to BOTH you and the person who pushed (Sir Qasim or you)
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
                        body: "Pipeline failed early. Status: ${currentBuild.currentResult}"
                    )
                }
            }
            // Cleans up containers and networks so Sir Qasim sees a clean environment
            sh "docker compose -p ${COMPOSE_PROJECT_NAME} -f ${env.DOCKER_COMPOSE_FILE} down -v || true"
        }
    }
}
