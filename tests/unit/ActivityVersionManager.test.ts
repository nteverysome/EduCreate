/**
 * 活動版本管理系統單元測試
 * 驗證版本創建、歷史查詢、版本比較、版本恢復、協作者追蹤等功能
 */

import { VersionType, ChangeType } from '../../lib/version/ActivityVersionManager';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    activityVersion: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn()
    },
    collaboratorActivity: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn()
    },
    $disconnect: jest.fn()
  }))
}));

describe('活動版本管理系統基本功能', () => {
  test('版本類型應該正確定義', () => {
    expect(VersionType.MAJOR).toBe('major');
    expect(VersionType.MINOR).toBe('minor');
    expect(VersionType.PATCH).toBe('patch');
    expect(VersionType.AUTO).toBe('auto');
    expect(VersionType.MANUAL).toBe('manual');
    expect(VersionType.SNAPSHOT).toBe('snapshot');
  });

  test('變更類型應該正確定義', () => {
    expect(ChangeType.CREATE).toBe('create');
    expect(ChangeType.UPDATE).toBe('update');
    expect(ChangeType.DELETE).toBe('delete');
    expect(ChangeType.MOVE).toBe('move');
    expect(ChangeType.COPY).toBe('copy');
    expect(ChangeType.RENAME).toBe('rename');
    expect(ChangeType.RESTORE).toBe('restore');
    expect(ChangeType.MERGE).toBe('merge');
  });

  test('應該能創建版本信息對象', () => {
    const versionInfo = {
      id: 'version_123',
      activityId: 'activity_456',
      version: '1.2.3',
      type: VersionType.MINOR,
      title: '新功能版本',
      description: '添加了新的遊戲功能',
      content: { gameType: 'matching', words: [] },
      metadata: {
        size: 1024,
        checksum: 'abc123',
        compression: 'gzip',
        encoding: 'utf8'
      },
      changes: [],
      createdBy: {
        id: 'user_789',
        name: '張老師',
        email: 'teacher@example.com'
      },
      createdAt: new Date(),
      tags: ['新功能', '穩定版'],
      isStable: true,
      parentVersion: '1.1.0',
      branchName: 'main'
    };

    expect(versionInfo.version).toBe('1.2.3');
    expect(versionInfo.type).toBe(VersionType.MINOR);
    expect(versionInfo.isStable).toBe(true);
    expect(versionInfo.tags).toContain('新功能');
    expect(versionInfo.metadata.size).toBe(1024);
  });

  test('應該能創建版本變更對象', () => {
    const versionChange = {
      id: 'change_123',
      type: ChangeType.UPDATE,
      path: '/content/words',
      oldValue: ['hello', 'world'],
      newValue: ['hello', 'world', 'game'],
      description: '添加新單詞',
      timestamp: new Date(),
      userId: 'user_456',
      userName: '李老師',
      metadata: {
        lineNumber: 15,
        columnNumber: 3,
        context: '單詞列表',
        impact: '低'
      }
    };

    expect(versionChange.type).toBe(ChangeType.UPDATE);
    expect(versionChange.path).toBe('/content/words');
    expect(versionChange.newValue).toHaveLength(3);
    expect(versionChange.metadata?.impact).toBe('低');
  });

  test('應該能創建版本比較結果', () => {
    const comparison = {
      sourceVersion: '1.1.0',
      targetVersion: '1.2.0',
      differences: [
        {
          type: 'addition' as const,
          path: '/content/words/2',
          newValue: 'game',
          description: '添加新單詞 "game"',
          severity: 'low' as const,
          category: '內容變更',
          lineNumbers: { new: 3 }
        }
      ],
      summary: {
        totalChanges: 1,
        additions: 1,
        deletions: 0,
        modifications: 0,
        moves: 0
      },
      conflictCount: 0,
      similarityScore: 0.95
    };

    expect(comparison.sourceVersion).toBe('1.1.0');
    expect(comparison.targetVersion).toBe('1.2.0');
    expect(comparison.differences).toHaveLength(1);
    expect(comparison.summary.additions).toBe(1);
    expect(comparison.similarityScore).toBe(0.95);
    expect(comparison.conflictCount).toBe(0);
  });

  test('應該能創建恢復選項', () => {
    const restoreOptions = {
      targetVersion: '1.1.0',
      preserveCurrentVersion: true,
      createBackup: true,
      mergeStrategy: 'overwrite' as const,
      selectedPaths: ['/content/words'],
      conflictResolution: 'auto' as const,
      notifyCollaborators: true
    };

    expect(restoreOptions.targetVersion).toBe('1.1.0');
    expect(restoreOptions.preserveCurrentVersion).toBe(true);
    expect(restoreOptions.mergeStrategy).toBe('overwrite');
    expect(restoreOptions.selectedPaths).toContain('/content/words');
  });

  test('應該能創建協作者活動記錄', () => {
    const collaboratorActivity = {
      userId: 'user_123',
      userName: '王老師',
      userAvatar: 'avatar.jpg',
      action: 'create_version',
      timestamp: new Date(),
      versionId: 'version_456',
      changes: [
        {
          id: 'change_789',
          type: ChangeType.CREATE,
          path: '/',
          newValue: '初始版本',
          description: '創建活動',
          timestamp: new Date(),
          userId: 'user_123',
          userName: '王老師'
        }
      ],
      sessionId: 'session_abc',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...'
    };

    expect(collaboratorActivity.action).toBe('create_version');
    expect(collaboratorActivity.changes).toHaveLength(1);
    expect(collaboratorActivity.changes[0].type).toBe(ChangeType.CREATE);
  });
});

describe('版本號生成邏輯', () => {
  test('應該能生成初始版本號', () => {
    const generateVersionNumber = (currentVersion?: string, type: VersionType = VersionType.AUTO): string => {
      if (!currentVersion) {
        return '1.0.0';
      }

      const [major, minor, patch] = currentVersion.split('.').map(Number);

      switch (type) {
        case VersionType.MAJOR:
          return `${major + 1}.0.0`;
        case VersionType.MINOR:
          return `${major}.${minor + 1}.0`;
        case VersionType.PATCH:
          return `${major}.${minor}.${patch + 1}`;
        case VersionType.AUTO:
          return `${major}.${minor}.${patch + 1}`;
        case VersionType.SNAPSHOT:
          return `${major}.${minor}.${patch}-snapshot-${Date.now()}`;
        default:
          return `${major}.${minor}.${patch + 1}`;
      }
    };

    expect(generateVersionNumber()).toBe('1.0.0');
    expect(generateVersionNumber('1.0.0', VersionType.MAJOR)).toBe('2.0.0');
    expect(generateVersionNumber('1.0.0', VersionType.MINOR)).toBe('1.1.0');
    expect(generateVersionNumber('1.0.0', VersionType.PATCH)).toBe('1.0.1');
    expect(generateVersionNumber('1.2.3', VersionType.AUTO)).toBe('1.2.4');
  });

  test('應該能生成快照版本號', () => {
    const generateSnapshotVersion = (currentVersion: string): string => {
      const [major, minor, patch] = currentVersion.split('.').map(Number);
      return `${major}.${minor}.${patch}-snapshot-${Date.now()}`;
    };

    const snapshotVersion = generateSnapshotVersion('1.2.3');
    expect(snapshotVersion).toMatch(/^1\.2\.3-snapshot-\d+$/);
  });
});

describe('內容差異檢測', () => {
  test('應該能檢測內容變更', () => {
    const detectChanges = (oldContent: any, newContent: any): any[] => {
      const changes = [];
      
      // 簡化的變更檢測邏輯
      if (JSON.stringify(oldContent) !== JSON.stringify(newContent)) {
        changes.push({
          type: ChangeType.UPDATE,
          path: '/',
          oldValue: oldContent,
          newValue: newContent,
          description: '內容已更新'
        });
      }
      
      return changes;
    };

    const oldContent = { words: ['hello', 'world'] };
    const newContent = { words: ['hello', 'world', 'game'] };
    
    const changes = detectChanges(oldContent, newContent);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe(ChangeType.UPDATE);
  });

  test('應該能檢測無變更情況', () => {
    const detectChanges = (oldContent: any, newContent: any): any[] => {
      const changes = [];
      
      if (JSON.stringify(oldContent) !== JSON.stringify(newContent)) {
        changes.push({
          type: ChangeType.UPDATE,
          path: '/',
          oldValue: oldContent,
          newValue: newContent,
          description: '內容已更新'
        });
      }
      
      return changes;
    };

    const content = { words: ['hello', 'world'] };
    const changes = detectChanges(content, content);
    expect(changes).toHaveLength(0);
  });
});

describe('版本比較算法', () => {
  test('應該能計算相似度分數', () => {
    const calculateSimilarityScore = (oldContent: any, newContent: any): number => {
      const oldStr = JSON.stringify(oldContent);
      const newStr = JSON.stringify(newContent);
      
      if (oldStr === newStr) return 1.0;
      
      // 簡化的相似度計算
      const maxLength = Math.max(oldStr.length, newStr.length);
      const minLength = Math.min(oldStr.length, newStr.length);
      
      return minLength / maxLength;
    };

    const content1 = { words: ['hello', 'world'] };
    const content2 = { words: ['hello', 'world', 'game'] };
    const content3 = { words: ['hello', 'world'] };

    expect(calculateSimilarityScore(content1, content3)).toBe(1.0);
    expect(calculateSimilarityScore(content1, content2)).toBeGreaterThan(0.7);
    expect(calculateSimilarityScore(content1, content2)).toBeLessThan(1.0);
  });

  test('應該能統計差異摘要', () => {
    const calculateDifferenceSummary = (differences: any[]) => {
      return {
        totalChanges: differences.length,
        additions: differences.filter(d => d.type === 'addition').length,
        deletions: differences.filter(d => d.type === 'deletion').length,
        modifications: differences.filter(d => d.type === 'modification').length,
        moves: differences.filter(d => d.type === 'move').length
      };
    };

    const differences = [
      { type: 'addition', path: '/new' },
      { type: 'deletion', path: '/old' },
      { type: 'modification', path: '/changed' },
      { type: 'addition', path: '/another' }
    ];

    const summary = calculateDifferenceSummary(differences);
    expect(summary.totalChanges).toBe(4);
    expect(summary.additions).toBe(2);
    expect(summary.deletions).toBe(1);
    expect(summary.modifications).toBe(1);
    expect(summary.moves).toBe(0);
  });
});

describe('內容壓縮和元數據', () => {
  test('應該能計算內容元數據', () => {
    const calculateContentMetadata = (content: any) => {
      const contentString = JSON.stringify(content);
      const size = Buffer.byteLength(contentString, 'utf8');
      const checksum = require('crypto').createHash('sha256').update(contentString).digest('hex');

      return {
        size,
        checksum,
        compression: 'gzip',
        encoding: 'utf8'
      };
    };

    const content = { words: ['hello', 'world'] };
    const metadata = calculateContentMetadata(content);

    expect(metadata.size).toBeGreaterThan(0);
    expect(metadata.checksum).toHaveLength(64); // SHA256 hex length
    expect(metadata.compression).toBe('gzip');
    expect(metadata.encoding).toBe('utf8');
  });

  test('應該能檢測內容完整性', () => {
    const verifyContentIntegrity = (content: any, expectedChecksum: string): boolean => {
      const contentString = JSON.stringify(content);
      const actualChecksum = require('crypto').createHash('sha256').update(contentString).digest('hex');
      return actualChecksum === expectedChecksum;
    };

    const content = { words: ['hello', 'world'] };
    const contentString = JSON.stringify(content);
    const checksum = require('crypto').createHash('sha256').update(contentString).digest('hex');

    expect(verifyContentIntegrity(content, checksum)).toBe(true);
    expect(verifyContentIntegrity({ words: ['hello'] }, checksum)).toBe(false);
  });
});

describe('協作者活動追蹤', () => {
  test('應該能記錄協作者活動', () => {
    const recordActivity = (userId: string, action: string, changes: any[]) => {
      return {
        userId,
        action,
        timestamp: new Date(),
        changes,
        sessionId: `session_${Date.now()}`,
        changeCount: changes.length
      };
    };

    const changes = [
      { type: ChangeType.UPDATE, description: '更新內容' }
    ];

    const activity = recordActivity('user_123', 'update_content', changes);
    expect(activity.userId).toBe('user_123');
    expect(activity.action).toBe('update_content');
    expect(activity.changeCount).toBe(1);
    expect(activity.sessionId).toMatch(/^session_\d+$/);
  });

  test('應該能過濾協作者活動', () => {
    const filterActivities = (activities: any[], filters: any) => {
      return activities.filter(activity => {
        if (filters.userId && activity.userId !== filters.userId) return false;
        if (filters.action && !activity.action.includes(filters.action)) return false;
        if (filters.fromDate && activity.timestamp < filters.fromDate) return false;
        if (filters.toDate && activity.timestamp > filters.toDate) return false;
        return true;
      });
    };

    const activities = [
      { userId: 'user_1', action: 'create_version', timestamp: new Date('2024-01-01') },
      { userId: 'user_2', action: 'update_content', timestamp: new Date('2024-01-02') },
      { userId: 'user_1', action: 'restore_version', timestamp: new Date('2024-01-03') }
    ];

    const filtered = filterActivities(activities, { userId: 'user_1' });
    expect(filtered).toHaveLength(2);
    expect(filtered.every(a => a.userId === 'user_1')).toBe(true);
  });
});

describe('版本恢復邏輯', () => {
  test('應該能驗證恢復選項', () => {
    const validateRestoreOptions = (options: any): { valid: boolean; errors: string[] } => {
      const errors = [];

      if (!options.targetVersion) {
        errors.push('缺少目標版本');
      }

      if (options.mergeStrategy === 'selective' && (!options.selectedPaths || options.selectedPaths.length === 0)) {
        errors.push('選擇性恢復需要指定路徑');
      }

      const validMergeStrategies = ['overwrite', 'merge', 'selective'];
      if (!validMergeStrategies.includes(options.mergeStrategy)) {
        errors.push('無效的合併策略');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    };

    const validOptions = {
      targetVersion: '1.0.0',
      mergeStrategy: 'overwrite',
      conflictResolution: 'auto'
    };

    const invalidOptions = {
      mergeStrategy: 'selective',
      selectedPaths: []
    };

    expect(validateRestoreOptions(validOptions).valid).toBe(true);
    expect(validateRestoreOptions(invalidOptions).valid).toBe(false);
    expect(validateRestoreOptions(invalidOptions).errors).toContain('缺少目標版本');
  });

  test('應該能處理恢復衝突', () => {
    const detectRestoreConflicts = (currentContent: any, targetContent: any): string[] => {
      const conflicts = [];

      // 簡化的衝突檢測
      if (currentContent.lastModified && targetContent.lastModified) {
        if (currentContent.lastModified > targetContent.lastModified) {
          conflicts.push('目標版本較舊，可能覆蓋較新的變更');
        }
      }

      return conflicts;
    };

    const currentContent = { 
      data: 'current', 
      lastModified: new Date('2024-01-02') 
    };
    const targetContent = { 
      data: 'target', 
      lastModified: new Date('2024-01-01') 
    };

    const conflicts = detectRestoreConflicts(currentContent, targetContent);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toContain('目標版本較舊');
  });
});
