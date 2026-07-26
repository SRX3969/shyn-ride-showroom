<div align="center">

  <h1>✨ SHYN RIDE ✨</h1>
  <p><b>Curated Pre-Owned Luxury Car Showroom Platform</b></p>

  <p>
    <a href="https://shynride.in"><img src="https://img.shields.io/badge/Status-Live-emerald?style=for-the-badge&logo=vercel" alt="Status"></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"></a>
    <a href="https://tanstack.com/start"><img src="https://img.shields.io/badge/TanStack-Start-FF4154?style=for-the-badge&logo=react-router&logoColor=white" alt="TanStack Start"></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-CSS_v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4"></a>
    <a href="https://convex.dev"><img src="https://img.shields.io/badge/Database-Convex_Cloud-EE342F?style=for-the-badge&logo=database" alt="Convex"></a>
  </p>

  <br />

</div>

---

## 🌟 About SHYN RIDE

**SHYN RIDE** is a state-of-the-art digital luxury pre-owned car showroom platform based in Bangalore, Karnataka. Built with **TanStack Start (React + Vite)**, **Convex Cloud Backend**, and **Tailwind CSS v4**, the application delivers an unhurried, transparent, and ultra-premium buying and selling experience for exotic luxury automobiles (Porsche, BMW, Mercedes-Benz, Audi, Jaguar, Land Rover).

---

## 📞 Showroom Contact & Concierge

All official connections, booking inquiries, and instant valuations are routed to:

| Channel | Connection Details | Action Link |
| :--- | :--- | :--- |
| ✉️ **Email** | `shreeram.prakasan23@gmail.com` | [Send Mail](mailto:shreeram.prakasan23@gmail.com) |
| 📞 **Direct Call** | `+91 99025 00649` / `9902500649` | [Call Now](tel:+919902500649) |
| 💬 **WhatsApp Automation** | `+91 99025 00649` | [Chat on WhatsApp](https://wa.me/919902500649?text=Hi%20SHYN%20RIDE%2C%20I%20have%20an%20enquiry) |
| 📍 **Showroom Address** | Indiranagar, Bangalore, Karnataka | [View Map](https://shynride.in/contact) |

---

## 🚀 7 Core Modules Architecture

The platform features **7 fully integrated modules** designed for automotive dealership excellence:

### 1. 🏎️ Advanced Inventory Management
- **Detailed Specifications**: Track vehicle RC status, insurance validity, registration state, owner history, fuel type, transmission, and video tour links.
- **Internal Purchase Ledger**: Record acquisition cost, purchase date, sold price, and net profit margins.
- **Multi-Photo Storage**: High-resolution image galleries with drag-and-drop sort ordering backed by Convex Cloud Storage.
- **Status Lifecycle**: `Draft` → `Available` → `Reserved` → `Sold`.

### 2. 🎯 Lead Management CRM Dashboard
- **Kanban & Tabbed Pipeline**: Categorized lead streams (`All Leads`, `New`, `Contacted`, `Test Drives`, `Sell Requests`).
- **1-Click Communication**:
  - 💬 **WhatsApp**: Instant dynamic chat popup with pre-filled lead details.
  - 📞 **Call**: One-touch mobile dialer integration.
  - ✉️ **Email**: Direct mail composer link.
- **Stage Progression**: Move leads through `New Lead` → `Contacted` → `Test Drive Scheduled` → `Closed Won` → `Closed Lost`.

### 3. 🔍 Google-Ready SEO & Structured Data
- **Dynamic Head Meta**: Page titles, canonical URLs, OpenGraph images, and Twitter cards per page/vehicle route.
- **JSON-LD Vehicle Schemas**:
  - `AutoDealer` & `LocalBusiness` structured schema on the homepage.
  - `Car` / `Vehicle` schema on every vehicle listing page for rich Google search snippet indexing.

### 4. 📲 WhatsApp Inquiry Automation
- **Contextual Pre-filled Messages**: Automatically constructs personalized inquiry messages containing car make, model, year, and reference slug.
- **Lead Auto-Capture**: Auto-saves every WhatsApp button click directly into the Convex CRM before launching the WhatsApp app.
- **Floating Action Widget**: Live pulse animation widget on every page for immediate 24/7 client connection.

### 5. 📊 Real-Time Analytics Dashboard
- **Live Traffic Monitoring**: Track total vehicle page views, WhatsApp click-throughs, phone call clicks, and test drive bookings.
- **Top 5 Viewed Luxury Vehicles**: Visual ranking list of the showroom's most popular inventory.
- **Conversion Tracking**: Measure funnel performance from page view to closed transaction.

### 6. 📅 Interactive VIP Online Booking
- **Multi-Service Selection**: Book **Showroom Test Drive**, **Home Test Drive Inspection**, or **Vehicle Hold Reservation**.
- **Time Slot Selector**: Choose between *Morning (10 AM - 1 PM)*, *Afternoon (1 PM - 4 PM)*, or *Evening (4 PM - 7 PM)*.
- **Double Confirmation**: Instant Convex database logging + direct WhatsApp confirmation link.

### 7. ☁️ Enterprise Hosting & Maintenance
- **Vite SSR Build Engine**: Production bundle compiled in 3 seconds (`npm run build`).
- **Vercel Edge Integration**: Configured with custom `vercel.json` SPA rewrites and X-Frame/X-Content security headers.
- **Convex Cloud Backend**: Real-time database backend connected to deployment environment `famous-scorpion-701`.

---

## 🛠️ Technology Stack

```text
SHYN RIDE Tech Stack
├── Frontend Framework : TanStack Start (React 19 + Vite 8)
├── Routing            : TanStack Router (Type-Safe Client & SSR Routing)
├── Database & Backend : Convex Cloud Database (Serverless Real-Time DB)
├── Styling            : Tailwind CSS v4 + tw-animate-css
├── UI Components      : Radix UI Primitives + Lucide Icons + Recharts
├── Form Validation    : React Hook Form + Zod
└── Hosting            : Vercel Cloud + Convex Serverless Backend
```

---

## 💻 Getting Started

Follow these steps to set up the project locally:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/SRX3969/shyn-ride-showroom.git
cd shyn-ride-showroom
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
# Convex Deployment Identifier
CONVEX_DEPLOYMENT=dev:famous-scorpion-701

# Convex Cloud Public URL
VITE_CONVEX_URL=https://famous-scorpion-701.convex.cloud
```

### 4️⃣ Run Development Server
Start the Vite dev server and Convex backend concurrently:
```bash
# Terminal 1: Start Frontend
npm run dev

# Terminal 2: Start Convex Backend (Optional)
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build & Production Deployment

### Build Command
```bash
npm run build
```

### Deploy Backend Mutations
```bash
npx convex deploy
```

---

## 📁 Repository Directory Structure

```text
shyn-ride-showroom/
├── convex/                   # 🗄️ Convex Schema & Server Mutations
│   ├── schema.ts             # Main DB schema (cars, enquiries, bookings, analytics)
│   ├── cars.ts               # Vehicle CRUD & filtering
│   ├── enquiries.ts          # CRM lead management mutations
│   ├── bookings.ts           # Online reservation backend logic
│   ├── analytics.ts          # Traffic & view tracking queries
│   └── settings.ts           # Global site & contact settings
├── src/                      # 💻 Frontend Application Code
│   ├── components/           # 🧩 UI Components & Shared Chrome
│   │   ├── site-chrome.tsx   # Header & Footer Navigation
│   │   ├── floating-actions.tsx # Floating WhatsApp Widget
│   │   ├── booking-modal.tsx # VIP Online Booking Modal
│   │   └── seo.tsx           # Dynamic SEO & JSON-LD Schemas
│   ├── lib/                  # 🛠️ Helper Utilities & WhatsApp URL Builders
│   ├── routes/               # 🗺️ TanStack Router Page Routes
│   │   ├── index.tsx         # Luxury Homepage
│   │   ├── inventory.index.tsx# Full Catalog & Filter Engine
│   │   ├── inventory.$slug.tsx# Vehicle Detail & Spec Sheet
│   │   ├── admin.enquiries.tsx# Lead Management CRM Route
│   │   └── admin.reports.tsx # Analytics Dashboard
│   └── styles.css            # Tailwind v4 Global Design System
├── vercel.json               # ⚙️ Vercel Deployment & SPA Routing Rules
└── README.md                 # 📖 Platform Documentation
```

---

<div align="center">
  <br />
  <p><b>SHYN RIDE — Luxury Redefined. Certified, Transparent, Unhurried.</b></p>
  <p><i>Made for Automotive Excellence in Bangalore, India. 🏎️💨</i></p>
</div>
