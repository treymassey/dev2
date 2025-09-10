# Minimal Teams Bot for Azure Web App

This is a minimal Node.js Bot Framework bot exposing:
- GET /  -> returns 200 OK (health check)
- POST /api/messages -> Bot Framework endpoint

## Required App Settings on Azure Web App
- MicrosoftAppId
- MicrosoftAppPassword
- MicrosoftAppType = MultiTenant

## Local test (optional)
npm install
node index.js
curl -i https://localhost:3978/  (or your App Service URL)
