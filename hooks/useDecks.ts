import { useEffect } from 'react';
import { useDeckStore } from '../store/deckStore';
import { useAuthStore } from '../store/authStore';
import { isDue } from '../services/sm2';

export function useDecks() {
  const store = useDeckStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    store.loadFromStorage();
  }, []);

  const myDecks = store.decks.filter((d) => d.userId === user?.uid);

  const getDueCount = (deckId: string) =>
    store.cards.filter((c) => c.deckId === deckId && isDue(c)).length;

  return { ...store, myDecks, getDueCount };
}
