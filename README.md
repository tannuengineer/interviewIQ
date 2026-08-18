# InterviewIQ 🤖

InterviewIQ is an **AI-powered mock interview platform** built using the **MERN stack**. It helps students and job seekers practice Technical & HR interviews, analyze resumes, and receive AI-generated feedback.

## 🚀 Features

- 📄 AI-powered Resume Analyzer
- 🤖 AI-generated Interview Questions
- 💻 Technical & HR Interviews
- 🎤 Voice-based Interview Practice
- 📊 AI-generated Performance Reports
- 📚 Interview History
- 💰 Credit-based System
- 💳 Razorpay Payment Integration
- 🔐 User Authentication
- ✨ Responsive UI & Animations

## 🛠️ Tech Stack

**Frontend:** React.js, Vite, Tailwind CSS, Redux, Framer Motion, Axios

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Multer

**AI:** OpenRouter API

**Authentication:** Firebase Authentication + JWT

**Payments:** Razorpay

## 💳 Pricing

| Plan | Price | Credits |
|------|------:|--------:|
| Free | ₹0 | 100 |
| Starter Pack | ₹100 | 150 |
| Pro Pack | ₹500 | 650 |

Users can purchase additional interview credits through Razorpay. Payments are verified on the backend before credits are added.

## 📂 Project Structure

```text
InterviewIQ/
├── client/
├── server/
├── .gitignore
└── README.md
```

## ⚙️ Run Locally

### Clone

```bash
git clone https://github.com/tannuengineer/interviewIQ.git
cd interviewIQ
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

## 🔐 Environment Variables

Create `.env` files in `client` and `server` with your:

- Firebase credentials
- MongoDB connection
- JWT secret
- OpenRouter API key
- Razorpay credentials

> Never commit `.env` files or API keys to GitHub.

## 🎯 How It Works

```text
Login/Register
      ↓
Upload Resume
      ↓
AI Resume Analysis
      ↓
Select Technical / HR Interview
      ↓
AI Interview
      ↓
AI Feedback & Evaluation
      ↓
Performance Report
      ↓
Interview History
```

## 📚 Learning Reference

This project was developed as a learning project using concepts from a **MERN + AI SaaS tutorial**, with implementation, debugging, customization, and additional features developed during the project.

## 👩‍💻 Author

**Tannu Chauhan**

B.Tech Computer Science & Engineering

⭐ If you like the project, consider giving it a star!

## 🔗 Repository

https://github.com/tannuengineer/interviewIQ
