import React, { useState, useEffect } from 'react';
    import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
    import { Users, Home, AlertCircle, CheckCircle2 } from 'lucide-react';
    import { useIndividuals } from '../hooks/useIndividuals';
    import { useFamilies } from '../hooks/useFamilies';
    import { PendingRequests } from './Dashboard/PendingRequests';
    import { supabase } from '../lib/supabase';
    
    const mockData = [
      { category: 'Medical', count: 45 },
      { category: 'Financial', count: 32 },
      { category: 'Food', count: 28 },
      { category: 'Shelter', count: 15 },
      { category: 'Education', count: 20 },
    ];
    
    export function Dashboard() {
      const { families } = useFamilies();
      const [whitelistCount, setWhitelistCount] = useState(0);
      const [blacklistCount, setBlacklistCount] = useState(0);
      const [waitinglistCount, setWaitinglistCount] = useState(0);
      const [isLoading, setIsLoading] = useState(true);
    
      useEffect(() => {
        async function fetchCounts() {
          setIsLoading(true);
          try {
            const [
              { count: whitelist },
              { count: blacklist },
              { count: waitinglist },
            ] = await Promise.all([
              supabase.from('individuals').select('*', { count: 'exact' }),
              supabase.from('blacklist_individuals').select('*', { count: 'exact' }),
              supabase.from('waitinglist_individuals').select('*', { count: 'exact' }),
            ]);
    
            setWhitelistCount(whitelist || 0);
            setBlacklistCount(blacklist || 0);
            setWaitinglistCount(waitinglist || 0);
          } catch (error) {
            console.error('Error fetching counts:', error);
          } finally {
            setIsLoading(false);
          }
        }
    
        fetchCounts();
      }, []);
    
      return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Whitelisted Individuals"
              value={whitelistCount.toString()}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Blacklisted Individuals"
              value={blacklistCount.toString()}
              icon={Users}
              color="red"
            />
            <StatCard
              title="Waitinglist Individuals"
              value={waitinglistCount.toString()}
              icon={Users}
              color="orange"
            />
            <StatCard
              title="Total Families"
              value={families.length.toString()}
              icon={Home}
              color="green"
            />
            <StatCard
              title="Urgent Needs"
              value="12"
              icon={AlertCircle}
              color="red"
            />
            <StatCard
              title="Completed Cases"
              value="156"
              icon={CheckCircle2}
              color="purple"
            />
          </div>
    
          {/* Pending Requests Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <PendingRequests />
          </div>
    
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Needs by Category</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // StatCard component remains the same
    function StatCard({ title, value, icon: Icon, color }: {
      title: string;
      value: string;
      icon: React.ElementType;
      color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
    }) {
      const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
      };
    
      return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {title}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      );
    }
