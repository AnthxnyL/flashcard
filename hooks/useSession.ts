import { useSessionStore } from '../store/sessionStore';
import { useDeckStore } from '../store/deckStore';

export function useSession(deckId: string) {
  const session = useSessionStore();
  const { getCardsByDeck, updateCard } = useDeckStore();

  const start = () => {
    const cards = getCardsByDeck(deckId);
    session.initSession(cards);
  };

  const answer = (quality: Parameters<typeof session.answer>[0]) => {
    session.answer(quality, updateCard);
  };

  const isDone = session.currentCard === null && session.sessionStats.total > 0;

  return { ...session, start, answer, isDone };
}
