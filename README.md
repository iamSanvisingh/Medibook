# MediBook — Full-Stack Healthcare Appointment Platform

MediBook is a full-stack healthcare platform with three separate applications — Patient, Doctor, and Admin — sharing one backend. Beyond standard appointment booking, it features an AI-assisted clinical workflow: doctors can upload lab report PDFs, which are automatically parsed by Google's Gemini API into structured, classified biomarker data, stored in a dedicated PostgreSQL layer secured with Row-Level Security.

## Architecture

MediBook uses **polyglot persistence** — two databases, each chosen for what it's actually good at:

- **MongoDB** — scheduling, user/doctor accounts, appointments, prescriptions. Flexible, document-shaped data with no need for strict relational guarantees.
- **PostgreSQL (via Prisma ORM)** — structured clinical lab report and biomarker data, where strict typing, numeric range queries, and enforced relationships genuinely matter. Protected by **Row-Level Security** policies enforcing per-doctor and per-patient data isolation directly at the database engine level, independent of application code.

The two databases are linked at the application layer via shared MongoDB `_id` values stored as plain strings in Postgres — there's no cross-database foreign key (which isn't possible between two separate database engines), so referential integrity across the boundary is handled deliberately in application code.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS (patient-facing app, admin panel, and doctor panel — three separate Vite apps)
- **Backend**: Node.js, Express.js
- **Databases**: MongoDB (Mongoose), PostgreSQL (Prisma ORM)
- **AI**: Google Gemini API with schema-constrained structured output, validated server-side with Zod before any database write
- **Authentication**: JWT, with role-based middleware for Patient, Doctor, and Admin
- **Payments**: Razorpay
- **File storage**: Cloudinary
- **PDF text extraction**: pdf-parse

## Key Features

### Three-tier authentication
Separate JWT-protected flows for Patient, Doctor, and Admin, each with their own middleware and permissions.

### AI-assisted clinical dashboard
Doctors can upload a patient's lab report PDF. The system extracts raw text, sends it to Gemini with a schema-constrained prompt, validates the AI's structured JSON response against a Zod schema, computes clinical status (NORMAL/HIGH/LOW/CRITICAL) deterministically in application code, and displays a triage queue, biomarker breakdown, AI-generated executive summary, and recommended actions.

### Row-Level Security
PostgreSQL policies ensure a doctor's queries can only ever return their own patients' lab data, and a patient's queries can only return their own — enforced by the database itself, not only by application-level filtering, as a genuine second layer of defense.

### Prescriptions
Doctors can write structured prescriptions (medication, dosage, frequency, duration, instructions) tied to a specific appointment; patients can view their prescription history.

### Appointment booking & payments
Patients browse doctors by specialty, book available time slots, and pay via Razorpay.

### Admin panel
Manage doctors, view platform-wide analytics (bookings, revenue by department, clinician load), and oversee all appointments.

### Dark mode
System-wide, persisted light/dark theme across all three apps.

## Folder Structure

Medibook/
├── frontend/     # Patient-facing React app
├── admin/        # Admin + Doctor panel React app
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/           # MongoDB (Mongoose) models
│   ├── middlewares/       # Auth, upload, rate limiting
│   ├── config/            # DB connections, Cloudinary, Gemini client
│   ├── prisma/
│   │   ├── schema.prisma  # PostgreSQL schema
│   │   └── migrations/    # Versioned SQL migrations, including RLS policies
│   ├── utils/              # Gemini prompt + Zod schema
│   └── server.js

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/iamSanvisingh/Medibook.git
cd Medibook
```

### 2. Install dependencies for all three apps
```bash
cd backend && npm install
cd ../admin && npm install
cd ../frontend && npm install
```

### 3. Environment variables

**`backend/.env`**
```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

**`admin/.env`**
```env
VITE_BACKEND_URL=http://localhost:4000
```

**`frontend/.env`**
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_ADMIN_URL=http://localhost:5174
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 4. Set up PostgreSQL
```bash
cd backend
npx prisma migrate deploy
```

### 5. Run all three apps
```bash
# in backend/
npm run server

# in admin/
npm run dev

# in frontend/
npm run dev
```

## Deployment

- **Backend**: deployed on Render (persistent Node process — needed for a stable Prisma connection pool, avoiding the connection-exhaustion issues serverless platforms have with Postgres)
- **Frontend & Admin**: deployed separately on Vercel
- **MongoDB**: MongoDB Atlas
- **PostgreSQL**: Neon (serverless Postgres)

## License

This project is for portfolio/educational purposes.
