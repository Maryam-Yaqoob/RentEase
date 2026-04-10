pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.part2.yml'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose -f ${COMPOSE_FILE} up -d'
            }
        }

    }

    post {
        failure {
            echo 'Pipeline failed!'
        }
        success {
            echo 'RentEase Part 2 deployed successfully!'
        }
    }
}
