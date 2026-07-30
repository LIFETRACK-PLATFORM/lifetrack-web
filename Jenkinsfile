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
      steps {
        sh "pnpm run build"
      }
    }

    stage("Docker Build") {
      steps {
        sh "docker build -t lifetrack-web:${env.BUILD_NUMBER} --build-arg NEXT_PUBLIC_API_GATEWAY_URL=https://api.tracklywork.com ."
      }
    }
  }

  post {
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
