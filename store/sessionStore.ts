import { create } from 'zustand';
import type { Card, ReviewQuality, SessionStats } from '../types';
import { applyReview, buildReviewQueue } from '../services/sm2';

interface SessionState {
  queue: Card[];
  currentCard: Card | null;
  sessionStats: SessionStats;
  isFlipped: boolean;
  initSession: (cards: Card[]) => void;
  flip: () => void;
  answer: (quality: ReviewQuality, onCardUpdated: (card: Card) => void) => void;
  reset: () => void;
}

const emptyStats: SessionStats = { correct: 0, incorrect: 0, total: 0 };

export const useSessionStore = create<SessionState>((set, get) => ({
  queue: [],
  currentCard: null,
  sessionStats: emptyStats,
  isFlipped: false,

  initSession: (cards) => {
    const queue = buildReviewQueue(cards);
    set({ queue, currentCard: queue[0] ?? null, sessionStats: emptyStats, isFlipped: false });
  },

  flip: () => set((s) => ({ isFlipped: !s.isFlipped })),

  answer: (quality, onCardUpdated) => {
    const { queue, sessionStats } = get();
    const current = queue[0];
    if (!current) return;

    const updated = applyReview(current, quality);
    onCardUpdated(updated);

    const isCorrect = quality >= 3;
    const remaining = queue.slice(1);

    set({
      queue: remaining,
      currentCard: remaining[0] ?? null,
      isFlipped: false,
      sessionStats: {
        total: sessionStats.total + 1,
        correct: sessionStats.correct + (isCorrect ? 1 : 0),
        incorrect: sessionStats.incorrect + (isCorrect ? 0 : 1),
      },
    });
  },

  reset: () => set({ queue: [], currentCard: null, sessionStats: emptyStats, isFlipped: false }),
}));
