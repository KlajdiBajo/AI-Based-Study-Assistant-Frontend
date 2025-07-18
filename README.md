# AI-Based Study Assistant Frontend

A modern React-based web application that provides an intelligent study assistant platform. Built with React, Vite, and Tailwind CSS, featuring a beautiful UI powered by shadcn/ui components.

## Demo Video

Click the image below to watch the application in action:

<p align="center">
  <a href="https://youtu.be/8YDzjDAyoLA" target="_blank">
    <img src="https://i.imgur.com/NgFJh0P.png" alt="AI Study Assistant Demo" width="720"/>
  </a>
</p>

<p align="center"><em>Click the image to watch the full demo on YouTube</em></p>

## Features

- **User Authentication**: Secure login, signup, and password reset functionality
- **Document Upload**: Upload and process study materials
- **AI-Powered Summaries**: Generate intelligent summaries of uploaded content
- **Interactive Quizzes**: Create and take quizzes based on study materials
- **Dashboard Analytics**: Track your study progress and performance
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Notifications**: Toast notifications for user feedback

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AI-Based-Study-Assistant-Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```bash
   # API Configuration
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── layout/         # Layout components
│   ├── ui/             # shadcn/ui components
├── pages/              # Page components
├── services/           # API service functions
├── store/              # Zustand state management
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
├── router/             # React Router configuration
├── App.jsx             # Main app component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```
