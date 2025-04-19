import { useState, useEffect } from 'react';
import { startSession } from '../utils/api';

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const id = await startSession();
        setSessionId(id);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initSession();
  }, []);

  return sessionId;
}