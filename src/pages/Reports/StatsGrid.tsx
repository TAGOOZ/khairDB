import React from 'react';
import { 
  Users, 
  Home, 
  HeartHandshake, 
  CheckCircle2 
} from 'lucide-react';

interface StatsGridProps {
  stats: {
    totalIndividuals: number;
    totalHouseholds: number;
    activeNeeds: number;
    completedNeeds: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const items = [
    {
      name: 'Total Individuals',
      value: stats.totalIndividuals,
      icon: Users,
      color: 'blue',
    },
    {
      name: 'Total Households',
      value: stats.totalHouseholds,
      icon: Home,
      color: 'green',
    },
    {
      name: 'Active Needs',
      value: stats.activeNeeds,
      icon: HeartHandshake,
      color: 'orange',
    },
    {
      name: 'Completed Needs',
      value: stats.completedNeeds,
      icon: CheckCircle2,
      color: 'purple',
    },
  ];

  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg ${colors[item.color]} flex items-center justify-center`}>
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
