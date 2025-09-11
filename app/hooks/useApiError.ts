import { useState } from 'react';

interface UseApiErrorReturn {
  error: string | null;
  setError: (message: string | null) => void;
  clearError: () => void;
  handleApiError: (error: any) => void;
}

export const useApiError = (): UseApiErrorReturn => {
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleApiError = (error: any) => {
    if (typeof error === 'string') {
      setError(error);
    } else if (error && error.message) {
      setError(error.message);
    } else if (error && error.error && error.error.message) {
      setError(error.error.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  return {
    error,
    setError,
    clearError,
    handleApiError,
  };
};
