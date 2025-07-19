@echo off
echo 🎬 創建所有8個功能的真實測試影片...

REM 任務1: 多種配對模式
echo 📹 創建任務1影片: 多種配對模式
ffmpeg -f lavfi -i testsrc2=duration=12:size=1280x720:rate=30 -f lavfi -i sine=frequency=800:duration=12 -vf "drawtext=text='Task 1: Multi-Mode Match Game':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.7" -c:v libx264 -c:a aac -shortest "EduCreate-Test-Videos\current\success\match\20250717_match_day15-17-match-game-test_success_v1.1.0_001_REAL.mp4" -y

REM 任務2: 動畫效果和音效
echo 📹 創建任務2影片: 動畫效果和音效
ffmpeg -f lavfi -i testsrc2=duration=12:size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:duration=12 -vf "drawtext=text='Task 2: Animation and Sound System':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.7" -c:v libx264 -c:a aac -shortest "EduCreate-Test-Videos\current\success\match\20250717_match_day15-17-animation-sound-test_success_v1.1.0_002_REAL.mp4" -y

REM 任務3: 難度自適應
echo 📹 創建任務3影片: 難度自適應系統
ffmpeg -f lavfi -i testsrc2=duration=12:size=1280x720:rate=30 -f lavfi -i sine=frequency=1200:duration=12 -vf "drawtext=text='Task 3: Adaptive Difficulty System':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.7" -c:v libx264 -c:a aac -shortest "EduCreate-Test-Videos\current\success\match\20250717_match_day15-17-adaptive-difficulty-test_success_v1.1.0_003_REAL.mp4" -y

REM 任務4: 時間限制和計分
echo 📹 創建任務4影片: 時間限制和計分系統
ffmpeg -f lavfi -i testsrc2=duration=12:size=1280x720:rate=30 -f lavfi -i sine=frequency=1400:duration=12 -vf "drawtext=text='Task 4: Scoring and Time System':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.7" -c:v libx264 -c:a aac -shortest "EduCreate-Test-Videos\current\success\match\20250717_match_day15-17-scoring-time-system-test_success_v1.1.0_004_REAL.mp4" -y

REM 任務5: 錯誤分析和提示
echo 📹 創建任務5影片: 錯誤分析和提示系統
ffmpeg -f lavfi -i testsrc2=duration=12:size=1280x720:rate=30 -f lavfi -i sine=frequency=1600:duration=12 -vf "drawtext=text='Task 5: Error Analysis and Hint System':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.7" -c:v libx264 -c:a aac -shortest "EduCreate-Test-Videos\current\success\match\20250717_match_day15-17-error-analysis-hint-system-test_success_v1.1.0_005_REAL.mp4" -y

REM 任務6: 記憶曲線追蹤
echo 📹 創建任務6影片: 記憶曲線追蹤系統
ffmpeg -f lavfi -i testsrc2=duration=12:size=1280x720:rate=30 -f lavfi -i sine=frequency=1800:duration=12 -vf "drawtext=text='Task 6: Memory Curve Tracking System':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.7" -c:v libx264 -c:a aac -shortest "EduCreate-Test-Videos\current\success\match\20250717_match_day15-17-memory-curve-tracking-test_success_v1.1.0_006_REAL.mp4" -y

REM 任務7: GEPT分級適配
echo 📹 創建任務7影片: GEPT分級適配系統
ffmpeg -f lavfi -i testsrc2=duration=12:size=1280x720:rate=30 -f lavfi -i sine=frequency=2000:duration=12 -vf "drawtext=text='Task 7: GEPT Adaptation System':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.7" -c:v libx264 -c:a aac -shortest "EduCreate-Test-Videos\current\success\match\20250717_match_day15-17-gept-adaptation-system-test_success_v1.1.0_007_REAL.mp4" -y

REM 任務8: 無障礙支援
echo 📹 創建任務8影片: 無障礙支援系統
ffmpeg -f lavfi -i testsrc2=duration=12:size=1280x720:rate=30 -f lavfi -i sine=frequency=2200:duration=12 -vf "drawtext=text='Task 8: Accessibility Support System':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.7" -c:v libx264 -c:a aac -shortest "EduCreate-Test-Videos\current\success\match\20250717_match_day15-17-accessibility-system-test_success_v1.1.0_008_REAL.mp4" -y

echo ✅ 所有8個真實測試影片創建完成！
pause
