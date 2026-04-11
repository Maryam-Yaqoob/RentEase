pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.part2.yml'
        PROJECT_DIR = '/var/lib/jenkins/workspace/RentEase-Pipeline'
    }

    stages {

        stage('Clone Repository') {
            steps {
                echo '========== Cloning Repository =========='
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
            }
        }

        stage('Verify Docker Setup') {
            steps {
                echo '========== Verifying Docker =========='
                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('Build') {
            steps {
                echo '========== Building Containers =========='
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} build --no-cache'
            }
        }

        stage('Deploy') {
            steps {
                echo '========== Deploying Application =========='
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} up -d'
            }
        }

    }

    post {
        success {
            echo 'RentEase Part 2 deployed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
