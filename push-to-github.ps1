# EduCreate GitHub Push Script
Write-Host "🚀 Pushing EduCreate project to GitHub..." -ForegroundColor Green
Write-Host ""

try {
    Write-Host "📝 Adding all files..." -ForegroundColor Yellow
    git add .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to add files"
    }

    Write-Host "📦 Committing changes..." -ForegroundColor Yellow
    $commitMessage = @"
🎮 Add comprehensive Wordwall clone with AI features and universal game launcher

✨ Features:
- AI-enhanced image analysis and vocabulary extraction
- Unified game launcher supporting all word types in all games
- Universal content management system for cross-platform compatibility
- Multiple game types: quiz, matching, wheel, flashcards, airplane game
- Video processing capabilities with MCP integration
- Responsive design with modern UI/UX

🔧 Technical:
- Vue.js 3 and React 18 frontend
- Node.js backend with Express
- AI integration with OpenAI and computer vision
- MCP (Model Context Protocol) for AI framework
- Comprehensive documentation and guides

📚 Documentation:
- Complete setup guides and API documentation
- Business strategy and commercialization plans
- Technical architecture and development reports
- User guides and feature explanations
"@

    git commit -m $commitMessage
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ℹ️ No changes to commit or commit failed" -ForegroundColor Blue
    }

    Write-Host "🌐 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin master
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push to GitHub"
    }

    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🔗 Repository: https://github.com/nteverysome/EduCreate" -ForegroundColor Cyan
    Write-Host ""
    
    # Show recent commits
    Write-Host "📋 Recent commits:" -ForegroundColor Yellow
    git log --oneline -5
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your Git configuration and network connection." -ForegroundColor Red
    Write-Host ""
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
