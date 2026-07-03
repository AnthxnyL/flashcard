import { applyReview, isDue, buildReviewQueue, createCard } from '../sm2';
import type { Card } from '../../types';

const baseCard: Card = {
  id: 'c1',
  deckId: 'd1',
  front: 'Q',
  back: 'A',
  interval: 1,
  repetition: 0,
  easeFactor: 2.5,
  nextReviewDate: Date.now() - 1000,
  lastReviewDate: null,
};

describe('applyReview', () => {
  it('reset when quality < 3 (blackout)', () => {
    const result = applyReview(baseCard, 0);
    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('reset when quality = 2 (hard)', () => {
    const cardAfterSome = { ...baseCard, repetition: 3, interval: 15 };
    const result = applyReview(cardAfterSome, 2);
    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('first success: interval = 1 day, repetition = 1', () => {
    const result = applyReview(baseCard, 4);
    expect(result.repetition).toBe(1);
    expect(result.interval).toBe(1);
  });

  it('second success: interval = 6 days, repetition = 2', () => {
    const card1 = applyReview(baseCard, 4);
    const result = applyReview(card1, 4);
    expect(result.repetition).toBe(2);
    expect(result.interval).toBe(6);
  });

  it('third success (perfect): interval > 6, easeFactor increases', () => {
    const card1 = applyReview(baseCard, 5);
    const card2 = applyReview(card1, 5);
    const result = applyReview(card2, 5);
    expect(result.repetition).toBe(3);
    expect(result.interval).toBeGreaterThan(6);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it('easeFactor never goes below 1.3', () => {
    let card = { ...baseCard, repetition: 5, interval: 20, easeFactor: 1.35 };
    card = applyReview(card, 3);
    expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('sets nextReviewDate in the future', () => {
    const before = Date.now();
    const result = applyReview(baseCard, 4);
    expect(result.nextReviewDate).toBeGreaterThan(before);
  });
});

describe('isDue', () => {
  it('returns true when nextReviewDate is in the past', () => {
    const card = { ...baseCard, nextReviewDate: Date.now() - 1000 };
    expect(isDue(card)).toBe(true);
  });

  it('returns false when nextReviewDate is in the future', () => {
    const card = { ...baseCard, nextReviewDate: Date.now() + 100000 };
    expect(isDue(card)).toBe(false);
  });
});

describe('buildReviewQueue', () => {
  it('only includes due cards, sorted by nextReviewDate', () => {
    const now = Date.now();
    const cards: Card[] = [
      { ...baseCard, id: 'a', nextReviewDate: now + 10000 },
      { ...baseCard, id: 'b', nextReviewDate: now - 2000 },
      { ...baseCard, id: 'c', nextReviewDate: now - 1000 },
    ];
    const queue = buildReviewQueue(cards);
    expect(queue.map((c) => c.id)).toEqual(['b', 'c']);
  });
});

describe('createCard', () => {
  it('creates a card with default SM-2 values', () => {
    const card = createCard('deck1', 'Hello', 'World');
    expect(card.deckId).toBe('deck1');
    expect(card.repetition).toBe(0);
    expect(card.easeFactor).toBe(2.5);
    expect(card.interval).toBe(1);
  });
});
