import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDeckStore } from '../store/deckStore';
import { isDue } from '../services/sm2';
import {
  requestNotificationPermission,
  scheduleDailyNotification,
} from '../services/notifications';

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const cards = useDeckStore((s) => s.cards);

  const reschedule = async (hour: number, minute: number) => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;
    const userCards = cards.filter(
      (c) => user && c.deckId,
    );
    const dueCount = userCards.filter(isDue).length;
    await scheduleDailyNotification(hour, minute, dueCount);
  };

  useEffect(() => {
    if (!user) return;
    const h = user.notificationHour ?? 9;
    const m = user.notificationMinute ?? 0;
    reschedule(h, m);
  }, [user?.uid]);

  return { reschedule };
}
