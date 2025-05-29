# AI-Powered Notes App 

This is a full-stack AI notes app allows users to write notes and generate AI-powered summaries and beginner-friendly explanations with optional text-to-speech.

---

## Features

- Write and save personal notes
- User authentication via AWS Cognito
- One-click AI summaries and simplified beginner versions (via Amazon Bedrock)
- Convert notes to audio using text-to-speech
- View, edit, and delete saved notes

---

## Stack

- **Frontend**: React (with Amplify Auth)
- **Backend**: AWS Lambda 
- **Database**: DynamoDB
- **AI Service**: Amazon Bedrock 
- **Infra**: Terraform

---

## Directory Overview

- `frontend/`: React UI, Amplify Auth, and Note Input components
- `lambda/`: Lambda functions 
- `terraform/`: Infrastructure-as-Code (Cognito, API Gateway, Lambda, DynamoDB)

