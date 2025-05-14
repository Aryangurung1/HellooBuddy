pipeline {
    agent any

    environment {
        IMAGE_NAME = 'hellobuddy-app'
        CONTAINER_NAME = 'hellobuddy-container'
        ENV_FILE = '/var/lib/jenkins/workspace/hellobuddy/.env.production'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/YOUR_USERNAME/YOUR_REPO.git', branch: 'main'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -a
                    . $ENV_FILE
                    set +a

                    docker build \
                    --build-arg KINDE_CLIENT_ID=$KINDE_CLIENT_ID \
                    --build-arg KINDE_CLIENT_SECRET=$KINDE_CLIENT_SECRET \
                    --build-arg KINDE_ISSUER_URL=$KINDE_ISSUER_URL \
                    --build-arg KINDE_SITE_URL=$KINDE_SITE_URL \
                    --build-arg KINDE_POST_LOGOUT_REDIRECT_URL=$KINDE_POST_LOGOUT_REDIRECT_URL \
                    --build-arg KINDE_POST_LOGIN_REDIRECT_URL=$KINDE_POST_LOGIN_REDIRECT_URL \
                    --build-arg DATABASE_URL=$DATABASE_URL \
                    -t $IMAGE_NAME .
                '''
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
                    --env-file $ENV_FILE \
                    -p 3000:3000 \
                    $IMAGE_NAME
                '''
            }
        }

        stage('Run DB Migrations') {
            steps {
                sh 'docker exec $CONTAINER_NAME npx prisma migrate deploy || true'
            }
        }
    }
}
