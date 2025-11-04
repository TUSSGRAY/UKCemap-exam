# 100 Days Email Campaign - Deployment Notes

## Overview
The application includes a "100 Days to CeMAP Ready" email campaign for bundle package purchasers. This document explains how to set up the daily email scheduling.

## Email Functionality
Bundle purchasers who opt-in will receive:
- 3 random scenario questions with answers
- Sent daily at 8:59am
- For 100 consecutive days
- Via Outlook from ukcemap@outlook.com

## Scheduling Setup

### Option 1: External Cron Service (Recommended)
Use a third-party cron service to trigger the daily emails:

1. **Services to consider:**
   - cron-job.org (free tier available)
   - EasyCron
   - cronhub.io

2. **Setup steps:**
   - Create a cron job that runs daily at 8:59am
   - Configure it to make a POST request to:
     ```
     https://your-app-url.replit.app/api/send-daily-quiz-all
     ```
   - Add the required header:
     ```
     X-API-Key: YOUR_INTERNAL_API_KEY
     ```
   - Set the schedule to: `59 8 * * *` (8:59am daily)

3. **Environment Variables:**
   Add to your Replit Secrets:
   ```
   INTERNAL_API_KEY=<generate-a-secure-random-string>
   ```

### Option 2: Replit Deployments + Cron Service
1. Publish your application on Replit Deployments
2. Follow Option 1 setup with your deployment URL

### Option 3: Manual Triggering (Development/Testing)
For testing purposes, you can manually trigger emails:

```bash
curl -X POST https://your-app-url.replit.app/api/send-daily-quiz-all \
  -H "X-API-Key: YOUR_INTERNAL_API_KEY"
```

## Security Notes

- The email sending endpoints (`/api/send-daily-quiz` and `/api/send-daily-quiz-all`) are protected with API key authentication
- Never expose the `INTERNAL_API_KEY` in client-side code
- Email subscriptions are created server-side during payment verification to prevent tampering
- The subscription endpoint `/api/subscribe-email` is deprecated and disabled

## Testing Email Delivery

To test email delivery for a specific subscriber:

```bash
curl -X POST https://your-app-url.replit.app/api/send-daily-quiz \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_INTERNAL_API_KEY" \
  -d '{"email": "test@example.com"}'
```

## Monitoring

Check subscription status for an email:
```bash
curl "https://your-app-url.replit.app/api/subscription-status?email=test@example.com"
```

## Important Notes

1. **Outlook Integration**: Ensure the Outlook connector is properly set up and authenticated
2. **Daily Limits**: The system tracks days sent (max 100) per subscriber
3. **Active Subscriptions**: Only active subscriptions with < 100 days sent will receive emails
4. **Error Handling**: Failed email sends are logged but don't stop other subscribers from receiving emails
