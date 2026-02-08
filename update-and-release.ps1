# ═══════════════════════════════════════════════════════════════════
#  WASI-MD V7 - Update and Release Script
#  Builds and pushes new version to Docker Hub
# ═══════════════════════════════════════════════════════════════════

param(
    [Parameter(Mandatory = $true)]
    [string]$Version,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory = $false)]
    [switch]$Beta
)

$ErrorActionPreference = "Stop"

# Configuration
$ImageName = "wasi-md-v7"
$DockerHubRepo = "mrwasi/wasi-md-v7"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 WASI-MD V7 Release Script" -ForegroundColor Cyan
Write-Host "   Version: $Version" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Validate version format
if ($Version -notmatch '^v?\d+\.\d+\.\d+$') {
    Write-Host "❌ Invalid version format!" -ForegroundColor Red
    Write-Host "   Use format: v7.3.0 or 7.3.0" -ForegroundColor Yellow
    exit 1
}

# Add 'v' prefix if not present
if ($Version -notmatch '^v') {
    $Version = "v$Version"
}

Write-Host "📋 Release Information:" -ForegroundColor Yellow
Write-Host "   Version: $Version"
Write-Host "   Image: $DockerHubRepo"
Write-Host "   Beta: $Beta"
Write-Host ""

# Step 1: Build Docker Image
if (-not $SkipBuild) {
    Write-Host "🔨 Step 1: Building Docker image..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        docker build -f Dockerfile.local `
            -t "${ImageName}:${Version}" `
            -t "${ImageName}:latest" `
            .
        
        Write-Host ""
        Write-Host "✅ Build successful!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Build failed: $_" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "⏭️  Skipping build (using existing image)" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Tag for Docker Hub
Write-Host "🏷️  Step 2: Tagging images..." -ForegroundColor Cyan

$tags = @(
    "${DockerHubRepo}:${Version}",
    "${DockerHubRepo}:latest"
)

if ($Beta) {
    $tags += "${DockerHubRepo}:beta"
    Write-Host "   Adding beta tag" -ForegroundColor Yellow
}
else {
    $tags += "${DockerHubRepo}:stable"
    Write-Host "   Adding stable tag" -ForegroundColor Yellow
}

foreach ($tag in $tags) {
    Write-Host "   Tagging: $tag"
    docker tag "${ImageName}:${Version}" $tag
}

Write-Host ""
Write-Host "✅ Tagging complete!" -ForegroundColor Green
Write-Host ""

# Step 3: Push to Docker Hub
Write-Host "📤 Step 3: Pushing to Docker Hub..." -ForegroundColor Cyan
Write-Host ""

# Check if logged in
try {
    docker info | Out-Null
}
catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    exit 1
}

Write-Host "   Pushing tags to Docker Hub..." -ForegroundColor Yellow
Write-Host ""

foreach ($tag in $tags) {
    Write-Host "   Pushing: $tag" -ForegroundColor Cyan
    try {
        docker push $tag
        Write-Host "   ✅ Pushed: $tag" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Failed to push: $tag" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Step 4: Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅ Release Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Published Images:" -ForegroundColor Cyan
foreach ($tag in $tags) {
    Write-Host "   • $tag" -ForegroundColor White
}
Write-Host ""
Write-Host "🔗 Docker Hub: https://hub.docker.com/r/$DockerHubRepo" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Update CHANGELOG.md with changes"
Write-Host "   2. Create GitHub release with tag: $Version"
Write-Host "   3. Notify users about the update"
Write-Host ""
Write-Host "🔄 Users can update with:" -ForegroundColor Yellow
Write-Host "   docker pull $($DockerHubRepo):latest"
Write-Host "   docker restart wasi-md-bot"
Write-Host ""


# Optional: Create git tag
$createGitTag = Read-Host "Create git tag $Version? (y/n)"
if ($createGitTag -eq 'y') {
    Write-Host ""
    Write-Host "🏷️  Creating git tag..." -ForegroundColor Cyan
    
    git tag -a $Version -m "Release $Version"
    
    $pushTag = Read-Host "Push tag to remote? (y/n)"
    if ($pushTag -eq 'y') {
        git push origin $Version
        Write-Host "✅ Git tag pushed!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
Write-Host ""
