import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPost } from '../../services/api';

interface ImportJob {
  _id: string;
  filename: string;
  source: string;
  status: string;
  counts: { imported: number; updated: number; skipped: number; failed: number };
  createdAt: string;
}

export function ImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['import-jobs'],
    queryFn: () => apiGet<ImportJob[]>('/imports/jobs'),
  });

  const importMutation = useMutation({
    mutationFn: async (csvFile: File) => {
      const formData = new FormData();
      formData.append('file', csvFile);
      const { data } = await api.post('/imports/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      setFile(null);
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => apiPost('/imports/sync'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['import-jobs'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Product Imports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">CSV Import</h2>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm mb-4"
          />
          <button
            onClick={() => file && importMutation.mutate(file)}
            disabled={!file || importMutation.isPending}
            className="btn-primary"
          >
            {importMutation.isPending ? 'Importing...' : 'Import CSV'}
          </button>
          {importMutation.error && (
            <p className="text-red-600 text-sm mt-2">{(importMutation.error as Error).message}</p>
          )}
          {importMutation.data && (
            <div className="mt-4 p-3 bg-green-50 rounded text-sm text-green-700">
              Imported: {importMutation.data.imported}, Updated: {importMutation.data.updated},
              Skipped: {importMutation.data.skipped}, Failed: {importMutation.data.failed}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">External API Sync</h2>
          <p className="text-sm text-brand-gray mb-4">
            Sync products from external supplier API. Requires API credentials in environment configuration.
          </p>
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="btn-primary"
          >
            {syncMutation.isPending ? 'Syncing...' : 'Sync Products'}
          </button>
          {syncMutation.error && (
            <p className="text-red-600 text-sm mt-2">{(syncMutation.error as Error).message}</p>
          )}
        </div>
      </div>

      <h2 className="font-semibold mb-4">Import History</h2>
      {isLoading && <p className="text-brand-gray">Loading...</p>}
      {jobs && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">File</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Imported</th>
                <th className="text-right px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-4 py-3 font-medium">Failed</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{job.filename}</td>
                  <td className="px-4 py-3 uppercase text-xs">{job.source}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      job.status === 'completed' ? 'bg-green-100 text-green-700' :
                      job.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{job.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{job.counts.imported}</td>
                  <td className="px-4 py-3 text-right">{job.counts.updated}</td>
                  <td className="px-4 py-3 text-right">{job.counts.failed}</td>
                  <td className="px-4 py-3 text-brand-gray">{new Date(job.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
