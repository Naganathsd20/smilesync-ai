# 🦷 SmileSync AI

## AI-Powered Dental Care & Clinic Management Platform

SmileSync AI is a full-stack web application that combines AI-powered dental care with appointment and clinic management.

The platform provides two separate role-based experiences:

- **Patient Portal** — personalized dental care, AI assistance, assessments, care plans, health insights, reminders, and appointments.
- **Professional / Staff Portal** — appointment, patient, dentist, and availability management for authorized staff.

## ✨ Key Features

### 👤 Patient Portal

- 🧠 **AI Oral Health Assessment** — AI-generated risk score, risk factors, recommendations, warning signs, and suggested next steps.
- 🤖 **Nova AI Dental Assistant** — conversational AI for personalized educational dental guidance.
- 📋 **Personalized Care Plan** — customized dental-care recommendations with an interactive checklist.
- 📊 **AI Dental Health Insights** — health metrics, trends, activity visualizations, and personalized insights.
- 🔔 **Smart Follow-Ups & Reminders** — personalized reminders for appointments, checkups, assessments, and oral-care habits.
- 📅 **Appointment Management** — dentist selection, availability checking, scheduling, conflict detection, and email confirmations.
- 🎙️ **AI Voice Assistant** — voice-based interaction powered by Vapi.
- 💳 **Pro Subscription** — premium subscription functionality.

### 👨‍⚕️ Professional / Staff Portal

- Staff Dashboard
- Appointment Management
- Patient Management
- Dentist Management
- Dentist Availability Management
- Dentist Profile Management
- Dentist Activation / Deactivation
- Role-based access protection

## 🔐 Authentication & Security

- Clerk authentication
- Role-Based Access Control (RBAC)
- Separate patient and professional workflows
- Protected staff routes
- Server-side authentication and authorization
- Server-side input validation
- Secure AI API integration
- Protected Vapi session handling
- User-specific database access
- Appointment conflict validation
- Environment-based secret management

## 🧠 AI Capabilities

Google Gemini is integrated into multiple application workflows:

- Oral Health Risk Assessment
- Nova AI conversations
- Personalized Dental Care Plans
- Dental Health Insights
- Smart Reminder personalization

Vapi is used for the voice-based AI experience.

## 🗄️ Data & Backend

SmileSync AI uses **PostgreSQL with Prisma ORM and Neon** for persistent application data.

The database manages:

- Users
- Doctors
- Appointments
- Oral Health Assessments
- Nova Conversations
- Nova Messages
- Smart Reminders

The application uses **Next.js Server Actions and API Routes** for server-side operations.

## 🛠️ Tech Stack

**Frontend:**  
Next.js 16, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts

**Backend:**  
Next.js Server Actions, API Routes, Prisma ORM

**Database:**  
PostgreSQL, Neon

**AI:**  
Google Gemini

**Voice AI:**  
Vapi

**Authentication:**  
Clerk, Role-Based Access Control

**Email:**  
Resend

**Deployment:**  
Vercel

## 🏗️ Application Architecture

```text
                         SmileSync AI
                              │
              ┌───────────────┴───────────────┐
              │                               │
       Patient Portal                 Professional Portal
              │                               │
      ┌───────┼────────┐              ┌───────┼────────┐
      │       │        │              │       │        │
     AI   Appointments Insights    Patients Dentists Availability
      │
      ├── Assessment
      ├── Nova AI
      ├── Care Plan
      └── Reminders
              │
              ▼
       Next.js Server Layer
              │
       ┌──────┼──────┐
       │      │      │
    Gemini Prisma Resend
       │      │
     Vapi PostgreSQL
              │
             Neon

```

## 📊 Project Highlights

- 🚀 Full-stack Next.js application
- 👥 Separate Patient & Professional/Staff portals
- 🤖 Multiple AI-powered dental-care workflows
- 💬 Persistent and personalized AI conversations
- 📋 Personalized healthcare workflows
- 📅 Appointment scheduling with conflict detection
- 🔐 Secure authentication and role-based authorization
- 🎙️ Voice AI integration
- 🔔 Automated email notifications and smart reminders
- 🗄️ Production database using PostgreSQL & Neon
- ☁️ Production deployment on Vercel
- 📱 Responsive modern user interface


🌐 Live Demo

SmileSync AI:
https://smilesync-ai.vercel.app

👨‍💻 Developer

Naganath S Dharwadkar

GitHub:
https://github.com/Naganathsd20/smilesync-ai
