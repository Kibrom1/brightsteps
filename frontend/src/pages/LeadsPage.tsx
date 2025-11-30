/**
 * Leads Management Page
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../lib/api/leads';
import { LeadStatus, type Lead } from '../types';

export default function LeadsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
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

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lead> }) => 
      leadsApi.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setEditingLead(null);
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

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLead) return;

    const formData = new FormData(e.currentTarget);
    const updateData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      status: formData.get('status') as LeadStatus,
      source: formData.get('source') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    updateLeadMutation.mutate({ id: editingLead.id, data: updateData });
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
                        <button 
                          onClick={() => handleEdit(lead)}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          Edit
                        </button>
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

        {/* Edit Modal */}
        {editingLead && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
                onClick={() => setEditingLead(null)}
              ></div>

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSaveEdit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-slate-900" id="modal-title">
                        Edit Lead
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingLead(null)}
                        className="text-slate-400 hover:text-slate-500"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="first_name" className="block text-sm font-medium text-slate-700">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            required
                            defaultValue={editingLead.first_name}
                            className="mt-1 input-field"
                          />
                        </div>
                        <div>
                          <label htmlFor="last_name" className="block text-sm font-medium text-slate-700">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            required
                            defaultValue={editingLead.last_name}
                            className="mt-1 input-field"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          defaultValue={editingLead.email || ''}
                          className="mt-1 input-field"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          defaultValue={editingLead.phone || ''}
                          className="mt-1 input-field"
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
                          Status
                        </label>
                        <select
                          name="status"
                          id="status"
                          defaultValue={editingLead.status}
                          className="mt-1 input-field"
                        >
                          <option value={LeadStatus.NEW}>New</option>
                          <option value={LeadStatus.CONTACTED}>Contacted</option>
                          <option value={LeadStatus.QUALIFIED}>Qualified</option>
                          <option value={LeadStatus.LOST}>Lost</option>
                          <option value={LeadStatus.CLOSED}>Closed</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="source" className="block text-sm font-medium text-slate-700">
                          Source
                        </label>
                        <input
                          type="text"
                          name="source"
                          id="source"
                          defaultValue={editingLead.source || ''}
                          placeholder="e.g., Website, Referral"
                          className="mt-1 input-field"
                        />
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          id="notes"
                          rows={3}
                          defaultValue={editingLead.notes || ''}
                          className="mt-1 input-field"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={updateLeadMutation.isPending}
                      className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {updateLeadMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingLead(null)}
                      className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
