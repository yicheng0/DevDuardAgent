$ErrorActionPreference = "Stop"

$Port = if ($env:PORT) { [int]$env:PORT } else { 8080 }

Write-Host "Starting DevGuardAgent Frontend..."
Write-Host "Frontend URL: http://localhost:$Port"
Write-Host "Make sure the backend is running at http://localhost:6872"
Write-Host ""

function Test-Command {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

if (Test-Command "py") {
    Write-Host "Starting server with Python Launcher..."
    py -3 -m http.server $Port
} elseif (Test-Command "python") {
    Write-Host "Starting server with Python..."
    python -m http.server $Port
} elseif (Test-Command "node") {
    Write-Host "Starting server with Node.js..."
    npx http-server -p $Port
} else {
    Write-Error "Python or Node.js was not found. Install Python 3 or Node.js and try again."
    exit 1
}
