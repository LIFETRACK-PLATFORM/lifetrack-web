pipeline {
  agent any

  tools {
    nodejs "NodeJS-20"
  }

  stages {
    stage("Install") {
      steps {
        sh "npm install -g pnpm@10.21.0"
        sh "pnpm install --frozen-lockfile"
      }
    }

    stage("Lint") {
      steps {
        sh "pnpm run lint"
      }
    }

    stage("Build") {
      environment {
        NEXT_PUBLIC_API_GATEWAY_URL = "https://api.tracklywork.com"
      }
      steps {
        sh "pnpm run build"
      }
    }

    stage("Docker Build") {
      steps {
        sh "docker build -t lifetrack-web:latest --build-arg NEXT_PUBLIC_API_GATEWAY_URL=https://api.tracklywork.com ."
      }
    }
  }

  post {
    always {
      sh 'docker image prune -f'
    }
    success {
      echo "Pipeline OK - frontend #${env.BUILD_NUMBER}"
      githubNotify credentialsId: 'github-token-userpass', account: 'LIFETRACK-PLATFORM', repo: 'lifetrack-web', sha: env.GIT_COMMIT, status: 'SUCCESS', context: 'jenkins-ci', description: 'CI passed'
    }
    failure {
      echo "Pipeline FAILED - frontend #${env.BUILD_NUMBER}"
      githubNotify credentialsId: 'github-token-userpass', account: 'LIFETRACK-PLATFORM', repo: 'lifetrack-web', sha: env.GIT_COMMIT, status: 'FAILURE', context: 'jenkins-ci', description: 'CI failed'
    }
  }
}
