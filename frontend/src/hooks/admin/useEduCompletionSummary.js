import { useCallback, useEffect, useState } from 'react';
import { getAdminProgress } from '../../api/eduApi';

// 관리자 대시보드 "교육 완료 현황" 요약.
// 진도 목록 API의 페이지네이션 totalElements만 활용해 전체/완료 건수를 집계한다.
// (size:1로 목록 본문은 받지 않고 카운트만 얻는다. 상세는 교육 관리 페이지에서 확인)
const useEduCompletionSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [totalRes, completedRes] = await Promise.all([
        getAdminProgress({ page: 0, size: 1 }),
        getAdminProgress({ page: 0, size: 1, isCompleted: true }),
      ]);
      const total = totalRes?.data?.totalElements ?? 0;
      const completed = completedRes?.data?.totalElements ?? 0;
      setSummary({ total, completed });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error };
};

export default useEduCompletionSummary;
