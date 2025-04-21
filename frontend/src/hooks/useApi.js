import { useState, useEffect } from 'react';
import { handleApiError } from '../utils/errorHandler';

export function useApi(apiCall, initialData = [], dependencies = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCall();
        setData(response.data);
        setError('');
      } catch (err) {
        handleApiError(err, setError);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error };
}
