
# Email Notification Setup Guide

This guide will help you set up email notifications for contact form submissions and quote requests using EmailJS.

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, click "Add New Service"
2. Choose your email provider (Gmail, Outlook, etc.)
3. Follow the instructions to connect your email account
4. Note down your **Service ID**

## Step 3: Create Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template structure:

```
Subject: New {{submission_type}} - Cargo Express Logistics

Hello,

You have received a new {{submission_type}} submission:

From: {{from_name}} ({{from_email}})
Phone: {{phone}}
Company: {{company}}

{{#if quote_id}}
Quote ID: {{quote_id}}
Service Type: {{service_type}}
Route: {{origin}} → {{destination}}
Cargo Type: {{cargo_type}}
Weight: {{weight}} kg
Volume: {{volume}} CBM
Packages: {{packages}}
Ready Date: {{ready_date}}
Delivery Date: {{delivery_date}}
Special Requirements: {{special_requirements}}
{{/if}}

{{#if subject}}
Subject: {{subject}}
{{/if}}

{{#if message}}
Message: {{message}}
{{/if}}

Submitted on: {{submission_date}}

Best regards,
Cargo Express Website
```

4. Save the template and note down your **Template ID**

## Step 4: Get Public Key

1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (User ID)

## Step 5: Update Configuration

1. Open `scripts/email-service.js`
2. Replace the following values:
   - `YOUR_SERVICE_ID` with your Service ID
   - `YOUR_TEMPLATE_ID` with your Template ID  
   - `YOUR_PUBLIC_KEY` with your Public Key
   - `your-email@cargoexpress.com` with your actual email address

## Step 6: Test the Setup

1. Fill out the contact form or quote request form on your website
2. Check your email for notifications
3. Check the browser console for any errors

## Important Notes

- EmailJS free plan allows 200 emails per month
- For production use, consider upgrading to a paid plan
- Make sure to test thoroughly before going live
- Keep your keys secure and don't share them publicly

## Troubleshooting

- If emails aren't sending, check the browser console for errors
- Verify all IDs and keys are correct
- Make sure your email service is properly connected in EmailJS
- Check your spam folder for test emails
