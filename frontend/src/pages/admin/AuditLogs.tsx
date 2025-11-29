import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/api/admin';

export default function AuditLogs() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
    );
  }

  if (error) {
      return (
        <div className="rounded-xl bg-red-50 p-6 border border-red-100 text-red-700">
            Error loading audit logs.
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Audit Logs</h2>
        <div className="text-sm text-slate-500">
            Displaying last 100 events
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Resource
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.action.includes('login') ? 'bg-blue-100 text-blue-800' :
                        log.action.includes('create') ? 'bg-emerald-100 text-emerald-800' :
                        log.action.includes('delete') ? 'bg-red-100 text-red-800' :
                        log.action.includes('update') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-slate-100 text-slate-800'
                    }`}>
                        {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {log.user_id || <span className="text-slate-400 italic">System</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {log.resource_type} {log.resource_id ? <span className="text-slate-400 text-xs ml-1">#{log.resource_id}</span> : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                    {log.ip_address || '-'}
                  </td>
                </tr>
              ))}
              {logs?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No logs found.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
