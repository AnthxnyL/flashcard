import type { Card, ReviewQuality } from '../types';

const MIN_EASE_FACTOR = 1.3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function applyReview(card: Card, quality: ReviewQuality): Card {
  const now = Date.now();

  if (quality < 3) {
    return {
      ...card,
      repetition: 0,
      interval: 1,
      lastReviewDate: now,
      nextReviewDate: now + MS_PER_DAY,
    };
  }

  const newEF = Math.max(
    MIN_EASE_FACTOR,
    card.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
  );

  let newInterval: number;
  if (card.repetition === 0) {
    newInterval = 1;
  } else if (card.repetition === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(card.interval * newEF);
  }

  return {
    ...card,
    repetition: card.repetition + 1,
    interval: newInterval,
    easeFactor: newEF,
    lastReviewDate: now,
    nextReviewDate: now + newInterval * MS_PER_DAY,
  };
}

export function isDue(card: Card): boolean {
  return card.nextReviewDate <= Date.now();
}

export function buildReviewQueue(cards: Card[]): Card[] {
  return cards
    .filter(isDue)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate);
}

export function createCard(deckId: string, front: string, back: string): Card {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    deckId,
    front,
    back,
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: Date.now(),
    lastReviewDate: null,
  };
}
