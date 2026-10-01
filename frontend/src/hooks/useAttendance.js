import { useState, useEffect, useCallback } from 'react';
import { attendanceApi } from '../services/api';

export const useAttendance = (params = {}) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.getAll(params);
      setAttendance(response.data || []);
      setPagination({
        page: response.page || 1,
        pages: response.pages || 1,
        total: response.total || 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return { attendance, loading, error, pagination, refetch: fetchAttendance };
};
