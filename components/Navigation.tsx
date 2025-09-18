import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PuzzlePieceIcon, HomeIcon, BookOpenIcon, TrophyIcon } from '@heroicons/react/24/outline';
export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <PuzzlePieceIcon className="w-6 h-6 text-blue-600" />
            EduCreate
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4" />
                首頁
              </Button>
            </Link>
            
            <Link href="/games/airplane">
              <Button variant="ghost" className="flex items-center gap-2">
                <PuzzlePieceIcon className="w-4 h-4" />
                飛機遊戲
              </Button>
            </Link>
            
            <Link href="/vocabulary">
              <Button variant="ghost" className="flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4" />
                詞彙庫
              </Button>
            </Link>
            
            <Link href="/games/airplane">
              <button className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2">
                ✈️ 飛機遊戲
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
