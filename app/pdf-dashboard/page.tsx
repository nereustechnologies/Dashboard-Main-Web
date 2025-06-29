'use client';
import Link from 'next/link';

export default function PdfDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">PDF Dashboard</h1>
      <div className="flex gap-4">
        <Link
          href="/pdf-dashboard/preview"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Preview Pages
        </Link>
        <Link
          href="/pdf-dashboard/download"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Download PDF
        </Link>
      </div>
    </div>
  );
}
