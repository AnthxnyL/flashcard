export interface Deck {
  id: string;
  title: string;
  description: string;
  color: string;
  createdAt: number;
  cardCount: number;
  userId: string;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReviewDate: number;
  lastReviewDate: number | null;
}

export interface ReviewedCard {
  cardId: string;
  quality: ReviewQuality;
  reviewedAt: number;
}

export interface ReviewSession {
  deckId: string;
  startedAt: number;
  endedAt?: number;
  cards: ReviewedCard[];
}

export interface SessionStats {
  correct: number;
  incorrect: number;
  total: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  isPremium: boolean;
  notificationHour: number;
  notificationMinute: number;
  createdAt: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  reviewed: number;
  correct: number;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export type ThemeMode = 'light' | 'dark' | 'system';
