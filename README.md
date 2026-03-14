# PARIVESH 3.0 - Environmental Clearance Workflow Portal

A fully functional Environmental Clearance workflow portal built for a hackathon.

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Zustand
- **Backend**: Express.js, PostgreSQL, JWT, Multer, pdfkit
- **Database**: PostgreSQL

## Environment Setup for Teammates

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the environment file template:
   ```bash
   cp .env.example .env
   ```

## Portal Assistant

The frontend includes a floating portal assistant in the bottom-right corner.

- It guides users through the website, including proponent proposal steps, documents, EDS, payment, and status tracking.
- For live AI answers, add `GEMINI_API_KEY` in the root `.env.local` file.
- If no Gemini key is configured, the assistant falls back to built-in website guidance.

3. Fill in your PostgreSQL credentials in `backend/.env`:
   - `DB_PASSWORD`: Your PostgreSQL password
   - `JWT_SECRET`: Your preferred JWT secret
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Your Razorpay credentials (optional)

4. Install dependencies and start the backend:
   ```bash
   npm install
   npm run dev
   ```

The backend will run on http://localhost:3002

### Frontend Setup

1. Navigate to the root directory (if not already there):
   ```bash
   cd ..
   ```

2. Copy the environment file template:
   ```bash
   cp .env.local.example .env.local
   ```

3. Configure your frontend environment in `.env.local`:
   - `NEXT_PUBLIC_API_URL`: Backend URL (default: http://localhost:3002)
   - `NEXT_PUBLIC_USE_MOCK`: Set to `false` for real backend, `true` for mock data
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Your Gemini API key (optional)
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your Razorpay key ID (optional)

4. Install dependencies and start the frontend:
   ```bash
   npm install
   npm run dev
   ```

The frontend will run on http://localhost:3000

## Quick Start

After completing the environment setup:

1. Start PostgreSQL database
2. Start backend server (port 3002)
3. Start frontend server (port 3000)
4. Open http://localhost:3000 in your browser

## Authentication

The application supports 4 user roles with JWT authentication:
- Admin
- Proponent
- EDS (Expert Determination System)
- MoM (Minutes of Meeting)

## Database

The application uses PostgreSQL database named `parivesh`. Make sure your PostgreSQL server is running and the database exists before starting the backend.

## Development

- Frontend runs on port 3000
- Backend runs on port 3002
- Database: PostgreSQL on port 5432 (default)

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_USE_MOCK`: Enable/disable mock data
- `NEXT_PUBLIC_GEMINI_API_KEY`: Gemini AI API key
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay payment key ID

### Backend (.env)
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `PORT`: Backend server port
- `RAZORPAY_KEY_ID`: Razorpay key ID
- `RAZORPAY_KEY_SECRET`: Razorpay key secret
