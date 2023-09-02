pipeline{
    agent any
    stages('Source'){
        steps{
            git 'https://github.com/nehaasthana0807/Education/foodinc-end-user-app.git'
            sh "cd Education/foodinc-end-user-app/"
            sh "npm install"
            echo 'Source stage done'
        }
    }

    stages('Test'){
        steps{
            
            sh "npm run cypress:run"
            echo 'Test stage done'
        }
    }
    stages('Build'){
        steps{
            sh "npm run build"
            echo 'Build stage done'
        }
    }
}