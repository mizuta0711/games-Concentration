import { GameDifficulty, CardType } from './types';

/**
 * 難易度に応じたゲーム設定
 * @type {Object.<GameDifficulty, {cardPairs: number}>}
 */
const DIFFICULTY_SETTINGS = {
    easy: { cardPairs: 4 },
    normal: { cardPairs: 6 },
    hard: { cardPairs: 8 },
    expert: { cardPairs: 10 },
}

/**
 * ゲームの状態を管理するクラス。
 * 
 * カードの状態を管理し、ゲームの進行を制御します。
 */
export class GameManager {
    /**
     * カードペアの総数。
     * 難易度設定に基づき、生成されるペア数を決定します。
     */
    private readonly cardPairs: number;

    /**
     * ゲーム内で使用するカードのリスト。
     * カードの状態（表裏、ペアが一致しているかなど）を保持します。
     */
    private cards: CardType[];

    /**
     * コンストラクタ。
     * 難易度に応じてゲームの設定を初期化します。
     * 
     * @param difficulty ゲームの難易度（例: Easy, Medium, Hard）。
     */
    constructor(difficulty: GameDifficulty) {
        const { cardPairs } = DIFFICULTY_SETTINGS[difficulty];
        this.cardPairs = cardPairs;
        this.cards = [];
        this.initializeCards();
    }

    /**
     * カードの初期化処理。
     * ペアごとに2枚のカードを生成し、ゲームで使用するカードセットを作成します。
     */
    private initializeCards(): void {
        const cards: CardType[] = [];
        for (let i = 1; i <= this.cardPairs; i++) {
            // 同じ値を持つペアのカードを作成。
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
        // カードをシャッフルしてゲームの初期状態に設定。
        this.cards = this.shuffleCards(cards);
    }

    /**
     * カードをランダムに並べ替える処理。
     * フィッシャー–イェーツシャッフルアルゴリズムを使用。
     * 
     * @param cards シャッフル前のカードリスト。
     * @returns シャッフル後のカードリスト。
     */
    private shuffleCards(cards: CardType[]): CardType[] {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 現在のカード状態を取得するメソッド。
     * 
     * @returns カードのリスト。
     */
    getCards(): CardType[] {
        return [...this.cards];
    }

    /**
     * 指定されたカードをめくるメソッド。
     * 
     * @param id めくりたいカードのID。
     * @returns 成功した場合はtrue、失敗した場合はfalse。
     */
    flipCard(id: number): boolean {
        const cardIndex = this.cards.findIndex(card => card.id === id);
        // IDが見つからない、カードが既に一致している、または既にめくられている場合は失敗。
        if (cardIndex === -1 || this.cards[cardIndex].isMatched || this.cards[cardIndex].isFlipped) {
            return false;
        }
        // カードを表向きに変更。
        this.cards[cardIndex].isFlipped = true;
        return true;
    }

    /**
     * 表向きの状態になっているカードを取得するメソッド。
     * 
     * @returns 表向きで一致していないカードのリスト。
     */
    getFlippedCards(): CardType[] {
        return this.cards.filter(card => card.isFlipped && !card.isMatched);
    }

    /**
     * めくられた2枚のカードが一致しているかを確認するメソッド。
     * 一致している場合はカードの状態を「一致済み」に更新。
     * 
     * @returns 一致している場合はtrue、一致していない場合はfalse。
     */
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

    /**
     * 表向きのカードを全て裏返す処理。
     * ただし、一致済みのカードは裏返さない。
     */
    resetFlippedCards(): void {
        this.cards = this.cards.map(card => ({
            ...card,
            isFlipped: card.isMatched ? card.isFlipped : false
        }));
    }

    /**
     * ゲームが終了したかを確認するメソッド。
     * 全てのカードが一致済みであればゲームクリア。
     * 
     * @returns ゲームが終了していればtrue、まだ続行中であればfalse。
     */
    isGameComplete(): boolean {
        return this.cards.every(card => card.isMatched);
    }
}
