export type GameDifficulty = 'easy' | 'normal' | 'hard' | 'expert';

/**
 * カードの状態を管理する型定義。
 * @typedef {Object} CardType
 * @property {number} id - カードのユニークなID。
 * @property {number} value - カードのペアを識別する値。
 * @property {boolean} isFlipped - カードが表向きかどうかを示すフラグ。
 * @property {boolean} isMatched - カードが一致したかどうかを示すフラグ。
 */
export interface CardType {
    id: number;
    value: number;
    isFlipped: boolean;
    isMatched: boolean;
}
