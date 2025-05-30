
# AI-Powered Notes App

A full-stack AI-powered study assistant that helps users summarize study notes, generate beginner-friendly explanations, and listen to them.
---

## ✨ Key Features

* 📝 Write and save personal study notes
* 🔐 User authentication with AWS Cognito
* 🤖 AI-powered summaries and beginner-friendly explanations via Amazon Bedrock (Claude Haiku)
* 🗣️ Text-to-speech with natural British voice 
* 📤 Upload image/PDF/TXT files using Textract for note extraction
* ✏️ Edit AI-generated summaries and explanations
* 🔄 View, edit, and delete saved notes

---

## 🏗️ Technical Overview

* **Frontend**: React (with AWS Amplify for authentication)
* **Backend**: AWS Lambda 
* **AI Services**: Amazon Bedrock (Claude Haiku)
* **Text-to-Speech**: Amazon Polly 
* **File Upload & Extraction**: Amazon Textract
* **Database**: DynamoDB
* **Infra-as-Code**: Terraform

---

## 📱 Usage Guide

### Step-by-Step Instructions

1. **Sign Up / Log In**: Securely authenticate with Cognito.
2. **Create Notes**: Write text directly or upload a file (image, PDF, or TXT).
3. **AI Summary**: Click to generate a key summary or beginner-friendly version.
4. **Edit Notes**: Make changes to AI-generated content.
5. **Listen**: Convert text into audio using British voice.
6. **Save/Delete**: Store or remove notes as needed.

### Feature Explanations

* **Textract Upload**: Extracts text from image/PDF/TXT for summarization.
* **Bedrock Summaries**: Uses Claude to generate both normal and beginner-friendly formats.
* **Text-to-Speech**: Converts notes into podcast-like audio files.
* **Editable Summaries**: Tweak and personalize summaries before saving.

### Security & Performance Notes

* IAM roles scoped with least privilege
* CORS settings configured for frontend communication
* All notes tied to authenticated userId
* API Gateway endpoints protected and rate-limited


