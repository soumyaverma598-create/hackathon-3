# Supabase Email Integration Guide

## Overview
This guide walks you through integrating Supabase email functionality into your PARIVESH 3.0 backend to send emails to users.

## Prerequisites
- A Supabase project (create one at: https://supabase.com)
- Access to your Supabase project credentials

## Step 1: Set Up Supabase Project

1. **Create a Supabase Project** (if you don't have one):
   - Go to https://supabase.com and sign up
   - Create a new project
   - Note your project URL and API keys

2. **Get Your Credentials**:
   - Go to your Supabase project dashboard
   - Navigate to **Settings** → **API**
   - Note your:
     - **Project URL** (SUPABASE_URL)
     - **Anon Key** (SUPABASE_ANON_KEY)
     - **Service Key** (SUPABASE_SERVICE_KEY) - Keep this secret!

## Step 2: Configure Environment Variables

1. Open `backend/.env` file (create if it doesn't exist)
2. Add the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Application
APP_URL=http://localhost:3000
```

## Step 3: Install Dependencies

Run this command in the backend directory:

```bash
npm install
```

This will install the `@supabase/supabase-js` package that was added to package.json.

## Step 4: Email Configuration

### Option A: Using Supabase Auth Email (Recommended)

The current implementation works with Supabase Auth. To enable email sending:

1. Go to your Supabase project
2. Navigate to **Authentication** → **Email Templates**
3. Configure email verification, password reset, and other templates as needed

### Option B: Enable SMTP (Alternative)

If you want to use a custom SMTP provider:

1. Update `backend/config/supabase.js` to use SMTP
2. Add SMTP credentials to `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL=noreply@parivesh.gov.in
   ```

## Step 5: API Endpoints

### New Email-enabled Endpoints

#### 1. **User Signup with Welcome Email**
**POST** `/auth/signup`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "applicant",
  "department": "Ministry of Environment",
  "designation": "Officer"
}
```

Response:
```json
{
  "success": true,
  "message": "User created successfully. Welcome email sent.",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "applicant"
    }
  }
}
```

#### 2. **Send Custom Notification Email**
**POST** `/notifications/send`

Requires authentication. Request body:
```json
{
  "userId": 1,
  "title": "Application Submitted",
  "message": "Your application has been successfully submitted. We will review it and get back to you soon.",
  "type": "info",
  "applicationId": null
}
```

Response:
```json
{
  "success": true,
  "message": "Notification sent and stored",
  "data": {
    "id": 1
  }
}
```

#### 3. **Send Application Status Email**
**POST** `/notifications/send-status`

Requires authentication. Request body:
```json
{
  "userId": 1,
  "applicationId": 123,
  "status": "approved",
  "remarks": "All documents verified. Approved for processing."
}
```

Response:
```json
{
  "success": true,
  "message": "Status notification sent and stored",
  "data": {
    "id": 2
  }
}
```

## Step 6: Email Service Functions

The following functions are available in `backend/services/emailService.js`:

### `sendWelcomeEmail(email, name)`
Sends a welcome email to new users.

### `sendNotificationEmail(email, title, message, type)`
Sends a notification email with custom title and message.

### `sendApplicationStatusEmail(email, name, applicationId, status, remarks)`
Sends an application status update email.

### `sendPasswordResetEmail(email, name, resetLink)`
Sends a password reset email (use when implementing password recovery).

### `sendEmail(to, subject, html, text)`
Generic email sending function - use for custom email needs.

## Step 7: Test the Integration

### Test Signup with Email:
```bash
curl -X POST http://localhost:3002/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Send Notification:
```bash
curl -X POST http://localhost:3002/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": 1,
    "title": "Test Notification",
    "message": "This is a test notification email"
  }'
```

## Step 8: View Email Logs (Supabase)

1. Go to your Supabase project dashboard
2. Navigate to **Auth** → **Users**
3. Check user creation logs
4. Navigate to **Settings** → **Email**
5. View email sending logs and status

## Troubleshooting

### Emails Not Sending?

1. **Check Supabase Configuration**:
   - Verify SUPABASE_URL and SUPABASE_ANON_KEY in `.env`
   - Ensure they match your Supabase project

2. **Check Email Templates**:
   - Go to Supabase Auth → Email Templates
   - Ensure templates are configured
   - Check if emails are being caught as spam

3. **Check Server Logs**:
   - Look for error messages in console
   - Check `emailService.js` console outputs

4. **Verify User Email**:
   - Ensure email addresses are valid
   - Check Supabase Users table for the new user

### Authentication Errors?

- Make sure JWT token is included in Authorization header for protected routes
- Token format: `Authorization: Bearer <token>`

## Next Steps

1. **Customize Email Templates**:
   - Edit templates in `backend/services/emailService.js`
   - Adjust HTML styling as needed
   - Add your brand's logo and colors

2. **Add More Email Types**:
   - Create new functions in `emailService.js` for specific use cases
   - Add API endpoints as needed

3. **Email Scheduling**:
   - Consider using a job queue library (e.g., Bull, RabbitMQ)
   - For sending bulk emails or scheduled notifications

4. **Error Handling**:
   - Implement retry logic for failed emails
   - Log email events in database for audit trail

## Security Notes

- Never expose SUPABASE_SERVICE_KEY in frontend code
- Keep `.env` file out of version control (add to `.gitignore`)
- Use environment-specific credentials for production
- Implement rate limiting for email endpoints
- Validate and sanitize all user inputs before sending emails

## Support

For Supabase documentation: https://supabase.com/docs
For email API details: https://supabase.com/docs/guides/auth

---

**Integration completed!** Your PARIVESH 3.0 backend now has full Supabase email functionality.
