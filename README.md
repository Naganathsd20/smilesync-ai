# 🦷 SmileSync AI

### AI-Powered Dental Appointment & Subscription Management Platform

SmileSync AI is a modern dental appointment platform designed to simplify the way patients discover dental services, book appointments, manage subscriptions, and interact with an AI-powered voice assistant.

The platform combines secure authentication, appointment management, subscription billing, email automation, AI voice interactions, and an administrative dashboard into a single full-stack application.

🔗 **Live Demo:** https://smilesync-ai.vercel.app/

---

## ✨ Highlights

* 🏠 **Modern Landing Page** with responsive layouts, gradients, and imagery
* 🔐 **Secure Authentication** using Clerk with Google, GitHub, and Email & Password
* 🔑 **Email Verification** with 6-digit verification codes
* 📅 **Appointment Booking System** for scheduling dental appointments
* 🦷 **3-Step Booking Flow** — Dentist → Service & Time → Confirmation
* 📩 **Automated Email Notifications** for appointment-related events using Resend
* 📊 **Admin Dashboard** for managing and monitoring appointments
* 🗣️ **AI Voice Agent** powered by Vapi for Pro subscribers
* 💳 **Subscription Management** with Free and Paid plans
* 🧾 **Automated Invoice Emails** for subscription transactions
* 💸 **Smart Subscription Upgrades** where users pay only the applicable difference
* 🗄️ **PostgreSQL Database** with Prisma ORM for persistent data management
* 🎨 **Modern UI** built with Tailwind CSS and shadcn/ui
* ⚡ **Efficient Data Fetching** with TanStack Query
* 🤖 **CodeRabbit** for AI-assisted code review and PR optimization
* 🌿 **Git & GitHub Workflow** using branches, pull requests, and merges
* 🚀 **Production Deployment** with Vercel

---

## 🧠 What Makes SmileSync AI Different?

SmileSync AI goes beyond a traditional appointment-booking application by combining **healthcare scheduling, subscription management, automation, and conversational AI**.

Patients can:

1. Create and verify their account
2. Explore available dental services
3. Select a dentist
4. Choose a service and available time
5. Confirm an appointment
6. Receive booking notifications through email
7. Manage their subscription
8. Access the AI voice agent when eligible for a Pro plan

This creates a complete digital experience rather than just a basic appointment form.

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query
* Lucide React
* Recharts

### Authentication & User Management

* Clerk
* Google OAuth
* GitHub OAuth
* Email & Password
* Email Verification

### Backend & Data

* Next.js
* Prisma ORM
* PostgreSQL

### AI & Communication

* Vapi AI — Voice Agent
* Resend — Transactional Email
* React Email — Email Templates

### Payments & Subscriptions

* Clerk Billing / Subscription Management
* Free Plan
* Paid Plans
* Subscription Upgrade Logic
* Invoice Emails

### Development & Deployment

* TypeScript
* Git
* GitHub
* CodeRabbit
* Vercel

---

## 🏗️ Core Features

### 🔐 Authentication

SmileSync AI uses Clerk for authentication and account management.

Supported authentication methods include:

* Google
* GitHub
* Email & Password
* Email verification

---

### 📅 Appointment Booking

Patients can book appointments through a structured three-step process:

**Step 1 — Select Dentist**

Choose the preferred dentist.

**Step 2 — Select Service & Time**

Choose the required dental service and available appointment time.

**Step 3 — Confirm**

Review the booking information and confirm the appointment.

---

### 📊 Admin Dashboard

Administrators can manage appointment-related information through a dedicated dashboard.

The dashboard provides a centralized interface for monitoring and managing appointments.

---

### 🗣️ AI Voice Agent

SmileSync AI integrates **Vapi** to provide an AI-powered voice interaction experience.

The voice agent is available to eligible Pro subscribers and adds a conversational interface to the platform.

---

### 💳 Subscription System

The platform includes multiple subscription tiers:

* **Free**
* **Paid Plans**
* **Pro**

Users can upgrade their subscription based on their requirements.

The platform also includes smart upgrade handling so users are charged according to the applicable subscription difference rather than unnecessarily paying the full amount again.

---

### 📩 Email Automation

Resend is used for transactional email communication.

Email functionality includes:

* Appointment notifications
* Subscription-related communication
* Invoice delivery
* Email-based verification workflows

---

### 🗄️ Database

SmileSync AI uses **PostgreSQL** for persistent data storage with **Prisma ORM** for database access and schema management.

Prisma provides a structured and type-safe way to interact with the application's database.

---

## 🔄 Application Flow

```text
User
 │
 ▼
Authentication
 │
 ▼
Browse Dental Services
 │
 ▼
Select Dentist
 │
 ▼
Select Service & Time
 │
 ▼
Confirm Appointment
 │
 ├──────────────► Email Notification
 │
 ▼
Database
 │
 ▼
Admin Dashboard
```

For Pro users:

```text
Pro User
   │
   ▼
AI Voice Agent
   │
   ▼
Vapi
   │
   ▼
Conversational Interaction
```

---

## 📁 Project Structure

```text
smilesync-ai/
│
├── prisma/
│   └── Database schema and Prisma configuration
│
├── public/
│   └── Static assets and images
│
├── src/
│   └── Application source code
│
├── unused-ui/
│   └── Unused UI components
│
├── .vscode/
│   └── VS Code configuration
│
├── components.json
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tailwind configuration
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Naganathsd20/smilesync-ai.git
```

### 2. Navigate to the Project

```bash
cd smilesync-ai
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file and add the required environment variables for:

* Clerk
* PostgreSQL
* Prisma
* Resend
* Vapi
* Subscription / billing configuration

### 5. Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 📦 Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server.

```bash
npm run lint
```

Runs Biome checks.

```bash
npm run format
```

Formats the project using Biome.

---

## 🔒 Environment Variables

The application requires environment configuration for its external services.

Typical integrations include:

```text
Clerk
PostgreSQL
Prisma
Resend
Vapi
Subscription / Billing
```

> **Note:** Never commit real API keys, secrets, database credentials, or private environment variables to GitHub.

---

## 🚀 Deployment

The application is deployed as a production web application and is accessible through:

🔗 **https://smilesync-ai.vercel.app/**

The project can be deployed using a Next.js-compatible hosting platform with the required environment variables configured.

---

## 📸 Screenshots

Add screenshots of the major application sections here.

Recommended screenshots:

* Landing Page
* Authentication
* Dentist Selection
* Appointment Booking
* Confirmation Page
* Admin Dashboard
* Subscription Plans
* AI Voice Agent

Example:

```md
![SmileSync AI Landing Page](./public/screenshots/landing.png)
```

---

## 🔮 Future Improvements

Potential future enhancements include:

* 📱 Further mobile experience improvements
* 🔔 Real-time appointment reminders
* 📈 Advanced analytics for administrators
* 🤖 Expanded AI-powered patient assistance
* 📅 Calendar synchronization
* 🩺 More personalized patient workflows
* 🔐 Additional security and access-control improvements

---

## 👨‍💻 Developer

**Naganath S Dharwadkar**

Computer Science & Engineering Student
Interested in Software Development, Full-Stack Development, AI, and modern web technologies.

### Connect

* GitHub: https://github.com/Naganathsd20
* Project: https://github.com/Naganathsd20/smilesync-ai
* Live Demo: https://smilesync-ai.vercel.app/

---

## ⭐ If You Find This Project Interesting

Consider giving the repository a ⭐ on GitHub!
