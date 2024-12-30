'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 型定義
interface CardType {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
}

// ゲームの設定
const CARD_PAIRS = 6; // カードのペア数（難易度調整用）
const FLIP_DELAY = 1000; // カードを戻すまでの待機時間（ミリ秒）

// カードの状態を管理するクラス
class GameManager {
  private cards: CardType[];
  private cardPairs: number;

  constructor(cardPairs: number) {
    this.cardPairs = cardPairs;
    this.cards = [];
    this.initializeCards();
  }

  // カードの初期化
  private initializeCards(): void {
    const cards: CardType[] = [];
    for (let i = 1; i <= this.cardPairs; i++) {
      cards.push({
        id: i * 2 - 1,
        value: i,
        isFlipped: false,
        isMatched: false
      });
      cards.push({
        id: i * 2,
        value: i,
        isFlipped: false,
        isMatched: false
      });
    }
    this.cards = this.shuffleCards(cards);
  }

  // カードのシャッフル
  private shuffleCards(cards: CardType[]): CardType[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // カードの状態を取得
  getCards(): CardType[] {
    return [...this.cards];
  }

  // カードをめくる
  flipCard(id: number): boolean {
    const cardIndex = this.cards.findIndex(card => card.id === id);
    if (cardIndex === -1 || this.cards[cardIndex].isMatched || this.cards[cardIndex].isFlipped) {
      return false;
    }
    this.cards[cardIndex].isFlipped = true;
    return true;
  }

  // めくられているカードを取得
  getFlippedCards(): CardType[] {
    return this.cards.filter(card => card.isFlipped && !card.isMatched);
  }

  // カードのペアが一致しているか確認
  checkMatch(): boolean {
    const flippedCards = this.getFlippedCards();
    if (flippedCards.length !== 2) return false;

    const match = flippedCards[0].value === flippedCards[1].value;
    if (match) {
      flippedCards.forEach(card => {
        const index = this.cards.findIndex(c => c.id === card.id);
        if (index !== -1) {
          this.cards[index].isMatched = true;
        }
      });
    }
    return match;
  }

  // めくられているカードを元に戻す
  resetFlippedCards(): void {
    this.cards = this.cards.map(card => ({
      ...card,
      isFlipped: card.isMatched ? card.isFlipped : false
    }));
  }

  // ゲームクリアの確認
  isGameComplete(): boolean {
    return this.cards.every(card => card.isMatched);
  }
}

export default function Home() {
  /**
   * 操作方法（遊び方）の表示状態を管理するフラグ。
   * trueの場合、遊び方が表示されます。
   * @type {boolean}
   */
  const [showInstructions, setShowInstructions] = useState(false)
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // ゲームの初期化
  useEffect(() => {
    const manager = new GameManager(CARD_PAIRS);
    setGameManager(manager);
    setCards(manager.getCards());
  }, []);

  // カードクリック時の処理
  const handleCardClick = async (id: number) => {
    if (!gameManager || isLocked) return;
    if (gameManager.getFlippedCards().length === 2) return;

    const success = gameManager.flipCard(id);
    if (!success) return;

    setCards([...gameManager.getCards()]);

    const flippedCards = gameManager.getFlippedCards();
    if (flippedCards.length === 2) {
      setIsLocked(true);
      setMoves(prev => prev + 1);

      const isMatch = gameManager.checkMatch();
      if (!isMatch) {
        await new Promise(resolve => setTimeout(resolve, FLIP_DELAY));
        gameManager.resetFlippedCards();
      }

      setIsLocked(false);
      setCards([...gameManager.getCards()]);

      if (gameManager.isGameComplete()) {
        setGameComplete(true);
      }
    }
  };

  // ゲームのリセット
  const resetGame = () => {
    const manager = new GameManager(CARD_PAIRS);
    setGameManager(manager);
    setCards(manager.getCards());
    setMoves(0);
    setGameComplete(false);
    setIsLocked(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">神経衰弱</h1>

          <div className="mb-4">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg
              transform hover:scale-105 transition-transform duration-200"
            >
              {showInstructions ? '遊び方を隠す' : '遊び方を見る'}
            </button>

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

          <p className="text-xl mb-4 text-gray-300">手数: {moves}</p>
          <Button
            onClick={resetGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg
                     transform hover:scale-105 transition-transform duration-200"
          >
            ゲームをリセット
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6 perspective-1000">
          {cards.map(card => (
            <div
              key={card.id}
              className={`transform-gpu transition-transform duration-500 ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card
                className={`relative w-full cursor-pointer transform-gpu transition-all duration-500
                          hover:shadow-xl ${!card.isFlipped && !card.isMatched && !isLocked
                    ? 'hover:-translate-y-2'
                    : ''
                  }`}
                onClick={() => !card.isFlipped && !card.isMatched && handleCardClick(card.id)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* カードの表面 */}
                <CardContent
                  className={`absolute w-full h-full backface-hidden flex items-center justify-center
                             ${card.isFlipped || card.isMatched ? 'rotate-y-180 invisible' : ''}
                             bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl
                             border-2 border-blue-400 shadow-lg`}
                >
                <div className="text-5xl font-bold text-white">?</div>
                </CardContent>

                {/* カードの裏面 */}
                <CardContent
                  className={`absolute w-full h-full backface-hidden flex items-center justify-center
                             rotate-y-180 ${card.isFlipped || card.isMatched ? 'visible' : 'invisible'}
                             bg-white rounded-xl border-2 border-gray-200 shadow-lg`}
                >
                  <div className="text-5xl font-bold text-gray-800">{card.value}</div>
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