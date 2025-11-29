import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/api/admin';

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  });

  if (isLoading) return <div>Loading stats...</div>;
  if (error) return <div className="text-red-600">Error loading stats</div>;

  if (!stats) return null;

  const statCards = [
    { name: 'Total Users', value: stats.total_users, color: 'bg-blue-500' },
    { name: 'Total Properties', value: stats.total_properties, color: 'bg-green-500' },
    { name: 'Total Deals', value: stats.total_deals, color: 'bg-purple-500' },
    { name: 'Total Leads', value: stats.total_leads, color: 'bg-yellow-500' },
    { name: 'Active Subscriptions', value: stats.active_subscriptions, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                  {/* Icon placeholder */}
                  <div className="h-6 w-6 text-white font-bold flex items-center justify-center">
                    {card.name[0]}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{card.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Future: Charts, Recent Activity List */}
    </div>
  );
}

