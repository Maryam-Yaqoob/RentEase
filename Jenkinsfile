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
    
    stage('Run Selenium Tests') {
    steps {
        sh '''
        rm -rf RentEase-Selenium-Tests
        git clone https://github.com/Maryam-Yaqoob/RentEase-Selenium-Tests.git

        FRONTEND_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' rentease_frontend_p2)

        docker run --rm \
          --network rentease_default \
          -e BASE_URL=http://$FRONTEND_IP:5173 \
          -v $WORKSPACE/RentEase-Selenium-Tests:/tests \
          -w /tests \
          markhobson/maven-chrome \
          mvn clean test
        '''
    }
}     

    post {
    always {
        emailext(
            subject: "RentEase Pipeline Result: ${currentBuild.currentResult}",
            body: """
            Job: ${env.JOB_NAME}
            Build Number: ${env.BUILD_NUMBER}
            Status: ${currentBuild.currentResult}
            Console Output: ${env.BUILD_URL}
            """,
            to: "qasimalik@gmail.com"
        )
    }
}
}
