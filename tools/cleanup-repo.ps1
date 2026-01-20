param(
    [switch]$Apply
)

# Safe PowerShell cleanup script
# Usage: .\tools\cleanup-repo.ps1         -> dry-run
#        .\tools\cleanup-repo.ps1 -Apply -> perform archive and git rm --cached

$root = Get-Location
$archive = Join-Path $root ("archive_cleanup_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
Write-Output "Archive dir: $archive"

$matches = @()

Write-Output "Scanning files... this may take a moment."

Get-ChildItem -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
    $name = $_.Name
    # always skip these
    if ($name -in @('README.md','LICENSE.md','.env.example')) { return }

    if ($_.PSIsContainer) {
        if ($name -in @('node_modules','tests','__tests__','playwright-report','test-results','screenshots','scripts','docs','.next')) {
            $matches += $_.FullName
        }
    } else {
        if ($name -match '\.md$' -or $name -match '\.log$' -or $name -match '\.sql$' -or $name -match '\.sqlite$' -or $name -match '\.py$' -or $name -match '\.ts$' -or $name -match '^Thumbs.db$' -or $name -match '^\\.DS_Store$' -or $name -match '^\.env\.local$') {
            $matches += $_.FullName
        }
    }
}

$matches = $matches | Sort-Object -Unique

if ($matches.Count -eq 0) {
    Write-Output "No candidates found for archiving."
    exit 0
}

Write-Output "Found $($matches.Count) candidate paths:";

foreach ($m in $matches) { Write-Output " - $((Resolve-Path $m).Path)" }

if (-not $Apply) {
    Write-Output "\nDRY-RUN: no files will be moved. To apply, re-run with -Apply."
    exit 0
}

# Apply: move files and git rm --cached for tracked
New-Item -ItemType Directory -Path $archive -Force | Out-Null
foreach ($m in $matches) {
    try {
        $rel = $m.Substring($root.Path.Length + 1)
    } catch {
        $rel = $m
    }
    $dest = Join-Path $archive $rel
    $destDir = Split-Path $dest -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

    Write-Output "Archiving: $rel"
    try { git ls-files --error-unmatch -- $rel > $null 2>&1; $isTracked = $true } catch { $isTracked = $false }
    if ($isTracked) {
        Write-Output "  -> tracked in git, running: git rm --cached -r -- $rel"
        try { git rm --cached -r -- $rel } catch { Write-Output "  (git rm failed or path partially untracked)" }
    }
    try {
        Move-Item -LiteralPath $m -Destination $dest -Force
    } catch {
        Write-Output "  Move failed: $_"
    }
}

Write-Output "\nArchive complete. Review $archive, then run:\n  git add .gitignore $archive\n  git commit -m 'Move unneeded files to archive'\n  git push\n"
