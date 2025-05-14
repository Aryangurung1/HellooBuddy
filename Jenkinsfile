pipeline {
    agent any

    environment {
        IMAGE_NAME = 'hellobuddy-app'
        CONTAINER_NAME = 'hellobuddy-container'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/Aryangurung1/HelloBuddy.git', branch: 'main'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Stop Existing Container') {
            steps {
                sh '''
                    docker stop $CONTAINER_NAME || true
                    docker rm $CONTAINER_NAME || true
                '''
            }
        }

        stage('Run New Container') {
            steps {
                sh '''
                    docker run -d \
                    --name $CONTAINER_NAME \
                    --env-file /var/lib/jenkins/workspace/hellobuddy/.env.production \
                    -p 3000:3000 \
                    $IMAGE_NAME
                '''
            }
        }

        stage('Run DB Migrations') {
            steps {
                sh 'docker exec $CONTAINER_NAME npx prisma migrate deploy'
            }
        }
    }
}
