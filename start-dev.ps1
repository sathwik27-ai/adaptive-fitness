$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $repoRoot 'backend'
$frontendPath = Join-Path $repoRoot 'frontend'

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error 'Node.js was not found. Install Node.js 20.19+ or 22.12+ and reopen PowerShell.'
    exit 1
}

$nodeVersionText = (node --version).Trim().TrimStart('v')
$nodeVersion = [version]$nodeVersionText
$supportedNode = (
    ($nodeVersion.Major -eq 20 -and $nodeVersion -ge [version]'20.19.0') -or
    ($nodeVersion.Major -ge 22 -and ($nodeVersion.Major -gt 22 -or $nodeVersion -ge [version]'22.12.0'))
)
if (-not $supportedNode) {
    Write-Error "Node.js $nodeVersionText is not supported. Install Node.js 20.19+ or 22.12+."
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error 'npm was not found. Reinstall Node.js with npm included, then reopen PowerShell.'
    exit 1
}

if (-not (Test-Path (Join-Path $backendPath 'node_modules'))) {
    Write-Error 'Backend dependencies are missing. Run "npm ci" from the backend folder first.'
    exit 1
}
if (-not (Test-Path (Join-Path $frontendPath 'node_modules'))) {
    Write-Error 'Frontend dependencies are missing. Run "npm ci" from the frontend folder first.'
    exit 1
}
if (-not (Test-Path (Join-Path $backendPath '.env'))) {
    Write-Error 'backend\.env is missing. Follow section 2 of SETUP.md to create it without overwriting any existing secret.'
    exit 1
}

$powershellPath = Join-Path $PSHOME 'powershell.exe'
Start-Process -FilePath $powershellPath -WorkingDirectory $backendPath -ArgumentList @('-NoExit', '-Command', 'npm run dev')
Start-Process -FilePath $powershellPath -WorkingDirectory $frontendPath -ArgumentList @('-NoExit', '-Command', 'npm run dev')

Write-Host "Started backend (http://localhost:5000) and frontend (http://localhost:5173) in separate PowerShell windows."
Write-Host 'Check the backend window for database connection errors before using the application.'
