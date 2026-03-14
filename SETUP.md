# PARIVESH 3.0 — Local Setup Guide

## Prerequisites
- Node.js v18+ installed
- PostgreSQL installed and running
- pgAdmin (optional)

## Step 1 — Clone the repo
```bash
git clone https://github.com/soumyaverma598-create/hackathon-3.git
cd hackathon-3
```

## Step 2 — Create PostgreSQL database
Open pgAdmin and run:
```sql
CREATE DATABASE parivesh;
```

## Step 3 — Create backend/.env file
Copy the example file:
```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and update:
```
DB_PASSWORD=your_local_postgres_password
```

## Step 4 — Install all dependencies
```bash
npm install
cd backend && npm install && cd ..
```

## Step 5 — Create tables
```bash
cd backend
node initDB.js
```

## Step 6 — Seed demo data
```bash
node seedDemo.js
```

## Step 7 — Start backend (Terminal 1)
```bash
node app.js
```
✅ Should print: `PARIVESH backend running on port 3002`
✅ Should print: `PostgreSQL connected successfully`

## Step 8 — Start frontend (Terminal 2)
```bash
cd ..
npm run dev
```
✅ Should print: `ready on http://localhost:3000`

## Optional — Enable the AI chatbot with Gemini
Create a root `.env.local` file for the Next.js app and add:
```bash
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

Notes:
- Without `GEMINI_API_KEY`, the floating portal assistant still appears, but it uses limited built-in guidance instead of live AI responses.
- With the key configured, the chatbot calls Gemini through the Next.js route at `/api/chatbot`.
- Restart `npm run dev` after changing `.env.local`.

## Step 9 — Open browser
```
http://localhost:3000/login
```

## Demo Credentials
```
proponent@company.com  / proponent123  (applicant)
scrutiny@moef.gov.in   / scrutiny123   (scrutiny)
mom@moef.gov.in        / mom123        (mom)
admin@moef.gov.in      / admin123      (admin)
```

## Common Errors and Fixes

❌ **"Failed to fetch" on login**
✅ Backend not running
   Fix: `cd backend && node app.js`

❌ **"password authentication failed"**
✅ Wrong DB password in .env
   Fix: Open `backend/.env`, update `DB_PASSWORD`

❌ **"database parivesh does not exist"**
✅ Database not created
   Fix: pgAdmin → run: `CREATE DATABASE parivesh;`
        Then: `node initDB.js`

❌ **"relation applications does not exist"**
✅ Tables not created
   Fix: `cd backend && node initDB.js`

❌ **Dashboard shows no applications**
✅ Database is empty
   Fix: `cd backend && node seedDemo.js`

❌ **Port 3002 already in use**
✅ Another process using the port
   Fix: `npx kill-port 3002`
        Then: `node app.js`

❌ **Port 3000 already in use**
✅ Another Next.js instance running
   Fix: `npx kill-port 3000`
        Then: `npm run dev`

## Complete E2E Workflow Test

Once setup is complete, you can test the full Environmental Clearance workflow:

1. **Login as proponent** → Create new application
2. **Upload documents** → Attach required files
3. **Make payment** → Status changes to paid
4. **Login as scrutiny** → Review application
5. **Raise EDS query** → Status changes to eds_raised
6. **Login as proponent** → Respond to EDS query
7. **Login as scrutiny** → Close EDS → Refer to EAC
8. **Login as mom** → Edit MoM decisions and conditions
9. **Generate MoM PDF** → File downloads successfully
10. **Finalize** → EC certificate PDF generated
11. **Login as proponent** → Download EC certificate

## Troubleshooting Tips

- Ensure PostgreSQL is running before starting the backend
- Check that the `.env` file has the correct database credentials
- If you see CORS errors, make sure both servers are running
- Clear browser cache if you encounter UI issues
- Restart both servers if you make changes to backend configuration

## Project Structure

```
hackathon-3/
├── backend/
│   ├── config/db.js          # Database configuration
│   ├── controllers/           # API controllers
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── .env.example          # Environment template
│   └── .env                  # Your local config (gitignored)
├── src/
│   ├── app/                  # Next.js pages
│   ├── components/           # React components
│   └── lib/                  # Utilities and API calls
└── SETUP.md                  # This file
```

## Support

If you encounter any issues not covered in this guide:
1. Check the browser console for JavaScript errors
2. Check the backend terminal for server errors
3. Verify all steps in this guide were completed correctly
4. Ensure your PostgreSQL installation is working properly
