@echo off
echo Starting HealthSync Hospital Management System...

cd backend
start cmd /k "npm run dev"

cd ../frontend
start cmd /k "npm run dev"

echo Both frontend and backend started in new windows.
