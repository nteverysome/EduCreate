#!/usr/bin/env python3
"""
從 LTTC GEPT PDF 文件中提取單字
"""

import sys
import re
import PyPDF2

def extract_words_from_pdf(pdf_path, output_path):
    """從 PDF 提取單字並保存到文本文件"""
    print(f"正在處理: {pdf_path}")
    
    words = set()
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            print(f"總頁數: {total_pages}")
            
            for page_num in range(total_pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                # 提取英文單字 (只包含字母、連字符、點號)
                # 排除數字、中文、特殊符號
                found_words = re.findall(r'\b[a-zA-Z][a-zA-Z\.\-]*[a-zA-Z]\b|\b[a-zA-Z]\b', text)
                
                for word in found_words:
                    # 轉換為小寫
                    word = word.lower()
                    # 過濾掉太短或太長的單字
                    if 1 <= len(word) <= 30:
                        words.add(word)
                
                if (page_num + 1) % 10 == 0:
                    print(f"已處理 {page_num + 1}/{total_pages} 頁, 目前找到 {len(words)} 個單字")
        
        # 排序並保存
        sorted_words = sorted(words)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            for word in sorted_words:
                f.write(f"{word}\n")
        
        print(f"✅ 完成! 共提取 {len(sorted_words)} 個單字")
        print(f"保存到: {output_path}")
        
        return len(sorted_words)
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")
        return 0

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法: python extract-pdf-words.py <PDF文件路徑> <輸出文件路徑>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_path = sys.argv[2]
    
    extract_words_from_pdf(pdf_path, output_path)

