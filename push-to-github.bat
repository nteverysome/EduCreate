@echo off
echo 🚀 Pushing EduCreate project to GitHub...
echo.

echo 📝 Adding all files...
git add .

echo 📦 Committing changes...
git commit -m "🎮 Add comprehensive Wordwall clone with AI features and universal game launcher

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
- User guides and feature explanations"

echo 🌐 Pushing to GitHub...
git push origin master

echo.
echo ✅ Successfully pushed to GitHub!
echo 🔗 Repository: https://github.com/nteverysome/EduCreate
echo.
pause
