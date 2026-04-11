pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/Maryam-Yaqoob/RentEase.git'
            }
        }

        stage('Build') {
            steps {
                sh 'docker compose -f docker-compose.part2.yml build --no-cache'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose -f docker-compose.part2.yml up -d --no-build'
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
