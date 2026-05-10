
pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
        PROJECT_DIR = '/var/jenkins_home/workspace/RentEase-Pipeline'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo '========== Cloning Main Project =========='
                git branch: 'main', url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
            }
        }

        stage('Verify Docker Setup') {
            steps {
                echo '========== Checking Docker and Docker Compose =========='
                sh 'docker --version'
                sh 'docker compose --version'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '========== Building Docker Images =========='
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} build'
            }
        }

        stage('Start Services') {
            steps {
                echo '========== Stopping Previous Services (if running) =========='
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} down || true'
                sh 'sleep 5'

                echo '========== Starting Services =========='
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} up -d'
                sh 'sleep 15'
            }
        }

        stage('Health Check') {
            steps {
                echo '========== Verifying Services Health =========='
                sh '''
                    echo "Checking PostgreSQL..."
                    docker exec rentease_db_p2 pg_isready -U postgres

                    echo "Checking Backend API..."
                    docker exec rentease_backend_p2 python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/docs')" || echo "Backend starting - expected"

                    echo "Checking Frontend..."
                    docker ps | grep rentease_frontend_p2
                '''
            }
        }

        stage('Run Selenium Tests') {
            agent {
                docker {
                    image 'markhobson/maven-chrome'
                    args '-u root:root -v /var/lib/jenkins/.m2:/root/.m2'
                    reuseNode true
                }
            }
            steps {
                echo '========== Cloning Test Cases Repo =========='
                dir('selenium-tests') {
                    git branch: 'main', url: 'https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git'
                }

                echo '========== Running Selenium Tests =========='
                dir('selenium-tests') {
                    sh 'mvn test'
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
                sh "git config --global --add safe.directory ${env.WORKSPACE} || true"

                def committer = sh(
                    script: "git log -1 --pretty=format:'%ae'",
                    returnStdout: true
                ).trim()

                def xmlFiles = sh(
                    script: "find ${env.WORKSPACE}/selenium-tests/target/surefire-reports -name '*.xml' 2>/dev/null || echo ''",
                    returnStdout: true
                ).trim()

                def emailBody = ""
                def total = 0
                def passed = 0
                def failed = 0
                def skipped = 0
                def details = ""

                if (xmlFiles) {
                    def raw = sh(
                        script: "grep -h '<testcase' ${env.WORKSPACE}/selenium-tests/target/surefire-reports/*.xml 2>/dev/null || echo ''",
                        returnStdout: true
                    ).trim()

                    if (raw) {
                        raw.split('\n').each { line ->
                            if (!line.trim()) return
                            total++
                            def nameMatcher = (line =~ /name="([^"]+)"/)
                            def name = nameMatcher ? nameMatcher[0][1] : "Unknown"
                            if (line.contains('<failure')) {
                                failed++
                                details += "${name} — FAILED\n"
                            } else if (line.contains('<skipped')) {
                                skipped++
                                details += "${name} — SKIPPED\n"
                            } else {
                                passed++
                                details += "${name} — PASSED\n"
                            }
                        }
                    }

                    emailBody = """
RentEase - Build #${env.BUILD_NUMBER} Test Results
Build Status: ${currentBuild.currentResult}

=== Test Summary ===
Total Tests:  ${total}
Passed:       ${passed}
Failed:       ${failed}
Skipped:      ${skipped}

=== Detailed Results ===
${details}

Build URL: ${env.BUILD_URL}
"""
                } else {
                    emailBody = """
RentEase - Build #${env.BUILD_NUMBER}
Build Status: ${currentBuild.currentResult}

No test results found (tests may have failed to run).

Build URL: ${env.BUILD_URL}
"""
                }

                if (committer && committer != '') {
                    emailext(
                        to: committer,
                        subject: "RentEase Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult} - Test Results",
                        body: emailBody
                    )
                }
            }
        }

        success {
            echo '✅ Pipeline Completed Successfully!'
            echo '  - Frontend: http://EC2_IP:5174'
            echo '  - Backend API: http://EC2_IP:8001'
        }

        failure {
            echo '❌ Pipeline Failed!'
            sh 'docker compose -f ${DOCKER_COMPOSE_FILE} down || true'
        }
    }
}
