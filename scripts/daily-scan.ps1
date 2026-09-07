# Runs the daily commit-scan via `claude -p`. Invoked by a Windows scheduled task;
# safe to run manually too.

$ErrorActionPreference = "Stop"
$PSScriptRoot = $repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$repoRoot = $PSScriptRoot
Set-Location $repoRoot

$promptPath = Join-Path $repoRoot ".claude\scan-prompt.txt"
$settingsPath = Join-Path $repoRoot ".claude\scan-task.settings.json"
$prompt = Get-Content -Raw -Path $promptPath

$logDir = Join-Path $repoRoot ".claude\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}
$logFile = Join-Path $logDir ("scan-{0}.log" -f (Get-Date -Format "yyyy-MM-dd_HHmmss"))

& claude -p $prompt --settings $settingsPath --allowedTools "Bash,Read,Write,Edit,Glob,Grep" *> $logFile

if ($LASTEXITCODE -ne 0) {
    $errorMessage = "Claude daily scan failed (exit code $LASTEXITCODE); see $logFile"
    Write-Error $errorMessage

    try {
        $eventSource = "Claude Daily Scan"
        if (-not [System.Diagnostics.EventLog]::SourceExists($eventSource)) {
            New-EventLog -LogName Application -Source $eventSource
        }
        Write-EventLog -LogName Application -Source $eventSource -EntryType Error -EventId 1 -Message $errorMessage
    } catch {
        Write-Warning "Could not write to Windows Event Log: $_"
    }

    exit $LASTEXITCODE
}

