import { useAuthStore } from '../store/authStore';
import { useDeckStore } from '../store/deckStore';

const FREE_DECK_LIMIT = 3;

export function usePremium() {
  const user = useAuthStore((s) => s.user);
  const decks = useDeckStore((s) => s.decks);

  const isPremium = user?.isPremium ?? false;
  const deckCount = decks.filter((d) => d.userId === user?.uid).length;
  const canAddDeck = isPremium || deckCount < FREE_DECK_LIMIT;
  const remaining = Math.max(0, FREE_DECK_LIMIT - deckCount);

  return { isPremium, canAddDeck, deckCount, remaining, limit: FREE_DECK_LIMIT };
}
