$rootPath = "c:\Users\PC\AppData\Roaming\npm\node_modules\@mariozechner\pi-coding-agent\hodeuscli-workspace"
$fileTypes = @("*.ts", "*.tsx", "*.js", "*.css", "*.html", "*.json", "*.md", "*.yml", "*.yaml")

$replacements = @{
    "@mariozechner/pi-" = "@games-coder/hodeuscli-"
    "@mariozechner/hodeuscli-" = "@games-coder/hodeuscli-"
    "badlogic/pi-mono" = "games-coder/hodeuscli"
    "mariozechner/pi-coding-agent" = "games-coder/hodeuscli"
    "pi-ai" = "hodeuscli-ai"
    "pi-tui" = "hodeuscli-tui"
    "pi-agent" = "hodeuscli-agent"
    "pi-web-ui" = "hodeuscli-web-ui"
    "pi-pods" = "hodeuscli-pods"
    "pi-mom" = "hodeuscli-mom"
    "piConfig" = "hodeuscliConfig"
    ".pi" = ".hodeuscli"
}

$wordReplacements = @{
    " Pi " = " Hodeuscli "
    "(Pi)" = "(Hodeuscli)"
    "Pi Branding" = "Hodeuscli Branding"
    "Pi Reference" = "Hodeuscli Reference"
    "Pi's" = "Hodeuscli's"
}

foreach ($fileType in $fileTypes) {
    # Narrowing search to packages and root files only
    Get-ChildItem -Path $rootPath -Filter $fileType -Recurse | Where-Object { 
        $_.FullName -notmatch "node_modules" -and 
        $_.FullName -notmatch "\\dist\\" -and 
        $_.FullName -notmatch "\\\.git\\" -and 
        $_.FullName -notmatch "\\\.antigravity\\" -and
        ($_.FullName -match "\\packages\\" -or $_.DirectoryName -eq $rootPath)
    } | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        if ($null -eq $content) { return }
        $changed = $false
        
        foreach ($key in $replacements.Keys) {
            if ($content.Contains($key)) {
                $content = $content.Replace($key, $replacements[$key])
                $changed = $true
            }
        }

        foreach ($key in $wordReplacements.Keys) {
            if ($content.Contains($key)) {
                $content = $content.Replace($key, $wordReplacements[$key])
                $changed = $true
            }
        }

        if ($changed) {
            Set-Content -Path $_.FullName -Value $content -NoNewline
            Write-Host "Updated: $($_.FullName)"
        }
    }
}
