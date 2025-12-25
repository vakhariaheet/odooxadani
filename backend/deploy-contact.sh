#!/bin/bash

# Quick deployment script for contact function
# Usage: ./deploy-contact.sh [stage]

set -e

STAGE="${1:-dev-tirth}"

echo "🚀 Deploying contact function to stage: $STAGE"

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    echo "❌ Serverless Framework not found. Installing..."
    npm install -g serverless
fi

# Deploy just the contact function
echo "📦 Deploying submitContact function..."
serverless deploy function --function submitContact --stage $STAGE

echo "✅ Contact function deployed successfully!"
echo "🔗 API Endpoint: https://api-$STAGE.hac.heetvakharia.in/api/contact/submit"