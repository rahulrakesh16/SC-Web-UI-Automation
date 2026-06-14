/*
 * Prerequisites (nothing to pre-configure — all runtime dependencies are defined in
 * the project's own Dockerfile; Jenkins builds the image from source on first run
 * and reuses Docker layer cache on subsequent runs):
 *
 *   Jenkins plugins : Docker Pipeline, JUnit (both ship with Jenkins suggested plugins)
 *   Agent           : Docker daemon must be running on the Jenkins agent node
 */

pipeline {
    agent none

    options {
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Quality Check') {
            agent {
                dockerfile {
                    filename 'Dockerfile'
                    args     '--user root'
                }
            }
            steps {
                sh 'node --version && npm --version'
                sh 'npm ci'
                sh 'npm run quality:check'
            }
            post {
                always { deleteDir() }
            }
        }

        stage('Playwright Tests') {
            parallel {
                stage('Chromium') {
                    agent {
                        dockerfile {
                            filename 'Dockerfile'
                            // --ipc=host required: Chromium uses shared memory for renderer processes
                            args     '--ipc=host --user root'
                        }
                    }
                    steps {
                        sh 'npm ci'
                        sh 'npx playwright test --project=chromium'
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'results/junit.xml'
                            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                            deleteDir()
                        }
                        failure {
                            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                        }
                    }
                }

                stage('Firefox') {
                    agent {
                        dockerfile {
                            filename 'Dockerfile'
                            args     '--ipc=host --user root'
                        }
                    }
                    steps {
                        sh 'npm ci'
                        sh 'npx playwright test --project=firefox'
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'results/junit.xml'
                            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                            deleteDir()
                        }
                        failure {
                            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                        }
                    }
                }

                stage('WebKit') {
                    agent {
                        dockerfile {
                            filename 'Dockerfile'
                            args     '--ipc=host --user root'
                        }
                    }
                    steps {
                        sh 'npm ci'
                        sh 'npx playwright test --project=webkit'
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'results/junit.xml'
                            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                            deleteDir()
                        }
                        failure {
                            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                        }
                    }
                }
            }
        }
    }
}
