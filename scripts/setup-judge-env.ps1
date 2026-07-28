param(
  [string]$Version = "2.9.0",
  [string]$ArchivePath = ""
)

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$toolsDir = Join-Path $projectRoot "tools"
$downloadsDir = Join-Path $toolsDir "downloads"
$targetDir = Join-Path $toolsDir "w64devkit"
$gpp = Join-Path $targetDir "bin\g++.exe"
$archiveName = "w64devkit-x64-$Version.7z.exe"
$archive = if ($ArchivePath) { $ArchivePath } else { Join-Path $downloadsDir $archiveName }
$url = "https://github.com/skeeto/w64devkit/releases/download/v$Version/$archiveName"
$sevenZip = "C:\Program Files\7-Zip\7z.exe"

New-Item -ItemType Directory -Force -Path $downloadsDir | Out-Null

if (Test-Path -LiteralPath $gpp) {
  & $gpp --version
  exit 0
}

if (-not (Test-Path -LiteralPath $archive)) {
  Write-Host "Downloading $url"
  curl.exe -k --ssl-no-revoke -L --fail --retry 3 --connect-timeout 30 -o $archive $url
}

if (-not (Test-Path -LiteralPath $sevenZip)) {
  throw "7-Zip not found at $sevenZip"
}

$extractRoot = Join-Path $toolsDir "_extract-w64devkit"
if (Test-Path -LiteralPath $extractRoot) {
  Remove-Item -LiteralPath $extractRoot -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $extractRoot | Out-Null

& $sevenZip x $archive "-o$extractRoot" -y
if ($LASTEXITCODE -ne 0) {
  throw "7-Zip extraction failed."
}

$extracted = Get-ChildItem -LiteralPath $extractRoot -Directory -Recurse |
  Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName "bin\g++.exe") } |
  Select-Object -First 1

if (-not $extracted) {
  throw "Could not find bin\g++.exe in extracted archive."
}

if (Test-Path -LiteralPath $targetDir) {
  Remove-Item -LiteralPath $targetDir -Recurse -Force
}
Move-Item -LiteralPath $extracted.FullName -Destination $targetDir
Remove-Item -LiteralPath $extractRoot -Recurse -Force

& $gpp --version
