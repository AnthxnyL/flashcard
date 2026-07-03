import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Deck, Card } from '../types';
import { createCard } from '../services/sm2';

const DECKS_KEY = 'flashcard:decks';
const CARDS_KEY = 'flashcard:cards';

interface DeckState {
  decks: Deck[];
  cards: Card[];
  isLoading: boolean;
  loadFromStorage: () => Promise<void>;
  addDeck: (title: string, description: string, color: string, userId: string) => Promise<void>;
  updateDeck: (id: string, patch: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  addCard: (deckId: string, front: string, back: string) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  getCardsByDeck: (deckId: string) => Card[];
}

async function persist(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  cards: [],
  isLoading: false,

  loadFromStorage: async () => {
    set({ isLoading: true });
    const [rawDecks, rawCards] = await Promise.all([
      AsyncStorage.getItem(DECKS_KEY),
      AsyncStorage.getItem(CARDS_KEY),
    ]);
    set({
      decks: rawDecks ? JSON.parse(rawDecks) : [],
      cards: rawCards ? JSON.parse(rawCards) : [],
      isLoading: false,
    });
  },

  addDeck: async (title, description, color, userId) => {
    const deck: Deck = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title,
      description,
      color,
      userId,
      createdAt: Date.now(),
      cardCount: 0,
    };
    const decks = [...get().decks, deck];
    set({ decks });
    await persist(DECKS_KEY, decks);
  },

  updateDeck: async (id, patch) => {
    const decks = get().decks.map((d) => (d.id === id ? { ...d, ...patch } : d));
    set({ decks });
    await persist(DECKS_KEY, decks);
  },

  deleteDeck: async (id) => {
    const decks = get().decks.filter((d) => d.id !== id);
    const cards = get().cards.filter((c) => c.deckId !== id);
    set({ decks, cards });
    await Promise.all([persist(DECKS_KEY, decks), persist(CARDS_KEY, cards)]);
  },

  addCard: async (deckId, front, back) => {
    const card = createCard(deckId, front, back);
    const cards = [...get().cards, card];
    const decks = get().decks.map((d) =>
      d.id === deckId ? { ...d, cardCount: d.cardCount + 1 } : d,
    );
    set({ cards, decks });
    await Promise.all([persist(CARDS_KEY, cards), persist(DECKS_KEY, decks)]);
  },

  updateCard: async (updated) => {
    const cards = get().cards.map((c) => (c.id === updated.id ? updated : c));
    set({ cards });
    await persist(CARDS_KEY, cards);
  },

  deleteCard: async (id) => {
    const card = get().cards.find((c) => c.id === id);
    const cards = get().cards.filter((c) => c.id !== id);
    const decks = card
      ? get().decks.map((d) =>
          d.id === card.deckId ? { ...d, cardCount: Math.max(0, d.cardCount - 1) } : d,
        )
      : get().decks;
    set({ cards, decks });
    await Promise.all([persist(CARDS_KEY, cards), persist(DECKS_KEY, decks)]);
  },

  getCardsByDeck: (deckId) => get().cards.filter((c) => c.deckId === deckId),
}));
