"""
Enhanced MCP Feedback Collector

增強版交互式反馈收集器 MCP 服务器
支持文本、图片和影片反馈收集

Features:
- 文字反馈收集
- 图片上传和预览
- 影片上传和处理
- 现代化用户界面
- 性能优化和错误处理

Usage:
    from mcp_feedback_collector.enhanced_server import collect_feedback
    
    feedback = collect_feedback(
        work_summary="AI工作完成汇报",
        timeout_seconds=600
    )
"""

__version__ = "1.0.0"
__author__ = "Enhanced MCP Team"
__email__ = "enhanced@mcp.dev"
__description__ = "增強版交互式反馈收集器 MCP 服务器，支持文本、图片和影片反馈"

# 导出主要功能
from .enhanced_server import (
    collect_feedback,
    pick_image,
    pick_video,
    get_video_data,
    get_image_info,
    get_video_info,
    get_last_feedback_videos,
    EnhancedFeedbackDialog,
    SUPPORTED_IMAGE_FORMATS,
    SUPPORTED_VIDEO_FORMATS,
    DEFAULT_DIALOG_TIMEOUT
)

__all__ = [
    "collect_feedback",
    "pick_image", 
    "pick_video",
    "get_video_data",
    "get_image_info",
    "get_video_info",
    "get_last_feedback_videos",
    "EnhancedFeedbackDialog",
    "SUPPORTED_IMAGE_FORMATS",
    "SUPPORTED_VIDEO_FORMATS",
    "DEFAULT_DIALOG_TIMEOUT"
]
