#!/usr/bin/env python3
"""
Setup script for Enhanced MCP Feedback Collector with Video Support
"""

from setuptools import setup, find_packages

setup(
    name="mcp-video-feedback-collector",
    version="1.1.0",
    description="Enhanced MCP Feedback Collector with Video Support - 增強版 MCP 反饋收集器，支持影片上傳",
    long_description="""
Enhanced MCP Feedback Collector with Video Support

基於原始 mcp-feedback-collector 添加影片上傳功能的增強版本。

Features:
- 文字反饋收集
- 圖片上傳和預覽
- 影片上傳和處理（新增功能）
- 支持多種影片格式（MP4, AVI, MOV, WMV, WebM, MKV, FLV）
- 智能文件大小檢查
- 現代化用戶界面

Usage:
    from mcp_video_feedback_collector.server import collect_feedback
    
    feedback = collect_feedback(
        work_summary="AI工作完成汇报",
        timeout_seconds=300
    )
""",
    author="Enhanced MCP Team",
    author_email="enhanced@mcp.dev",
    url="https://github.com/enhanced-mcp/mcp-video-feedback-collector",
    packages=find_packages(),
    install_requires=[
        "mcp>=1.0.0",
        "pillow>=9.0.0",
        "fastmcp>=0.2.0"
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "black>=23.0.0",
            "isort>=5.12.0"
        ]
    },
    entry_points={
        "console_scripts": [
            "mcp-video-feedback-collector=mcp_video_feedback_collector.server:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Communications",
        "Topic :: Multimedia :: Video",
    ],
    python_requires=">=3.8",
    keywords="mcp feedback video interactive ai",
    project_urls={
        "Bug Reports": "https://github.com/enhanced-mcp/mcp-video-feedback-collector/issues",
        "Source": "https://github.com/enhanced-mcp/mcp-video-feedback-collector",
        "Documentation": "https://github.com/enhanced-mcp/mcp-video-feedback-collector#readme",
    },
)
