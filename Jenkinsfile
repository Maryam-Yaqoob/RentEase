pipeline {
    agent any

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
                sh 'docker compose -f docker-compose.part2.yml build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose -f docker-compose.part2.yml up -d'
            }
        }

    }

    post {
        failure {
            echo 'Pipeline failed!'
        }
        success {
            echo 'RentEase Part 2 built and deployed successfully!'
        }
    }
}
