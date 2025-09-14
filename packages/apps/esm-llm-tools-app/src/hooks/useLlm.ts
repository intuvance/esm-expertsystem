import { useEffect, useState } from 'react';
import { getResponse, setResponse } from '../utils/localStorage';

export function useLlm<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(() => {
    return (getResponse(key) as T) || initialValue;
  });

  useEffect(() => {
    setResponse(key, value);
  }, [value]);

  return [value, setValue] as const;
}
