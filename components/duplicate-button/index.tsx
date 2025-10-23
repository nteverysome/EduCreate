/**
 * DuplicateButton Component
 * 
 * Wordwall-style duplicate button for copying vocabulary items.
 * Uses Bootstrap Glyphicons duplicate icon (two overlapping squares).
 * 
 * Features:
 * - 32px × 44px size (matches other buttons)
 * - Gray color with hover effect
 * - Cursor pointer
 * - Title tooltip
 * 
 * @param onClick - Callback function when button is clicked
 */

interface DuplicateButtonProps {
  onClick: () => void;
}

export default function DuplicateButton({ onClick }: DuplicateButtonProps) {
  return (
    <button
      className="w-8 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
      onClick={onClick}
      type="button"
      title="複製項目"
    >
      {/* Bootstrap Glyphicons duplicate icon (two overlapping squares) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        className="w-4 h-4"
        fill="currentColor"
      >
        {/* Front square */}
        <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6z"/>
        {/* Back square */}
        <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z"/>
      </svg>
    </button>
  );
}

