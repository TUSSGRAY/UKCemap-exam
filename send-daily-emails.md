# How to Send Daily CeMAP Emails

## Current Email Subscribers

You have **3 active subscribers** enrolled in the "100 Days to CeMAP Ready" campaign:

1. **liz1lorimer@live.co.uk** - Added 2025-11-06, Days sent: 0
2. **Rtussfamily@aol.com** - Added 2025-11-06, Days sent: 0  
3. **test@ukcemap.co.uk** - Test subscriber

## Manual Trigger (Until Automated Scheduling is Set Up)

To manually send the daily quiz emails to all active subscribers:

### Using curl command:

```bash
curl -X POST https://YOUR_REPLIT_URL/api/send-daily-quiz-all \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_INTERNAL_API_KEY"
```

### Using the browser/Postman:

**Endpoint:** `POST /api/send-daily-quiz-all`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: [Your INTERNAL_API_KEY from Secrets]`

**Response:**
```json
{
  "success": true,
  "sent": 3,
  "failed": 0
}
```

### To send to a single subscriber:

```bash
curl -X POST https://YOUR_REPLIT_URL/api/send-daily-quiz \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_INTERNAL_API_KEY" \
  -d '{"email": "liz1lorimer@live.co.uk"}'
```

## What Gets Sent

Each subscriber receives:
- **3 random scenario questions** from the CeMAP question bank
- **Email subject:** "Daily CeMap Pop Quiz - Day X of 100"
- **Beautiful HTML email** with:
  - Question details with scenario context
  - All 4 answer options
  - Answers section at the bottom
  - Progress tracking (Day X of 100)

## Email Tracking

The system automatically:
- Tracks how many days have been sent to each subscriber (max 100)
- Prevents sending to inactive subscribers
- Stops sending after 100 days
- Updates the `days_sent` counter after each successful email

## Setting Up Automated Daily Emails at 8:59 AM UK Time

To automate this, you have two options:

### Option 1: External Cron Service (Recommended)

Use a service like **cron-job.org** or **EasyCron**:

1. Sign up for a free account
2. Create a new cron job:
   - **URL:** `https://YOUR_REPLIT_URL/api/send-daily-quiz-all`
   - **Method:** POST
   - **Schedule:** Daily at 08:59 (GMT/BST)
   - **Headers:**
     ```
     Content-Type: application/json
     x-api-key: YOUR_INTERNAL_API_KEY
     ```

### Option 2: Replit Deployments with Scheduled Tasks

When you publish your app to Replit Deployments, you can set up scheduled tasks using Replit's deployment features. This ensures your cron jobs run reliably even when the development environment is asleep.

## View All Subscribers

To see all current email subscribers, use the SQL query:

```sql
SELECT id, email, subscribed_at, is_active, days_sent 
FROM email_subscriptions 
ORDER BY subscribed_at DESC;
```

## Add New Subscriber Manually

```sql
INSERT INTO email_subscriptions (email, subscribed_at, is_active, days_sent) 
VALUES ('newemail@example.com', NOW(), 1, 0)
ON CONFLICT (email) DO NOTHING;
```

## Important Notes

- The Outlook integration must remain connected for emails to send
- Your Outlook account (ukcemap@outlook.com) is the sender
- Emails come from Microsoft Graph API with proper permissions
- The system prevents duplicate emails for the same day
- Bundle purchasers are automatically enrolled when they provide an email at checkout
