/**
 * LTTC 全民英檢單字表自動提取工具
 * 
 * 功能:
 * - 自動訪問 LTTC 網站
 * - 提取所有級別 (初級、中級、中高級) 的單字
 * - 遍歷所有字母 (A-Z)
 * - 處理分頁
 * - 保存到文本文件
 * 
 * 使用方法:
 * node scripts/scrape-lttc-vocabulary.js [level]
 * 
 * level: elementary (初級), intermediate (中級), high-intermediate (中高級), all (全部)
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 級別配置
const LEVELS = {
  elementary: {
    name: '初級',
    tag: '初級', // 用於過濾單字的標籤
    outputFile: 'data/word-lists/gept-elementary-scraped.txt'
  },
  intermediate: {
    name: '中級',
    tag: '中級', // 用於過濾單字的標籤
    outputFile: 'data/word-lists/gept-intermediate-scraped.txt'
  },
  'high-intermediate': {
    name: '中高級',
    tag: '中高', // 用於過濾單字的標籤 (注意是"中高"不是"中高級")
    outputFile: 'data/word-lists/gept-high-intermediate-scraped.txt'
  }
};

// 字母列表
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * 從頁面提取單字 (根據級別標籤過濾)
 * @param {string} levelTag - 級別標籤: '初級', '中級', '中高'
 */
async function extractWordsFromPage(page, levelTag) {
  return await page.evaluate((levelTag) => {
    const words = [];

    // 找到所有級別標籤
    const levelDivs = Array.from(document.querySelectorAll('.level.cn'));

    levelDivs.forEach(levelDiv => {
      const levelText = levelDiv.textContent.trim();

      // 檢查是否匹配目標級別
      if (levelText === levelTag) {
        // 找到同一個 word-group 中的單字
        const wordGroup = levelDiv.parentElement;
        if (wordGroup && wordGroup.className.includes('word-group')) {
          const wordEl = wordGroup.querySelector('p.list-row__text');
          if (wordEl) {
            const word = wordEl.textContent.trim().toLowerCase();
            // 檢查是否是有效單字
            if (word && /^[a-z][a-z\.\-]*$/.test(word) && word.length > 1) {
              words.push(word);
            }
          }
        }
      }
    });

    // 去重
    return [...new Set(words)];
  }, levelTag);
}

/**
 * 檢查是否有下一頁
 */
async function hasNextPage(page) {
  return await page.evaluate(() => {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return false;
    
    // 檢查是否有未點擊的頁碼
    const pageNumbers = Array.from(pagination.querySelectorAll('div[class*="cursor-pointer"]'));
    return pageNumbers.length > 0;
  });
}

/**
 * 點擊下一頁
 */
async function clickNextPage(page, currentPage) {
  try {
    await page.click(`text="${currentPage + 1}"`);
    await page.waitForTimeout(2000); // 等待頁面載入
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 提取單個字母的所有單字
 * @param {string} levelTag - 級別標籤: '初級', '中級', '中高'
 */
async function scrapeLetterWords(page, letterUrl, levelTag) {
  console.log(`  訪問頁面: ${letterUrl}`);
  await page.goto(letterUrl);
  await page.waitForTimeout(2000);

  const allWords = [];
  let currentPage = 1;

  // 提取第一頁
  const words = await extractWordsFromPage(page, levelTag);
  allWords.push(...words);
  console.log(`    第 ${currentPage} 頁: ${words.length} 個單字`);

  // 處理分頁
  while (await hasNextPage(page)) {
    currentPage++;
    const clicked = await clickNextPage(page, currentPage);

    if (!clicked) {
      console.log(`    無法點擊第 ${currentPage} 頁，停止`);
      break;
    }

    const pageWords = await extractWordsFromPage(page, levelTag);
    allWords.push(...pageWords);
    console.log(`    第 ${currentPage} 頁: ${pageWords.length} 個單字`);

    // 防止無限循環
    if (currentPage > 10) {
      console.log(`    達到最大頁數限制，停止`);
      break;
    }
  }

  // 去重並排序
  return [...new Set(allWords)].sort();
}

/**
 * 獲取所有字母的 URL
 */
async function getLetterUrls(page, baseUrl) {
  await page.goto(baseUrl);
  await page.waitForTimeout(2000);
  
  return await page.evaluate(() => {
    const letterLinks = [];
    const links = document.querySelectorAll('a[href*="vocabulary_detail"]');
    
    links.forEach(link => {
      const text = link.textContent.trim();
      if (text.length === 1 && /[A-Z]/.test(text)) {
        letterLinks.push({
          letter: text,
          url: link.href
        });
      }
    });
    
    return letterLinks;
  });
}

/**
 * 提取指定級別的所有單字
 */
async function scrapeLevel(levelKey) {
  const level = LEVELS[levelKey];
  if (!level) {
    console.error(`❌ 未知級別: ${levelKey}`);
    return;
  }

  console.log(`\n🚀 開始提取 ${level.name} 單字表...`);

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 訪問主頁
    const baseUrl = 'https://www.lttc.ntu.edu.tw/tw/vocabulary';
    console.log(`📋 訪問主頁並點擊 ${level.name} 標籤...`);

    await page.goto(baseUrl);
    await page.waitForTimeout(2000);

    // 點擊級別標籤 (初級/中級/中高級)
    // 使用更精確的選擇器
    const levelSelectors = {
      '初級': 'div:nth-child(3) > .collapse-head',
      '中級': 'div:nth-child(4) > .collapse-head',
      '中高級': 'div:nth-child(5) > .collapse-head'
    };

    const selector = levelSelectors[level.name];
    if (selector) {
      await page.click(selector);
      await page.waitForTimeout(2000);
      console.log(`✅ 已展開 ${level.name} 標籤`);
    }

    // 獲取所有字母連結
    console.log(`📋 獲取字母列表...`);
    const letterUrls = await page.evaluate(() => {
      const letterLinks = [];
      // 找到最後一個展開的字母列表區域
      const collapseBodies = document.querySelectorAll('.collapse-body');
      const lastCollapseBody = collapseBodies[collapseBodies.length - 1];

      if (lastCollapseBody) {
        const links = lastCollapseBody.querySelectorAll('a[href*="vocabulary_detail"]');
        links.forEach(link => {
          const text = link.textContent.trim();
          if (text.length === 1 && /[A-Z]/.test(text)) {
            letterLinks.push({
              letter: text,
              url: link.href
            });
          }
        });
      }

      return letterLinks;
    });

    console.log(`✅ 找到 ${letterUrls.length} 個字母`);

    const allWords = [];

    // 遍歷每個字母
    for (const { letter, url } of letterUrls) {
      console.log(`\n📝 處理字母: ${letter}`);
      const words = await scrapeLetterWords(page, url, level.tag);
      allWords.push(...words);
      console.log(`  ✅ ${letter}: ${words.length} 個單字`);

      // 延遲避免請求過快
      await page.waitForTimeout(1000);
    }

    // 去重並排序
    const uniqueWords = [...new Set(allWords)].sort();

    // 保存到文件
    const outputPath = path.resolve(level.outputFile);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, uniqueWords.join('\n'), 'utf-8');

    console.log(`\n✅ ${level.name} 單字表提取完成!`);
    console.log(`   總單字數: ${uniqueWords.length}`);
    console.log(`   保存位置: ${outputPath}`);

  } catch (error) {
    console.error(`❌ 提取失敗:`, error);
  } finally {
    await browser.close();
  }
}

/**
 * 主函數
 */
async function main() {
  const args = process.argv.slice(2);
  const levelArg = args[0] || 'elementary';
  
  console.log('='.repeat(60));
  console.log('LTTC 全民英檢單字表自動提取工具');
  console.log('='.repeat(60));
  
  if (levelArg === 'all') {
    // 提取所有級別
    for (const levelKey of Object.keys(LEVELS)) {
      await scrapeLevel(levelKey);
    }
  } else {
    // 提取指定級別
    await scrapeLevel(levelArg);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 所有提取任務完成!');
  console.log('='.repeat(60));
  console.log('\n下一步:');
  console.log('1. 檢查生成的文件: data/word-lists/');
  console.log('2. 使用 collect-vocabulary-free.js 豐富單字數據');
  console.log('3. 例如: node scripts/collect-vocabulary-free.js GEPT_ELEMENTARY "GEPT 初級" data/word-lists/gept-elementary-scraped.txt');
}

// 執行
main().catch(console.error);

