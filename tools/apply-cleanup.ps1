# Robust apply-cleanup script: untrack and archive common items
# Usage: powershell -ExecutionPolicy Bypass -File .\tools\apply-cleanup.ps1

$root = Get-Location
$archive = Join-Path $root ("archive_cleanup_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
New-Item -ItemType Directory -Path $archive -Force | Out-Null

function SafeGitRmCached([string]$path) {
    try {
        git ls-files --error-unmatch -- $path > $null 2>&1
        Write-Output "  -> tracked: git rm --cached -r -- $path"
        try {
            git rm --cached -r -- $path 2>$null
        } catch {
            Write-Output "     (git rm returned non-zero)"
        }
    } catch {
        Write-Output "  -> not tracked: $path"
    }
}

$dirs = @('node_modules','.next','tests','__tests__','playwright-report','test-results','screenshots','scripts','docs')
foreach ($d in $dirs) {
    if (Test-Path $d) {
        Write-Output "Processing directory: $d"
        SafeGitRmCached $d
        $dest = Join-Path $archive $d
        try {
            Move-Item -LiteralPath $d -Destination $dest -Force -ErrorAction Stop
            Write-Output "  Moved $d -> $dest"
        } catch {
            Write-Output "  Failed to move $d"
            Write-Output $_
        }
    }
}

# Tracked Markdown files except README.md and LICENSE.md
$mdFiles = @()
try { $mdFiles = git ls-files '*.md' 2>$null } catch {}
foreach ($f in $mdFiles) {
    if ($f -in @('README.md','LICENSE.md')) { continue }
    Write-Output "Archiving tracked markdown: $f"
    SafeGitRmCached $f
    $dest = Join-Path $archive $f
    New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
    try { Move-Item -LiteralPath $f -Destination $dest -Force } catch { Write-Output "  Move failed: $_" }
}

# Tracked log files
$logFiles = @()
try { $logFiles = git ls-files '*.*log*' 2>$null } catch {}
foreach ($f in $logFiles) {
    Write-Output "Archiving log: $f"
    SafeGitRmCached $f
    $dest = Join-Path $archive $f
    New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
    try { Move-Item -LiteralPath $f -Destination $dest -Force } catch { Write-Output "  Move failed: $_" }
}

# Tracked .sql and .sqlite
$sqlFiles = @()
try { $sqlFiles = git ls-files '*.sql' 2>$null } catch {}
foreach ($f in $sqlFiles) {
    Write-Output "Archiving sql: $f"
    SafeGitRmCached $f
    $dest = Join-Path $archive $f
    New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
    try { Move-Item -LiteralPath $f -Destination $dest -Force } catch { Write-Output "  Move failed: $_" }
}

# Tracked python and ts files in top-level utils or notes (be conservative: only untracked if outside src/app/components/lib)
# We'll skip moving .ts/.py source files to avoid breaking the app; user asked for broad cleanup but we must keep source.

# .env.local
if (Test-Path '.env.local') {
    Write-Output "Archiving .env.local"
    SafeGitRmCached '.env.local'
    try { Move-Item -LiteralPath '.env.local' -Destination (Join-Path $archive '.env.local') -Force } catch { Write-Output "  Move failed: $_" }
}

# Other artifacts
foreach ($f in @('.DS_Store','Thumbs.db')) {
    if (Test-Path $f) {
        Write-Output "Archiving artifact: $f"
        SafeGitRmCached $f
        try { Move-Item -LiteralPath $f -Destination (Join-Path $archive $f) -Force } catch { Write-Output "  Move failed: $_" }
    }
}

Write-Output "\nArchive complete: $archive"
Write-Output "Review the archive and run:\n  git add .gitignore $archive\n  git commit -m 'Move unneeded files to archive'\n  git push"
