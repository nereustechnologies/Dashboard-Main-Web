'use client';
import { useEffect, useState } from 'react';

type ClientWithReport = {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  uniqueId: string;
  fitnessReport: {
    reportURL: string;
    approvedAt: string;
  } | null;
};

export default function ApprovedReportsPage() {
  const [clients, setClients] = useState<ClientWithReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/approved-reports')
      .then(res => res.json())
      .then(data => {
        setClients(data.clients);
      })
      .catch(err => console.error('Failed to fetch approved reports:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">✅ Approved Fitness Reports</h1>
      {loading ? (
        <p>Loading...</p>
      ) : clients.length === 0 ? (
        <p>No approved reports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold">
                <th className="p-3 border">Unique ID</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Approved At</th>
                <th className="p-3 border">Preview</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="text-sm border-t hover:bg-gray-50">
                  <td className="p-3">{client.uniqueId}</td>
                  <td className="p-3">{client.fullName}</td>
                  <td className="p-3">{client.email}</td>
                  <td className="p-3">{client.whatsapp}</td>
                  <td className="p-3">
                    {client.fitnessReport?.approvedAt
                      ? new Date(client.fitnessReport.approvedAt).toLocaleString()
                      : '-'}
                  </td>
                  <td className="p-3">
                    <a
                      href={client.fitnessReport?.reportURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Preview
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
