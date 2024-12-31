'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameManager } from './GameManager';
import { GameDifficulty, CardType } from './types';

/**
 * カードを戻すまでの待機時間（ミリ秒）
 * @constant
 * @type {number}
 */
const FLIP_DELAY = 1000;

export default function Home() {
  /**
   * 操作方法（遊び方）の表示状態を管理するフラグ。
   * trueの場合、遊び方が表示されます。
   * @type {boolean}
   */
  const [showInstructions, setShowInstructions] = useState(false);

  /**
   * 現在選択されているゲームの難易度。
   * @type {GameDifficulty} 'easy' | 'normal' | 'hard' | 'expert'
   */
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');

  /**
   * ゲーム内で使用するカードの配列。
   * @type {CardType[]}
   */
  const [cards, setCards] = useState<CardType[]>([]);

  /**
   * ゲームのプレイ中かどうかを管理するフラグ。
   * @type {boolean}
   */
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * カードの操作がロックされているかどうかを管理するフラグ。
   * trueの場合、操作が一時的に無効になります。
   * @type {boolean}
   */
  const [isLocked, setIsLocked] = useState(false);

  /**
   * プレイヤーが行った手数をカウントします。
   * @type {number}
   */
  const [moves, setMoves] = useState(0);

  /**
   * ゲームがクリアされたかどうかを管理するフラグ。
   * trueの場合、全てのカードペアが一致しています。
   * @type {boolean}
   */
  const [gameComplete, setGameComplete] = useState(false);

  /**
   * 強制的にコンポーネントを再レンダリングするためのフラグ。
   * 状態変更時にリレンダリングをトリガーします。
   * @type {boolean}
   */
  const [forceUpdateFlag, setForceUpdateFlag] = useState(false);

  /**
   * コンポーネントを再レンダリングするための関数。
   * フラグの値を反転させることで再レンダリングをトリガーします。
   */
  const forceUpdate = () => setForceUpdateFlag(!forceUpdateFlag);

  /**
   * GameManager のインスタンスを初期化する関数。
   * 難易度に基づいてゲームの設定を作成します。
   * @param {GameDifficulty} difficulty - 選択されたゲームの難易度。
   * @returns {GameManager} 新しい GameManager のインスタンス。
   */
  const initializeGameManager = (difficulty: GameDifficulty) => {
    return new GameManager(difficulty);
  };

    /**
   * ゲームマネージャーのインスタンスを管理します。
   * ゲームの進行状況を管理するための主要なロジックを含みます。
   * @type {GameManager}
   */
    const [gameManager, setGameManager] = useState(() =>
      initializeGameManager(difficulty)
    );
  
  /**
   * ゲームをリセットする関数。
   * カード、手数、ロック状態などの初期化を行います。
   */
  const resetGame = () => {
    const newGameManager = initializeGameManager(difficulty);
    setGameManager(newGameManager);
    setCards(newGameManager.getCards());
    setIsPlaying(false);
    setMoves(0);
    setGameComplete(false);
    setIsLocked(false);
    forceUpdate();
  };

  /**
   * ゲームの初期化時および難易度変更時に実行される副作用。
   * `useEffect` により依存する状態が変更された場合にリセット処理が呼び出されます。
   */
  useEffect(() => {
    resetGame();
  }, [difficulty]);

  /**
   * 難易度変更時に呼び出されるハンドラー関数。
   * 新しい難易度を設定し、ゲームを再初期化します。
   * @param {GameDifficulty} newDifficulty - 選択された新しい難易度。
   */
  const handleDifficultyChange = (newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
  };

  /**
   * カードクリック時に実行される関数。
   * カードの状態変更やマッチング処理を行います。
   * @param {number} id - クリックされたカードのID。
   */
  const handleCardClick = async (id: number) => {
    if (!gameManager || isLocked) return;
    if (gameManager.getFlippedCards().length === 2) return;

    const success = gameManager.flipCard(id);
    if (!success) return;

    setIsPlaying(true);
    setCards([...gameManager.getCards()]);

    const flippedCards = gameManager.getFlippedCards();
    if (flippedCards.length === 2) {
      setIsLocked(true);
      setMoves((prev) => prev + 1);

      const isMatch = gameManager.checkMatch();
      if (!isMatch) {
        await new Promise((resolve) => setTimeout(resolve, FLIP_DELAY));
        gameManager.resetFlippedCards();
      }

      setIsLocked(false);
      setCards([...gameManager.getCards()]);

      if (gameManager.isGameComplete()) {
        setGameComplete(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white from-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-4">神経衰弱ゲーム</h1>

          <div className="flex items-center justify-center mb-4">
            {/* 遊び方ボタン */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md
                     transform hover:scale-105 transition-transform duration-200"
            >
              {showInstructions ? '遊び方を隠す' : '遊び方を見る'}
            </button>

            {/* 開始ボタン */}
            <Button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md ml-2
                     transform hover:scale-105 transition-transform duration-200"
            >
              ゲームをリセット
            </Button>
          </div>

          {/* 難易度選択 */}
          <div className="mb-4 space-x-2">
            <label className="mr-2">難易度:</label>
            <select
              value={difficulty}
              onChange={(e) => handleDifficultyChange(e.target.value as GameDifficulty)}
              disabled={isPlaying}
              className="px-2 py-1 border rounded"
            >
              <option value="easy">かんたん</option>
              <option value="normal">ふつう</option>
              <option value="hard">むずかしい</option>
              <option value="expert">とてもむずかしい</option>
            </select>
          </div>

          <p className="text-xl mb-4">手数: {moves}</p>
        </div>

        {/* 遊び方 */}
        <div className="mb-4">
          {showInstructions && (
            <div className="p-4 mt-2 border rounded bg-gray-100 text-left">
              <h2 className="text-xl font-bold mb-2">遊び方</h2>
              <p></p>
              <p>神経衰弱は、裏返されたカードのペアを見つけるゲームです。</p>
              <ul className="list-disc list-inside">
                <li>カードをクリックしてめくります</li>
                <li>２枚のカードが一致するか確認します</li>
                <li>一致する場合、そのカードは表のままになります</li>
                <li>一致しない場合、カードは元に戻ります</li>
                <li>すべてのカードのペアを見つけるとゲームクリアです</li>
              </ul>
            </div>
          )}
        </div>

        {/* カード一覧 */}
        <div className="grid grid-cols-4 gap-2 perspective-1000">
          {cards.map(card => (
            <div
              key={card.id}
              className={`transform-gpu transition-transform duration-500 ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card
                className={`relative w-full h-32 cursor-pointer transform-gpu transition-all duration-500
                          hover:shadow-xl ${!card.isFlipped && !card.isMatched
                  }`}
                onClick={() => !card.isFlipped && !card.isMatched && handleCardClick(card.id)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* カードの表面 */}
                <CardContent
                  className={`absolute w-full h-full backface-hidden flex items-center justify-center
                             bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl border-2 border-blue-400 shadow-lg`}
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="text-5xl font-bold text-white">?</div>
                </CardContent>

                {/* カードの裏面 */}
                <CardContent
                  className={`absolute w-full h-full backface-hidden flex items-center justify-center rotate-y-180
                             bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl border-2 border-gray-200 shadow-lg`}
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="text-5xl font-bold text-white">{card.value}</div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {gameComplete && (
          <div className="text-center mt-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-green-400">
              ゲームクリア！ 手数: {moves}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}