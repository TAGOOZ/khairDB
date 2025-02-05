import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ReportData {
  stats: {
    totalIndividuals: number;
    totalHouseholds: number;
    activeNeeds: number;
    completedNeeds: number;
  };
  needsByCategory: Array<{
    category: string;
    count: number;
  }>;
  needsStatus: Array<{
    name: string;
    value: number;
  }>;
  needsTrend: Array<{
    date: string;
    count: number;
  }>;
}

export function useReports(dateRange: { start: Date; end: Date }) {
  const [data, setData] = useState<ReportData>({
    stats: {
      totalIndividuals: 0,
      totalHouseholds: 0,
      activeNeeds: 0,
      completedNeeds: 0,
    },
    needsByCategory: [],
    needsStatus: [],
    needsTrend: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReportData() {
      setIsLoading(true);
      try {
        // Fetch statistics
        const [
          { count: totalIndividuals },
          { count: totalHouseholds },
          { count: activeNeeds },
          { count: completedNeeds },
        ] = await Promise.all([
          supabase.from('individuals').select('*', { count: 'exact' }),
          supabase.from('households').select('*', { count: 'exact' }),
          supabase.from('needs').select('*', { count: 'exact' })
            .not('status', 'eq', 'completed')
            .gte('created_at', dateRange.start.toISOString())
            .lte('created_at', dateRange.end.toISOString()),
          supabase.from('needs').select('*', { count: 'exact' })
            .eq('status', 'completed')
            .gte('created_at', dateRange.start.toISOString())
            .lte('created_at', dateRange.end.toISOString()),
        ]);

        // Fetch needs by category
        const { data: categoryData } = await supabase
          .from('needs')
          .select('category')
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());

        const needsByCategory = Object.entries(
          categoryData?.reduce((acc, { category }) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {}
        ).map(([category, count]) => ({ category, count }));

        // Fetch needs status distribution
        const { data: statusData } = await supabase
          .from('needs')
          .select('status')
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());

        const needsStatus = Object.entries(
          statusData?.reduce((acc, { status }) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {}
        ).map(([name, value]) => ({ name, value }));

        // Fetch needs trend
        const { data: trendData } = await supabase
          .from('needs')
          .select('created_at')
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString())
          .order('created_at');

        const needsTrend = trendData?.reduce((acc, { created_at }) => {
          const date = new Date(created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setData({
          stats: {
            totalIndividuals: totalIndividuals || 0,
            totalHouseholds: totalHouseholds || 0,
            activeNeeds: activeNeeds || 0,
            completedNeeds: completedNeeds || 0,
          },
          needsByCategory,
          needsStatus,
          needsTrend: Object.entries(needsTrend || {}).map(([date, count]) => ({
            date,
            count,
          })),
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReportData();
  }, [dateRange]);

  return { data, isLoading };
}
