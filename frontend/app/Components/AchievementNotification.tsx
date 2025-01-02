import { useWebSocket } from '@/hooks/useWebSocket';
import { useState, useEffect } from 'react';

export function AchievementNotification() {
  const [token, setToken] = useState('');
  const [achievement, setAchievement] = useState(null);

  // Get token from your auth system
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  useWebSocket(token);

  useEffect(() => {
    const handleAchievement = (event: CustomEvent) => {
      setAchievement(event.detail);
    };

    window.addEventListener('achievement', handleAchievement as EventListener);

    return () => {
      window.removeEventListener('achievement', handleAchievement as EventListener);
    };
  }, []);

  if (!achievement) return null;

  return (
    <AchievementModal 
      achievement={achievement} 
      onClose={() => setAchievement(null)} 
    />
  );
}