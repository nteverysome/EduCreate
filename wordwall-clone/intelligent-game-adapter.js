/**
 * 智能遊戲適配引擎
 * Multi-Agent AI/ML Intelligence Agent 生成
 * 基於詞彙特徵自動推薦和生成最適合的遊戲配置
 */

class IntelligentGameAdapter {
    constructor() {
        this.gameTemplates = this.initializeGameTemplates();
        this.adaptationRules = this.initializeAdaptationRules();
        this.learningPatterns = new Map();
        this.performanceCache = new Map();
    }

    // 初始化遊戲模板配置
    initializeGameTemplates() {
        return {
            quiz: {
                name: "選擇題遊戲",
                description: "多選一答題遊戲，測試詞彙理解",
                minWords: 3,
                maxWords: 100,
                optimalWords: 15,
                difficulty: {
                    beginner: { timePerQuestion: 15, options: 3 },
                    intermediate: { timePerQuestion: 12, options: 4 },
                    advanced: { timePerQuestion: 10, options: 4 }
                },
                suitabilityFactors: {
                    vocabularyCount: 0.3,
                    difficultyVariance: 0.2,
                    categoryDiversity: 0.2,
                    learningObjective: 0.3
                }
            },
            match: {
                name: "配對遊戲",
                description: "拖拽配對英文和中文",
                minWords: 4,
                maxWords: 20,
                optimalWords: 8,
                requiresEvenCount: true,
                difficulty: {
                    beginner: { timeLimit: 180, showHints: true },
                    intermediate: { timeLimit: 120, showHints: false },
                    advanced: { timeLimit: 90, showHints: false }
                },
                suitabilityFactors: {
                    vocabularyCount: 0.4,
                    visualLearning: 0.3,
                    motorSkills: 0.3
                }
            },
            cards: {
                name: "閃卡遊戲",
                description: "翻轉卡片學習詞彙",
                minWords: 1,
                maxWords: 200,
                optimalWords: 25,
                difficulty: {
                    beginner: { autoFlip: true, showPronunciation: true },
                    intermediate: { autoFlip: false, showPronunciation: true },
                    advanced: { autoFlip: false, showPronunciation: false }
                },
                suitabilityFactors: {
                    vocabularyCount: 0.2,
                    memoryTraining: 0.4,
                    selfPaced: 0.4
                }
            },
            airplane: {
                name: "飛機遊戲",
                description: "控制飛機選擇正確答案",
                minWords: 5,
                maxWords: 50,
                optimalWords: 20,
                difficulty: {
                    beginner: { speed: 1, lives: 5, timeLimit: 300 },
                    intermediate: { speed: 2, lives: 3, timeLimit: 240 },
                    advanced: { speed: 3, lives: 2, timeLimit: 180 }
                },
                suitabilityFactors: {
                    engagement: 0.4,
                    reactionTime: 0.3,
                    gamification: 0.3
                }
            },
            wheel: {
                name: "轉盤遊戲",
                description: "轉動轉盤隨機選擇詞彙",
                minWords: 6,
                maxWords: 24,
                optimalWords: 12,
                difficulty: {
                    beginner: { spinSpeed: 'slow', showAnswer: true },
                    intermediate: { spinSpeed: 'medium', showAnswer: false },
                    advanced: { spinSpeed: 'fast', showAnswer: false }
                },
                suitabilityFactors: {
                    randomness: 0.3,
                    excitement: 0.4,
                    groupActivity: 0.3
                }
            }
        };
    }

    // 初始化適配規則
    initializeAdaptationRules() {
        return {
            vocabularyCount: {
                small: { range: [1, 10], bonus: { cards: 0.2, quiz: -0.1 } },
                medium: { range: [11, 30], bonus: { match: 0.2, airplane: 0.1 } },
                large: { range: [31, 100], bonus: { quiz: 0.3, cards: 0.1 } }
            },
            difficultyLevel: {
                beginner: { bonus: { match: 0.2, cards: 0.1 }, penalty: { airplane: -0.1 } },
                intermediate: { bonus: { quiz: 0.1, airplane: 0.1 } },
                advanced: { bonus: { airplane: 0.2, quiz: 0.1 }, penalty: { match: -0.1 } }
            },
            targetAudience: {
                elementary: { bonus: { match: 0.3, cards: 0.2 }, penalty: { airplane: -0.2 } },
                middle: { bonus: { quiz: 0.2, airplane: 0.1 } },
                high: { bonus: { airplane: 0.2, quiz: 0.2 } },
                adult: { bonus: { quiz: 0.1, cards: 0.1 } }
            }
        };
    }

    // 分析詞彙特徵
    analyzeVocabularyFeatures(vocabulary) {
        const features = {
            count: vocabulary.length,
            difficultyDistribution: this.calculateDifficultyDistribution(vocabulary),
            categoryDistribution: this.calculateCategoryDistribution(vocabulary),
            lengthDistribution: this.calculateLengthDistribution(vocabulary),
            complexityScore: this.calculateComplexityScore(vocabulary),
            diversityIndex: this.calculateDiversityIndex(vocabulary),
            learningLoad: this.calculateLearningLoad(vocabulary)
        };

        console.log("📊 詞彙特徵分析:", features);
        return features;
    }

    // 計算難度分佈
    calculateDifficultyDistribution(vocabulary) {
        const distribution = { beginner: 0, intermediate: 0, advanced: 0 };
        vocabulary.forEach(word => {
            distribution[word.difficulty || 'beginner']++;
        });

        const total = vocabulary.length;
        return {
            beginner: distribution.beginner / total,
            intermediate: distribution.intermediate / total,
            advanced: distribution.advanced / total,
            variance: this.calculateVariance(Object.values(distribution))
        };
    }

    // 計算類別分佈
    calculateCategoryDistribution(vocabulary) {
        const categories = {};
        vocabulary.forEach(word => {
            const category = word.category || 'uncategorized';
            categories[category] = (categories[category] || 0) + 1;
        });

        const categoryCount = Object.keys(categories).length;
        const maxCategorySize = Math.max(...Object.values(categories));
        const minCategorySize = Math.min(...Object.values(categories));

        return {
            categories,
            categoryCount,
            diversity: categoryCount / vocabulary.length,
            balance: 1 - (maxCategorySize - minCategorySize) / vocabulary.length
        };
    }

    // 計算長度分佈
    calculateLengthDistribution(vocabulary) {
        const englishLengths = vocabulary.map(word => word.english?.length || 0);
        const chineseLengths = vocabulary.map(word => word.chinese?.length || 0);

        return {
            english: {
                average: this.calculateAverage(englishLengths),
                variance: this.calculateVariance(englishLengths),
                range: [Math.min(...englishLengths), Math.max(...englishLengths)]
            },
            chinese: {
                average: this.calculateAverage(chineseLengths),
                variance: this.calculateVariance(chineseLengths),
                range: [Math.min(...chineseLengths), Math.max(...chineseLengths)]
            }
        };
    }

    // 計算複雜度評分
    calculateComplexityScore(vocabulary) {
        let totalComplexity = 0;
        
        vocabulary.forEach(word => {
            let wordComplexity = 0;
            
            // 基於長度的複雜度
            wordComplexity += (word.english?.length || 0) * 0.1;
            wordComplexity += (word.chinese?.length || 0) * 0.15;
            
            // 基於難度的複雜度
            const difficultyScores = { beginner: 1, intermediate: 2, advanced: 3 };
            wordComplexity += difficultyScores[word.difficulty || 'beginner'];
            
            // 基於發音複雜度
            if (word.pronunciation && word.pronunciation.length > 10) {
                wordComplexity += 0.5;
            }
            
            totalComplexity += wordComplexity;
        });

        return totalComplexity / vocabulary.length;
    }

    // 計算多樣性指數
    calculateDiversityIndex(vocabulary) {
        const categories = new Set(vocabulary.map(word => word.category || 'uncategorized'));
        const difficulties = new Set(vocabulary.map(word => word.difficulty || 'beginner'));
        
        return {
            categoryDiversity: categories.size / vocabulary.length,
            difficultyDiversity: difficulties.size / 3, // 最多3個難度級別
            overallDiversity: (categories.size + difficulties.size) / (vocabulary.length + 3)
        };
    }

    // 計算學習負荷
    calculateLearningLoad(vocabulary) {
        const baseLoad = vocabulary.length * 0.1;
        const complexityLoad = this.calculateComplexityScore(vocabulary) * 0.2;
        const diversityLoad = this.calculateDiversityIndex(vocabulary).overallDiversity * 0.1;
        
        return Math.min(baseLoad + complexityLoad + diversityLoad, 10); // 最大值為10
    }

    // 智能遊戲推薦
    recommendGames(vocabulary, userPreferences = {}, learningObjectives = []) {
        console.log("🤖 開始智能遊戲推薦分析...");
        
        const features = this.analyzeVocabularyFeatures(vocabulary);
        const recommendations = [];

        // 為每種遊戲類型計算適配性評分
        Object.entries(this.gameTemplates).forEach(([gameType, template]) => {
            const suitabilityScore = this.calculateSuitabilityScore(
                gameType, 
                template, 
                features, 
                userPreferences, 
                learningObjectives
            );

            if (suitabilityScore > 0.3) { // 只推薦評分超過0.3的遊戲
                recommendations.push({
                    gameType,
                    name: template.name,
                    description: template.description,
                    suitabilityScore,
                    confidence: this.calculateConfidence(suitabilityScore, features),
                    reasons: this.generateRecommendationReasons(gameType, template, features),
                    optimalConfig: this.generateOptimalConfig(gameType, template, features),
                    estimatedDuration: this.estimateDuration(gameType, template, features),
                    difficultyAdjustment: this.suggestDifficultyAdjustment(template, features)
                });
            }
        });

        // 按適配性評分排序
        recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

        console.log("✅ 遊戲推薦完成:", recommendations);
        return recommendations;
    }

    // 計算適配性評分
    calculateSuitabilityScore(gameType, template, features, userPreferences, learningObjectives) {
        let score = 0.5; // 基礎分數

        // 詞彙數量適配性
        const countScore = this.calculateCountSuitability(template, features.count);
        score += countScore * 0.3;

        // 難度適配性
        const difficultyScore = this.calculateDifficultySuitability(template, features.difficultyDistribution);
        score += difficultyScore * 0.2;

        // 複雜度適配性
        const complexityScore = this.calculateComplexitySuitability(gameType, features.complexityScore);
        score += complexityScore * 0.2;

        // 學習目標適配性
        const objectiveScore = this.calculateObjectiveSuitability(gameType, learningObjectives);
        score += objectiveScore * 0.2;

        // 用戶偏好適配性
        const preferenceScore = this.calculatePreferenceSuitability(gameType, userPreferences);
        score += preferenceScore * 0.1;

        return Math.max(0, Math.min(1, score)); // 確保分數在0-1之間
    }

    // 計算詞彙數量適配性
    calculateCountSuitability(template, count) {
        if (count < template.minWords || count > template.maxWords) {
            return -0.5; // 不適合
        }

        const optimalDistance = Math.abs(count - template.optimalWords);
        const maxDistance = Math.max(
            template.optimalWords - template.minWords,
            template.maxWords - template.optimalWords
        );

        return 1 - (optimalDistance / maxDistance);
    }

    // 計算難度適配性
    calculateDifficultySuitability(template, difficultyDistribution) {
        // 如果難度分佈比較均勻，適合需要難度調整的遊戲
        const variance = difficultyDistribution.variance;
        
        if (variance > 0.3) {
            // 高方差，適合自適應難度的遊戲
            return template.name.includes('飛機') || template.name.includes('選擇題') ? 0.3 : 0.1;
        } else {
            // 低方差，適合固定難度的遊戲
            return template.name.includes('配對') || template.name.includes('閃卡') ? 0.3 : 0.1;
        }
    }

    // 計算複雜度適配性
    calculateComplexitySuitability(gameType, complexityScore) {
        const complexityPreferences = {
            quiz: { optimal: 3, tolerance: 2 },
            match: { optimal: 2, tolerance: 1.5 },
            cards: { optimal: 2.5, tolerance: 2 },
            airplane: { optimal: 2, tolerance: 1 },
            wheel: { optimal: 1.5, tolerance: 1 }
        };

        const pref = complexityPreferences[gameType];
        if (!pref) return 0;

        const distance = Math.abs(complexityScore - pref.optimal);
        return Math.max(0, 1 - (distance / pref.tolerance));
    }

    // 計算學習目標適配性
    calculateObjectiveSuitability(gameType, objectives) {
        const gameObjectiveMapping = {
            quiz: ['assessment', 'testing', 'evaluation'],
            match: ['recognition', 'association', 'visual_learning'],
            cards: ['memorization', 'review', 'self_paced'],
            airplane: ['engagement', 'reaction_time', 'gamification'],
            wheel: ['random_practice', 'group_activity', 'excitement']
        };

        const gameObjectives = gameObjectiveMapping[gameType] || [];
        const matchCount = objectives.filter(obj => gameObjectives.includes(obj)).length;
        
        return objectives.length > 0 ? matchCount / objectives.length : 0.5;
    }

    // 計算用戶偏好適配性
    calculatePreferenceSuitability(gameType, preferences) {
        if (!preferences || Object.keys(preferences).length === 0) {
            return 0.5; // 中性分數
        }

        let score = 0.5;

        // 遊戲類型偏好
        if (preferences.gameTypes && preferences.gameTypes.includes(gameType)) {
            score += 0.3;
        }

        // 互動方式偏好
        if (preferences.interactionStyle) {
            const interactionMapping = {
                visual: ['match', 'cards'],
                kinesthetic: ['airplane', 'wheel'],
                analytical: ['quiz']
            };

            if (interactionMapping[preferences.interactionStyle]?.includes(gameType)) {
                score += 0.2;
            }
        }

        return Math.min(1, score);
    }

    // 生成推薦理由
    generateRecommendationReasons(gameType, template, features) {
        const reasons = [];

        // 基於詞彙數量的理由
        if (features.count >= template.minWords && features.count <= template.maxWords) {
            if (Math.abs(features.count - template.optimalWords) <= 5) {
                reasons.push(`詞彙數量 (${features.count}) 非常適合${template.name}`);
            } else {
                reasons.push(`詞彙數量 (${features.count}) 適合${template.name}`);
            }
        }

        // 基於複雜度的理由
        if (features.complexityScore < 2.5 && ['match', 'cards'].includes(gameType)) {
            reasons.push("詞彙複雜度適中，適合視覺化學習");
        } else if (features.complexityScore > 3 && gameType === 'quiz') {
            reasons.push("詞彙複雜度較高，適合深度測試");
        }

        // 基於多樣性的理由
        if (features.diversityIndex.categoryDiversity > 0.3) {
            reasons.push("詞彙類別豐富，增加學習趣味性");
        }

        return reasons;
    }

    // 生成最優配置
    generateOptimalConfig(gameType, template, features) {
        const baseConfig = template.difficulty.intermediate; // 默認中等難度
        const config = { ...baseConfig };

        // 根據複雜度調整配置
        if (features.complexityScore > 3) {
            // 高複雜度，增加時間或降低難度
            if (config.timePerQuestion) config.timePerQuestion += 3;
            if (config.timeLimit) config.timeLimit += 30;
            if (config.showHints !== undefined) config.showHints = true;
        } else if (features.complexityScore < 2) {
            // 低複雜度，減少時間或增加難度
            if (config.timePerQuestion) config.timePerQuestion -= 2;
            if (config.timeLimit) config.timeLimit -= 20;
            if (config.showHints !== undefined) config.showHints = false;
        }

        // 根據詞彙數量調整
        if (features.count > template.optimalWords) {
            config.questionsCount = Math.min(features.count, template.optimalWords + 5);
        } else {
            config.questionsCount = features.count;
        }

        return config;
    }

    // 估算遊戲時長
    estimateDuration(gameType, template, features) {
        const baseDurations = {
            quiz: 2, // 每題2分鐘
            match: 1.5, // 每對1.5分鐘
            cards: 0.5, // 每卡0.5分鐘
            airplane: 0.3, // 每詞0.3分鐘
            wheel: 0.2 // 每詞0.2分鐘
        };

        const baseTime = baseDurations[gameType] || 1;
        const wordCount = Math.min(features.count, template.optimalWords);
        const complexityMultiplier = 1 + (features.complexityScore - 2) * 0.2;

        return Math.round(wordCount * baseTime * complexityMultiplier);
    }

    // 建議難度調整
    suggestDifficultyAdjustment(template, features) {
        const suggestions = [];

        if (features.difficultyDistribution.beginner > 0.7) {
            suggestions.push("建議使用初級設置，增加提示和更多時間");
        } else if (features.difficultyDistribution.advanced > 0.5) {
            suggestions.push("建議使用高級設置，減少提示和時間限制");
        }

        if (features.complexityScore > 4) {
            suggestions.push("詞彙複雜度較高，建議分批學習");
        }

        return suggestions;
    }

    // 計算推薦信心度
    calculateConfidence(suitabilityScore, features) {
        let confidence = suitabilityScore;

        // 基於數據完整性調整信心度
        if (features.count < 5) {
            confidence *= 0.8; // 詞彙太少，降低信心度
        }

        if (features.diversityIndex.overallDiversity < 0.2) {
            confidence *= 0.9; // 多樣性不足，略微降低信心度
        }

        return Math.round(confidence * 100); // 轉換為百分比
    }

    // 工具函數
    calculateAverage(numbers) {
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    }

    calculateVariance(numbers) {
        const avg = this.calculateAverage(numbers);
        const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
        return this.calculateAverage(squaredDiffs);
    }

    // 批量生成遊戲配置
    async generateMultipleGameConfigs(vocabulary, gameTypes = null) {
        console.log("🎮 開始批量生成遊戲配置...");

        const recommendations = this.recommendGames(vocabulary);
        const targetGameTypes = gameTypes || recommendations.slice(0, 3).map(r => r.gameType);

        const configs = {};
        for (const gameType of targetGameTypes) {
            const recommendation = recommendations.find(r => r.gameType === gameType);
            if (recommendation) {
                configs[gameType] = {
                    ...recommendation,
                    generatedAt: new Date().toISOString(),
                    vocabularySnapshot: vocabulary.map(word => ({
                        english: word.english,
                        chinese: word.chinese,
                        difficulty: word.difficulty || 'beginner'
                    }))
                };
            }
        }

        console.log("✅ 批量配置生成完成:", Object.keys(configs));
        return configs;
    }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntelligentGameAdapter;
} else {
    window.IntelligentGameAdapter = IntelligentGameAdapter;
}

console.log("🧠 智能遊戲適配引擎已加載完成！");
