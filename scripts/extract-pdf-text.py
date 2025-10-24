#!/usr/bin/env python3
"""
從 PDF 文件提取文本
使用 PyPDF2 庫
"""

import sys
import os

try:
    from PyPDF2 import PdfReader
except ImportError:
    print("❌ 未安裝 PyPDF2")
    print("   請執行: pip install PyPDF2")
    sys.exit(1)

def extract_text_from_pdf(pdf_path, output_path):
    """從 PDF 提取文本並保存到 TXT 文件"""
    print(f"\n📄 處理: {os.path.basename(pdf_path)}")
    
    try:
        # 讀取 PDF
        reader = PdfReader(pdf_path)
        
        print(f"   總頁數: {len(reader.pages)}")
        
        # 提取所有頁面的文本
        text = ""
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            text += page_text + "\n"
            
            if (i + 1) % 10 == 0:
                print(f"   處理進度: {i + 1}/{len(reader.pages)} 頁")
        
        # 保存到文件
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        print(f"   ✅ 成功提取 {len(text)} 字符")
        print(f"   💾 已保存到: {output_path}")
        
        return True
    except Exception as e:
        print(f"   ❌ 提取失敗: {e}")
        return False

def main():
    print("=== PDF 文本提取工具 ===\n")
    
    # 文件列表
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sources_dir = os.path.join(base_dir, 'data', 'sources')
    
    pdf_files = [
        ('GEPT_Elementary.pdf', 'GEPT_Elementary.txt'),
        ('GEPT_Intermediate.pdf', 'GEPT_Intermediate.txt'),
        ('GEPT_High-Intermediate.pdf', 'GEPT_High-Intermediate.txt')
    ]
    
    success_count = 0
    
    for pdf_name, txt_name in pdf_files:
        pdf_path = os.path.join(sources_dir, pdf_name)
        txt_path = os.path.join(sources_dir, txt_name)
        
        if not os.path.exists(pdf_path):
            print(f"⚠️  文件不存在: {pdf_path}")
            continue
        
        if extract_text_from_pdf(pdf_path, txt_path):
            success_count += 1
    
    print(f"\n=== 完成 ===")
    print(f"成功提取: {success_count}/{len(pdf_files)} 個文件")
    
    if success_count == len(pdf_files):
        print("\n✅ 所有 PDF 已成功轉換為 TXT!")
        print("   現在可以運行: node scripts/parse-gept-txt-to-json.js")

if __name__ == '__main__':
    main()

