# 🏎️ SHYN RIDE - Pre-Owned Luxury Car Showroom

![SHYN RIDE Banner](https://via.placeholder.com/1200x400.png?text=SHYN+RIDE+-+Luxury+Redefined) <!-- Optional banner image: Replace with actual project banner if you have one -->

Welcome to **SHYN RIDE**, the premier destination for pre-owned luxury vehicles. This repository contains the source code for the SHYN RIDE digital showroom, built with modern web technologies to deliver a seamless, blazing-fast, and premium user experience. ✨

---

## 🚀 Tech Stack

We use a cutting-edge stack to ensure performance, scalability, and an exceptional developer experience:

*   **⚡ Framework:** [TanStack Start](https://tanstack.com/start/latest) (React + Vite)
*   **🗺️ Routing:** [TanStack Router](https://tanstack.com/router/latest) for type-safe, powerful navigation
*   **🗄️ Database & Backend:** [Convex](https://www.convex.dev/) (Serverless, real-time database)
*   **🎨 Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling
*   **🧩 UI Components:** [Radix UI](https://www.radix-ui.com/) primitives with `shadcn/ui` patterns
*   **📝 Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

---

## 💎 Features

*   **🏎️ Interactive Showroom:** Browse our curated collection of luxury cars with detailed specifications and high-quality image galleries.
*   **🔍 Advanced Search & Filtering:** Quickly find your dream car based on make, model, price, year, and more.
*   **📱 Fully Responsive:** A premium experience across all devices—from desktop to mobile.
*   **⚡ Real-time Updates:** Powered by Convex for instant data synchronization.
*   **🔐 Admin Dashboard:** Secure area for managing inventory, reports, and site content.

---

## 🛠️ Getting Started

Follow these steps to get the project running on your local machine.

### 1️⃣ Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   `npm` (or `pnpm`, `yarn`, `bun`)

### 2️⃣ Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/your-username/shyn-ride-showroom.git

# Navigate into the directory
cd shyn-ride-showroom

# Install dependencies
npm install
```

### 3️⃣ Environment Variables

Ensure your environment is set up. You will need your Convex deployment URL.

```env
# .env.local
VITE_CONVEX_URL=your_convex_url_here
```

### 4️⃣ Start Development Server

Run the development server. This will start the Vite server and optionally the Convex dev environment if you are running it concurrently.

```bash
# Start the app
npm run dev
```

The application will be available at `http://localhost:3000` (or the port specified in your terminal).

---

## 📁 Project Structure

Here is a brief overview of the project's organization:

```text
shyn-ride-showroom/
├── convex/          # 🗄️ Convex backend functions and schema
├── src/             # 💻 Source code for the frontend application
│   ├── components/  # 🧩 Reusable React components (UI, layouts, etc.)
│   ├── lib/         # 🛠️ Utility functions and helpers (e.g., utils.ts)
│   ├── routes/      # 🗺️ TanStack Router route definitions and pages
│   └── ...
├── public/          # 🖼️ Static assets (images, icons)
├── package.json     # 📦 Dependencies and scripts
└── ...
```

---

## 📜 Scripts

*   `npm run dev` - Starts the development server.
*   `npm run build` - Builds the application for production.
*   `npm run preview` - Previews the production build locally.
*   `npm run lint` - Runs ESLint to check for code quality.
*   `npm run format` - Formats the codebase using Prettier.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some amazing feature'`).
5.  Push to the branch (`git push origin feature/amazing-feature`).
6.  Open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
<div align="center">
  <i>Built with passion for luxury automotive excellence. 🏎️💨</i>
</div>
