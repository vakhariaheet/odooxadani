# Deploy Contact Function

## Quick Fix for Email Service

The contact form is failing because:

1. ❌ Missing SES permissions in Lambda role
2. ❌ Email identity mismatch

## Solution Applied

✅ **Fixed email addresses** to use `noreply@webbound.dev`
✅ **Added SES IAM permissions** to serverless.yml
✅ **Updated environment variables** for SES configuration

## Deploy Commands

### Option 1: Deploy Full Stack (Recommended)

```bash
cd backend
./deploy.sh dev-tirth
```

### Option 2: Deploy Just the Function (if IAM is already updated)

```bash
cd backend
npx serverless deploy function --function submitContact --stage dev-tirth
```

### Option 3: Update IAM Permissions Only

```bash
cd backend
npx serverless deploy --stage dev-tirth
```

## Verify Deployment

After deployment, test the contact form:

1. Go to https://api-dev-tirth.hac.heetvakharia.in (your frontend)
2. Scroll to "Get in Touch" section
3. Fill out and submit the contact form
4. Check for success message

## Check Logs

If still having issues:

```bash
npx serverless logs --function submitContact --stage dev-tirth --tail
```

## Email Verification

Make sure these emails are verified in AWS SES (us-east-1 region):

- ✅ `noreply@webbound.dev` (sender)
- ✅ `support@webbound.dev` (recipient)

## Expected Behavior

After successful deployment:

1. 📧 **Support team** gets notification email with user's message
2. 📧 **User** gets confirmation email
3. 🎉 **Frontend** shows success toast message
