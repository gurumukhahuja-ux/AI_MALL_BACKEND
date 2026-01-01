# kill_all_node.ps1
Write-Host "Killing ALL Node.js processes..."
taskkill /F /IM node.exe
Write-Host "All Node processes terminated."

Write-Host "Starting SINGLE Backend instance with correct environment..."
.\start_backend_with_env.ps1
