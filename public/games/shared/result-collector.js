/**
 * EduCreate 遊戲結果收集器
 * 用於收集和提交遊戲結果到後端 API
 */

class ResultCollector {
    constructor() {
        this.apiBaseUrl = window.location.origin;
        this.assignmentId = null;
        this.activityId = null;
        this.studentName = null;
        this.gameStartTime = null;
        this.gameData = {};
        
        // 從 URL 參數中提取信息
        this.extractUrlParameters();
        
        console.log('🎯 ResultCollector 初始化:', {
            assignmentId: this.assignmentId,
            activityId: this.activityId,
            studentName: this.studentName
        });
    }
    
    /**
     * 從 URL 參數中提取課業分配信息
     */
    extractUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        this.assignmentId = urlParams.get('assignmentId');
        this.activityId = urlParams.get('activityId');
        this.studentName = urlParams.get('studentName');
        
        // 如果是課業分配模式，記錄遊戲開始時間
        if (this.assignmentId && this.activityId && this.studentName) {
            this.gameStartTime = Date.now();
            console.log('📊 課業分配模式啟動，開始記錄遊戲數據');
        }
    }
    
    /**
     * 檢查是否為課業分配模式
     */
    isAssignmentMode() {
        return !!(this.assignmentId && this.activityId && this.studentName);
    }
    
    /**
     * 記錄遊戲事件
     */
    recordGameEvent(eventType, eventData) {
        if (!this.isAssignmentMode()) return;
        
        if (!this.gameData.events) {
            this.gameData.events = [];
        }
        
        this.gameData.events.push({
            type: eventType,
            data: eventData,
            timestamp: Date.now() - this.gameStartTime
        });
        
        console.log('📝 記錄遊戲事件:', eventType, eventData);
    }
    
    /**
     * 提交遊戲結果
     */
    async submitGameResult(gameResult) {
        if (!this.isAssignmentMode()) {
            console.log('⚠️ 非課業分配模式，跳過結果提交');
            return { success: false, reason: 'not_assignment_mode' };
        }
        
        try {
            const timeSpent = Math.floor((Date.now() - this.gameStartTime) / 1000);
            
            const resultData = {
                assignmentId: this.assignmentId,
                activityId: this.activityId,
                studentName: this.studentName,
                score: gameResult.score || 0,
                timeSpent: timeSpent,
                correctAnswers: gameResult.correctAnswers || 0,
                totalQuestions: gameResult.totalQuestions || 0,
                gameData: {
                    ...this.gameData,
                    finalResult: gameResult,
                    gameEndTime: Date.now(),
                    totalTimeSpent: timeSpent
                }
            };
            
            console.log('📤 提交遊戲結果:', resultData);
            
            const response = await fetch(`${this.apiBaseUrl}/api/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resultData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ 結果提交成功:', result);
                
                // 顯示成功消息
                this.showResultSubmissionSuccess();
                
                return { success: true, data: result };
            } else {
                const error = await response.json();
                console.error('❌ 結果提交失敗:', error);
                return { success: false, error: error };
            }
        } catch (error) {
            console.error('❌ 結果提交錯誤:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 顯示結果提交成功的消息
     */
    showResultSubmissionSuccess() {
        // 創建成功提示
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        successMessage.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>✅</span>
                <span>遊戲結果已成功記錄！</span>
            </div>
        `;
        
        // 添加動畫樣式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(successMessage);
        
        // 3秒後自動移除
        setTimeout(() => {
            successMessage.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.parentNode.removeChild(successMessage);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * 獲取遊戲統計信息
     */
    getGameStats() {
        return {
            assignmentId: this.assignmentId,
            activityId: this.activityId,
            studentName: this.studentName,
            gameStartTime: this.gameStartTime,
            currentTime: Date.now(),
            timeElapsed: this.gameStartTime ? Date.now() - this.gameStartTime : 0,
            eventsRecorded: this.gameData.events ? this.gameData.events.length : 0
        };
    }
}

// 創建全局實例
window.EduCreateResultCollector = new ResultCollector();

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultCollector;
}

console.log('🎮 EduCreate ResultCollector 已載入');
