# Builds ./_publish/public_html and ./_publish/public_html.zip
# The Dashboard project's wwwroot becomes the site root; every other project becomes a subfolder.
# Upload the CONTENTS of public_html to your host's public_html (File Manager or FTP).
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$pub = Join-Path $root "_publish"
$out = Join-Path $pub "public_html"
if (Test-Path $pub) { Remove-Item $pub -Recurse -Force }
New-Item $out -ItemType Directory | Out-Null

foreach ($d in Get-ChildItem $root -Directory) {
    $www = Join-Path $d.FullName "wwwroot"
    if (-not (Test-Path $www)) { continue }
    $name = ($d.Name -split " ")[0]
    if ($name -eq "Dashboard") {
        Copy-Item (Join-Path $www "*") $out -Recurse
        Write-Host "Added dashboard (site root)"
    } else {
        Copy-Item $www (Join-Path $out $name) -Recurse
        Write-Host "Added $name"
    }
}

Compress-Archive -Path (Join-Path $out "*") -DestinationPath (Join-Path $pub "public_html.zip") -Force
Write-Host "Done: $out"
Write-Host "Zip:  $(Join-Path $pub 'public_html.zip')"