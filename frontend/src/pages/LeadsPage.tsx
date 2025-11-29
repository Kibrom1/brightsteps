/**
 * Leads Management Page
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../lib/api/leads';
import { LeadStatus } from '../types';
import { EmptyState } from '../components/ui/EmptyState';

export default function LeadsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: leadsApi.getLeads,
  });

  // Temporary create mutation for demo purposes (usually would be a form)
  const createLeadMutation = useMutation({
    mutationFn: leadsApi.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsCreateModalOpen(false);
    },
  });

  const handleCreateDemoLead = () => {
    createLeadMutation.mutate({
      first_name: 'New',
      last_name: 'Lead',
      email: `lead${Date.now()}@example.com`,
      status: LeadStatus.NEW,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 border border-red-100 text-red-700">
        Error loading leads. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leads Management</h1>
            <p className="mt-1 text-slate-500">Track and manage your potential clients and deals.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
                onClick={handleCreateDemoLead}
                className="btn-primary"
            >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Lead
            </button>
          </div>
        </div>

        {leads && leads.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                            {lead.first_name.charAt(0)}{lead.last_name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {lead.first_name} {lead.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full 
                          ${lead.status === LeadStatus.NEW ? 'bg-emerald-100 text-emerald-800' : 
                            lead.status === LeadStatus.CONTACTED ? 'bg-sky-100 text-sky-800' : 
                            lead.status === LeadStatus.QUALIFIED ? 'bg-purple-100 text-purple-800' :
                            'bg-slate-100 text-slate-800'}`}>
                          {lead.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card p-12 flex flex-col items-center justify-center text-center">
             <div className="h-12 w-12 text-slate-300 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
             </div>
             <h3 className="text-lg font-medium text-slate-900">No leads found</h3>
             <p className="mt-1 text-sm text-slate-500 max-w-sm">Get started by adding a new lead to your pipeline to track your potential clients.</p>
             <div className="mt-6">
                 <button
                    onClick={handleCreateDemoLead}
                    className="btn-primary"
                >
                    Add Your First Lead
                </button>
             </div>
          </div>
        )}
      </div>
  );
}
