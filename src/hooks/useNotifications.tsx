import { useState, useEffect } from 'react';
import { useMemories } from './useMemories';
import { toast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { memories } = useMemories();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  const scheduleAnniversaryReminders = () => {
    if (!memories.length || permission !== 'granted') return;

    memories.forEach(memory => {
      const memoryDate = new Date(memory.memory_date);
      const today = new Date();
      const thisYear = today.getFullYear();
      
      // Check if anniversary is coming up (within next 7 days)
      const thisYearAnniversary = new Date(thisYear, memoryDate.getMonth(), memoryDate.getDate());
      const daysUntilAnniversary = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilAnniversary >= 0 && daysUntilAnniversary <= 7) {
        const message = daysUntilAnniversary === 0 
          ? `Today is the anniversary of "${memory.title}"! 🎉`
          : `"${memory.title}" anniversary is in ${daysUntilAnniversary} days! 🎉`;

        toast({
          title: "Anniversary Reminder",
          description: message,
        });
      }
    });
  };

  const sendInstantNotification = (title: string, body: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  useEffect(() => {
    if (memories.length > 0) {
      scheduleAnniversaryReminders();
    }
  }, [memories, permission]);

  return {
    permission,
    requestPermission,
    sendInstantNotification,
    scheduleAnniversaryReminders
  };
};