"""
Enhanced MCP Feedback Collector with Video Support
增強版 MCP 反饋收集器 - 支持影片上傳

基於原始 mcp-feedback-collector 添加影片功能的完整 MCP 服務器
"""

__version__ = "1.1.0"
__author__ = "Enhanced MCP Team"
__description__ = "Enhanced MCP Feedback Collector with Video Support"

# 導出主要功能
from .server import (
    collect_feedback,
    pick_image,
    pick_video,
    main
)

__all__ = [
    "collect_feedback",
    "pick_image", 
    "pick_video",
    "main"
]
