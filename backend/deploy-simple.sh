#!/bin/bash

# Simple deployment script for Windows
STAGE="dev-tirth"

echo "Deploying to $STAGE..."

# Type check
echo "Running type check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "Type check failed, but continuing..."
fi

# Deploy
echo "Deploying with serverless..."
npx serverless deploy --stage "$STAGE" --verbose

if [ $? -eq 0 ]; then
    echo "Deployment successful!"
else
    echo "Deployment failed!"
    exit 1
fi