# start_backend_with_env.ps1
Write-Host "Attempting to load Vertex AI environment variables from Windows User settings..."

$cred = [System.Environment]::GetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', 'User')
if (-not $cred) { $cred = [System.Environment]::GetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', 'Machine') }

$proj = [System.Environment]::GetEnvironmentVariable('GCP_PROJECT_ID', 'User')
if (-not $proj) { $proj = [System.Environment]::GetEnvironmentVariable('GCP_PROJECT_ID', 'Machine') }

if ($cred) {
    Write-Host "-> Loaded GOOGLE_APPLICATION_CREDENTIALS: $cred"
    $env:GOOGLE_APPLICATION_CREDENTIALS = $cred
} else {
    Write-Host "-> WARNING: GOOGLE_APPLICATION_CREDENTIALS not found in Windows Environment variables."
}

if ($proj) {
    Write-Host "-> Loaded GCP_PROJECT_ID: $proj"
    $env:GCP_PROJECT_ID = $proj
} else {
    Write-Host "-> WARNING: GCP_PROJECT_ID not found in Windows Environment variables."
}

Write-Host "Starting Server..."
npx nodemon .\server.js
