import { EditorElement } from '../../store/editorStore';
import H5PEmbed from '../H5P/H5PEmbed';

interface H5PElementPreviewProps {
  element: EditorElement;
}

export default function H5PElementPreview({ element }: H5PElementPreviewProps) {
  const { content, size, properties } = element;
  const contentId = properties?.contentId;
  
  if (!contentId) {
    return (
      <div className="h5p-preview-error bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600">H5P內容無效</p>
      </div>
    );
  }

  return (
    <div className="h5p-preview-container">
      <div className="h5p-preview-header mb-2">
        <h3 className="text-lg font-medium">{content}</h3>
        {properties?.description && (
          <p className="text-sm text-gray-600">{properties.description}</p>
        )}
      </div>
      <div className="h5p-preview-content border rounded-md overflow-hidden">
        <H5PEmbed
          contentId={contentId}
          contentPath={`/h5p/content/${contentId}`}
          title={content}
          height={size?.height || 400}
          width="100%"
        />
      </div>
    </div>
  );
}