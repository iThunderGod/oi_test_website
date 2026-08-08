<#
.SYNOPSIS
  Adds exactly 300 OJ questions through ten verified Codex batches.

.DESCRIPTION
  This script runs ten separate Codex tasks. Each task adds one actual batch of
  30 questions to the repository. The script verifies that each batch increases
  the imported problem catalog by exactly 30 and independently runs the build.
  It stops on the first failure.

  Progress is stored in .data\bulk-question-generation\progress.json. If the
  process ends between successfully completed batches, rerun this script to
  continue. If it ends while a batch is active, inspect the repository and the
  recorded log before clearing activeBatch in progress.json; this avoids adding
  a duplicate batch accidentally.

.EXAMPLE
  .\bulk-add-300-questions.ps1
#>
[CmdletBinding()]
param(
  [ValidateSet(10)]
  [int]$Batches = 10,

  [ValidateSet(30)]
  [int]$QuestionsPerBatch = 30,

  [string]$Model = '',

  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$logDirectory = Join-Path $projectRoot '.data\bulk-question-generation'
$statePath = Join-Path $logDirectory 'progress.json'
$codexLauncher = Join-Path $env:APPDATA 'npm\codex.cmd'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

function Get-ProblemCount {
  $countText = & node --input-type=module -e "import { problems } from './src/data/problemCatalog.js'; console.log(problems.length)" 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to read the problem catalog: $countText"
  }

  $count = 0
  if (-not [int]::TryParse(($countText | Select-Object -Last 1).ToString().Trim(), [ref]$count)) {
    throw "Problem catalog count was not an integer: $countText"
  }
  return $count
}

function Save-Progress {
  param([object]$State)
  $State | ConvertTo-Json | Set-Content -Path $statePath -Encoding utf8
}

function Invoke-CodexBatch {
  param(
    [int]$BatchNumber,
    [int]$StartCount,
    [string]$ResultPath
  )

  $task = @"
Perform exactly one real "add 30 questions" OJ-bank batch. This is batch $BatchNumber of $Batches in an automated run. The catalog has $StartCount problems at the start. Make the actual repository changes; do not merely return a list or advice.

Read and obey AGENTS.md fully before editing. Inspect the existing catalog, batch manifest, IDs, and repository architecture. Add exactly 30 net-new problems. Do not delete, replace, or weaken any existing problem, and preserve unrelated user changes.

This batch must cover every series S01 through S11. Use the manifest's current rotating allocation of 2 or 3 problems per series (30 total). Do not repeat a core algorithm model within the batch, and avoid models already used in historical batches. Every problem must have a unique ID; an independent, complete Chinese statement (background, rules, input, output, constraints, sample plus explanation, hint, target complexity); at least two algorithm tags; a justified difficulty; an independent runnable reference solution; and exactly three scored tests named Typical structure, Boundary conditions, and Comprehensive trap, with scores 30, 30, and 40.

Integrate the problems, samples, tests, and local judge service following the project's established architecture. Update all required catalog imports/aggregation, judge/problemTests.mjs, judge/questionBankManifest.mjs with the new batch record, and README. Smoke-test at least one easy, one medium, and one hard problem in this batch with its C++17 reference solution and confirm AC. Run npm run build. Do not leave .data/submissions.json created by automated verification as a user submission record.

Before finishing, verify that the catalog has grown by exactly 30 relative to $StartCount, the manifest record is complete, and the build succeeds. In the final response, state the new batch ID, all 30 problem IDs, the series allocation, and validation performed.
"@

  # Send the multi-line task through stdin. Passing it as a native PowerShell
  # argument can split it on whitespace when the Codex .ps1 wrapper is used.
  $arguments = @('exec', '--sandbox', 'workspace-write', '-C', $projectRoot, '--output-last-message', $ResultPath)
  if ($Model) { $arguments += @('--model', $Model) }
  $arguments += '-'

  $task | & $codexLauncher @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Codex batch $BatchNumber exited with code $LASTEXITCODE."
  }
}

if (-not (Test-Path $codexLauncher)) {
  throw "Codex CLI launcher was not found: $codexLauncher"
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js was not found. It is required to inspect and build the project.'
}

$currentCount = Get-ProblemCount
if (Test-Path $statePath) {
  $state = Get-Content -Path $statePath -Raw | ConvertFrom-Json
  if ($state.batches -ne $Batches -or $state.questionsPerBatch -ne $QuestionsPerBatch) {
    throw "The saved progress target does not match the current parameters: $statePath"
  }
  if ($null -ne $state.activeBatch) {
    throw "Batch $($state.activeBatch) was interrupted while active. Inspect its changes and log, then update $statePath before retrying."
  }
  $initialCount = [int]$state.initialCount
  $completedBatches = [int]$state.completedBatches
  if ($completedBatches -lt 0 -or $completedBatches -gt $Batches) {
    throw "completedBatches in $statePath is invalid."
  }
  $expectedCurrentCount = $initialCount + ($completedBatches * $QuestionsPerBatch)
  if ($currentCount -ne $expectedCurrentCount) {
    throw "The catalog has $currentCount problems, but saved progress expects $expectedCurrentCount. Inspect the repository and $statePath before retrying."
  }
  Write-Host "Resuming: $completedBatches of $Batches batches complete; current catalog: $currentCount." -ForegroundColor Cyan
}
else {
  $initialCount = $currentCount
  $completedBatches = 0
  $state = [PSCustomObject]@{
    initialCount = $initialCount
    batches = $Batches
    questionsPerBatch = $QuestionsPerBatch
    completedBatches = 0
    activeBatch = $null
    createdAt = (Get-Date).ToString('o')
    updatedAt = (Get-Date).ToString('o')
  }
  Save-Progress $state
  Write-Host "Starting bulk generation: catalog has $initialCount problems; target increase: $($Batches * $QuestionsPerBatch)." -ForegroundColor Cyan
}

for ($batch = $completedBatches + 1; $batch -le $Batches; $batch++) {
  $beforeCount = Get-ProblemCount
  $timeTag = Get-Date -Format 'yyyyMMdd-HHmmss'
  $resultPath = Join-Path $logDirectory ("batch-{0:D2}-{1}.md" -f $batch, $timeTag)

  Write-Host "`n===== Batch $batch of ${Batches}: starting from $beforeCount problems =====" -ForegroundColor Yellow
  try {
    $state.activeBatch = $batch
    $state.updatedAt = (Get-Date).ToString('o')
    Save-Progress $state
    Invoke-CodexBatch -BatchNumber $batch -StartCount $beforeCount -ResultPath $resultPath

    $afterCount = Get-ProblemCount
    $increase = $afterCount - $beforeCount
    if ($increase -ne $QuestionsPerBatch) {
      throw "Batch $batch changed the catalog by $increase problems; expected exactly $QuestionsPerBatch."
    }

    if (-not $SkipBuild) {
      Write-Host 'Running independent npm run build validation...' -ForegroundColor DarkCyan
      & npm run build
      if ($LASTEXITCODE -ne 0) {
        throw "npm run build failed after batch $batch."
      }
    }

    $state.completedBatches = $batch
    $state.activeBatch = $null
    $state.updatedAt = (Get-Date).ToString('o')
    Save-Progress $state
    Write-Host "Batch $batch complete: $beforeCount -> $afterCount (+$increase). Log: $resultPath" -ForegroundColor Green
  }
  catch {
    Write-Error "Bulk generation stopped at batch ${batch}: $($_.Exception.Message)"
    Write-Host "Fix the issue, then rerun this script. Progress and logs: $logDirectory" -ForegroundColor Yellow
    exit 1
  }
}

$finalCount = Get-ProblemCount
$totalIncrease = $finalCount - $initialCount
if ($totalIncrease -ne ($Batches * $QuestionsPerBatch)) {
  throw "Final increase was $totalIncrease problems; expected $($Batches * $QuestionsPerBatch)."
}

$state.completedAt = (Get-Date).ToString('o')
$state.updatedAt = $state.completedAt
Save-Progress $state
Write-Host "`nFinished: $initialCount -> $finalCount. Added $totalIncrease problems." -ForegroundColor Green
