# PARIVESH 3.0 — E2E Smoke Test Checklist

Run the backend first: `cd backend && node server.js` (ensure no other process uses port 3002)
Run the frontend: `cd .. && npm run dev`

## Tests

- [ ] **Login as proponent@company.com** — redirects to /applicant/dashboard
- [ ] **Dashboard shows seeded applications** (3 apps for proponent)
- [ ] **New Application** — form submits, new row appears in DB
- [ ] **Upload document** — file appears in backend/uploads/
- [ ] **Pay** — payment_status changes to 'paid' in DB
- [ ] **Login as scrutiny@moef.gov.in** — sees all applications
- [ ] **Open App 1** — raise EDS query — status changes to eds_raised
- [ ] **Login as proponent** — sees EDS query — respond to it
- [ ] **Login as scrutiny** — close EDS — refer application to EAC
- [ ] **Login as mom@moef.gov.in** — open App 3 — edit MoM decision
- [ ] **Generate MoM PDF** — file downloads
- [ ] **Finalize** — EC certificate PDF generated — download works
- [ ] **Login as admin@moef.gov.in** — /admin/users (or User Management) shows users

## Demo Credentials

| Email                  | Password      | Role      |
|------------------------|---------------|-----------|
| admin@moef.gov.in      | admin123      | admin     |
| proponent@company.com  | proponent123  | applicant |
| scrutiny@moef.gov.in   | scrutiny123   | scrutiny  |
| mom@moef.gov.in        | mom123        | mom       |

## Setup

```bash
cd backend
node initDB.js    # Creates schema (drops existing tables)
node seedDemo.js  # Seeds demo users + 3 applications
node server.js    # Start backend on port 3002
```

Frontend uses real API when `NEXT_PUBLIC_USE_MOCK` is not `'true'` (default: false).
