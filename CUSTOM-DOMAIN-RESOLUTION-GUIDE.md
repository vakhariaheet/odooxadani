# Custom Domain Resolution Guide

## Current Status ✅

**Module M06 (Client Portal & Dashboard) has been successfully implemented and deployed!**

- ✅ **Backend**: All 5 Lambda functions deployed and working
- ✅ **Frontend**: All React components built and ready
- ✅ **API Endpoints**: Fully functional at AWS-generated URL
- ✅ **Authentication**: Clerk JWT integration working
- ✅ **Database**: DynamoDB integration working

## Working API URL 🌐

**Current API URL**: `https://anulseu0s2.execute-api.ap-south-1.amazonaws.com`

All endpoints are accessible:
- Client Dashboard: `GET /client/dashboard`
- Client Proposals: `GET /client/proposals`
- Client Contracts: `GET /client/contracts`
- Client Invoices: `GET /client/invoices`
- Update Profile: `PUT /client/profile`
- Swagger UI: `GET /` (API documentation)

## Custom Domain Issue 🚨

**Problem**: The custom domain `https://api-dev-pooja.hac.heetvakharia.in/` shows "Not Found"

**Root Cause**: API mapping conflict - "ApiMapping key already exists for this domain name"

**Current Configuration**: Custom domain is disabled (`CUSTOM_DOMAIN_ENABLED=false`) to allow successful deployment

## Resolution Steps 🔧

### Option 1: Manual AWS Console Cleanup (Recommended)

1. **Login to AWS Console**
   - Go to API Gateway → Custom Domain Names
   - Find `api-dev-pooja.hac.heetvakharia.in`
   - Delete existing API mappings
   - Keep the domain itself

2. **Re-enable Custom Domain**
   ```bash
   # In backend/.env
   CUSTOM_DOMAIN_ENABLED=true
   ```

3. **Redeploy**
   ```bash
   cd backend
   ./deploy.sh pooja
   ```

### Option 2: AWS CLI Cleanup

```bash
# List existing API mappings
aws apigatewayv2 get-api-mappings --domain-name api-dev-pooja.hac.heetvakharia.in --region ap-south-1

# Delete conflicting mapping (replace MAPPING_ID with actual ID)
aws apigatewayv2 delete-api-mapping --domain-name api-dev-pooja.hac.heetvakharia.in --api-mapping-id MAPPING_ID --region ap-south-1

# Then redeploy
cd backend
./deploy.sh pooja
```

### Option 3: Certificate Configuration

If the above doesn't work, you may need to configure the ACM certificate:

1. **Find Certificate ARN**
   ```bash
   aws acm list-certificates --region ap-south-1 --query 'CertificateSummary[?DomainName==`*.hac.heetvakharia.in`]'
   ```

2. **Update .env file**
   ```bash
   # In backend/.env
   ACM_CERTIFICATE_ARN=arn:aws:acm:ap-south-1:ACCOUNT:certificate/CERT-ID
   ```

3. **Update serverless.yml** (revert to certificateArn)
   ```yaml
   customDomain:
     certificateArn: ${env:ACM_CERTIFICATE_ARN}
     # Remove certificateName line
   ```

## Testing After Resolution 🧪

Once custom domain is working, test these endpoints:

```bash
# Test API health
curl https://api-dev-pooja.hac.heetvakharia.in/

# Test client endpoints (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://api-dev-pooja.hac.heetvakharia.in/client/dashboard
```

## Frontend Configuration 🎨

Update the frontend API base URL once custom domain is working:

```typescript
// In client/src/services/clientPortalApi.ts
const API_BASE_URL = 'https://api-dev-pooja.hac.heetvakharia.in';
```

## Summary 📋

The Module M06 implementation is **100% complete and functional**. The only remaining issue is the custom domain API mapping conflict, which is a deployment configuration issue, not a code issue.

**Immediate Action**: Use the AWS-generated URL for testing and development while resolving the custom domain issue.

**Next Steps**: Follow Option 1 above to resolve the custom domain issue permanently.