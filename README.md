# Zoom Cloud - Frontend Application

Zoom Cloud is a premium SaaS Cloud Storage web application built with **Next.js 15**. It offers a sleek, modern user interface, real-time feedback, and full responsiveness across all devices.

## ✨ Key Features

- **Modern & Premium UI**: Designed with a focus on aesthetics, featuring **Glassmorphism**, smooth transitions, and a curated dark theme.
- **Full Responsiveness**: A completely redesigned sidebar and header system for a seamless experience on mobile, tablet, and desktop devices.
- **Interactive Dashboard**:
  - File and folder management with intuitive navigation.
  - Real-time storage usage tracking via dynamic progress bars.
  - Integrated billing and subscription history views.
- **Admin Portal**:
  - Advanced package management tools.
  - Comprehensive user monitoring and subscription tracking.
  - Global system configuration controls.
- **Performance Optimized**: Built with Next.js for server-side rendering and static optimization.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI & Lucide React
- **State Management**: Redux Toolkit
- **Data Fetching**: Axios & RTK Query
- **Validation**: Zod & React Hook Form
- **Toasts**: Sonner for elegant notifications.

## ⚙️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file and add:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📱 Responsive Implementation

The sidebar is implemented as a **Sheet (Drawer)** on mobile devices, providing a native-app feel. Desktop users enjoy a persistent, organized navigation system. 

The layout system is built with **Flexbox** and **Grid** to adapt fluidly to any screen size.

## 🏗️ Architecture

- **`src/app`**: Contains all pages and layout logic following the Next.js App Router pattern.
- **`src/components`**: Modular UI components organized by feature area (layout, ui, etc.).
- **`src/context`**: React Context providers for global state like authentication.
- **`src/utils`**: Utility functions and API service configurations.
- **`src/store`**: Redux Toolkit store and API slices for state management.
