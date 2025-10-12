const fs = require('fs');
const content = fs.readFileSync('app/create/[templateId]/page.tsx', 'utf8');
const lines = content.split('\n');

let openTags = [];
let inJSX = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // 檢查是否進入 JSX (return 語句後)
  if (line.includes('return (')) {
    inJSX = true;
    console.log(`Line ${lineNum}: JSX starts`);
  }
  
  if (inJSX) {
    // 查找開放標籤
    const openMatches = line.match(/<(\w+)(?:\s[^>]*)?(?<!\/)\s*>/g);
    if (openMatches) {
      openMatches.forEach(match => {
        const tag = match.match(/<(\w+)/)[1];
        openTags.push({tag, line: lineNum});
        console.log(`Line ${lineNum}: Open <${tag}>`);
      });
    }
    
    // 查找關閉標籤
    const closeMatches = line.match(/<\/(\w+)>/g);
    if (closeMatches) {
      closeMatches.forEach(match => {
        const tag = match.match(/<\/(\w+)>/)[1];
        const lastOpenIndex = openTags.map(t => t.tag).lastIndexOf(tag);
        if (lastOpenIndex !== -1) {
          openTags.splice(lastOpenIndex, 1);
          console.log(`Line ${lineNum}: Close </${tag}>`);
        } else {
          console.log(`Line ${lineNum}: ERROR - Closing tag </${tag}> without opening`);
        }
      });
    }
    
    // 查找自關閉標籤
    const selfCloseMatches = line.match(/<(\w+)(?:\s[^>]*)?\/>/g);
    if (selfCloseMatches) {
      selfCloseMatches.forEach(match => {
        const tag = match.match(/<(\w+)/)[1];
        console.log(`Line ${lineNum}: Self-closing <${tag}/>`);
      });
    }
  }
}

console.log('\nUnclosed tags:');
openTags.forEach(tag => {
  console.log(`<${tag.tag}> opened at line ${tag.line}`);
});
