/**
 * 遊戲選項面板組件
 * 參考 Wordwall 的 Options 功能實現
 * 
 * 功能：
 * - Timer: None / Count up / Count down (with time input)
 * - Lives: 1-5 (slider)
 * - Speed: 1-10 (slider)
 * - Random: Shuffle question order (checkbox)
 * - End of game: Show answers (checkbox)
 */

'use client';

import { GameOptions } from '@/types/game-options';

interface GameOptionsProps {
  options: GameOptions;
  onChange: (options: GameOptions) => void;
}

export default function GameOptionsPanel({ options, onChange }: GameOptionsProps) {
  const updateOptions = (updates: Partial<GameOptions>) => {
    onChange({ ...options, ...updates });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Options</h3>
      
      <table className="w-full">
        <tbody>
          {/* Timer 選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium align-top">Timer</td>
            <td className="py-3">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timer"
                    checked={options.timer.type === 'none'}
                    onChange={() => updateOptions({ 
                      timer: { ...options.timer, type: 'none' } 
                    })}
                    className="cursor-pointer"
                  />
                  <span>None</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timer"
                    checked={options.timer.type === 'countUp'}
                    onChange={() => updateOptions({ 
                      timer: { ...options.timer, type: 'countUp' } 
                    })}
                    className="cursor-pointer"
                  />
                  <span>Count up</span>
                </label>
                
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timer"
                    checked={options.timer.type === 'countDown'}
                    onChange={() => updateOptions({ 
                      timer: { ...options.timer, type: 'countDown' } 
                    })}
                    className="cursor-pointer mt-1"
                  />
                  <div className="flex flex-col gap-2">
                    <span>Count down</span>
                    
                    {options.timer.type === 'countDown' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={options.timer.minutes || 5}
                          onChange={(e) => updateOptions({
                            timer: { 
                              ...options.timer, 
                              minutes: Number(e.target.value) 
                            }
                          })}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-600">m</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={options.timer.seconds || 0}
                          onChange={(e) => updateOptions({
                            timer: { 
                              ...options.timer, 
                              seconds: Number(e.target.value) 
                            }
                          })}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-600">s</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </td>
          </tr>

          {/* Lives 選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">Lives</td>
            <td className="py-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={options.lives}
                  onChange={(e) => updateOptions({ lives: Number(e.target.value) })}
                  className="flex-1 cursor-pointer"
                />
                <span className="w-8 text-center font-semibold text-lg">{options.lives}</span>
              </div>
            </td>
          </tr>

          {/* Speed 選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">Speed</td>
            <td className="py-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={options.speed}
                  onChange={(e) => updateOptions({ speed: Number(e.target.value) })}
                  className="flex-1 cursor-pointer"
                />
                <span className="w-8 text-center font-semibold text-lg">{options.speed}</span>
              </div>
            </td>
          </tr>

          {/* Random 選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">Random</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.random}
                  onChange={(e) => updateOptions({ random: e.target.checked })}
                  className="cursor-pointer"
                />
                <span>Shuffle question order</span>
              </label>
            </td>
          </tr>

          {/* End of game 選項 */}
          <tr>
            <td className="py-3 pr-4 font-medium">End of game</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showAnswers}
                  onChange={(e) => updateOptions({ showAnswers: e.target.checked })}
                  className="cursor-pointer"
                />
                <span>Show answers</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

