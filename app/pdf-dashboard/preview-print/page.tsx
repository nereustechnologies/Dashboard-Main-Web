'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Page10Layout from "@/components/Page10Layout";
import Page11Layout from "@/components/Page11Layout";
import Page12Layout from "@/components/Page12Layout";
import Page1Layout from "@/components/Page1Layout";
import Page2Layout from "@/components/Page2Layout";
import Page3Layout from "@/components/Page3Layout";
import Page4Layout from "@/components/Page4Layout";
import Page5Layout from "@/components/Page5Layout";
import Page6Layout from "@/components/Page6Layout";
import Page7Layout from "@/components/Page7Layout";
import Page8Layout from "@/components/Page8Layout";
import Page9Layout from "@/components/Page9Layout";
import { FitnessReportData } from '@/lib/report-converter';

export default function PreviewPrintPage() {
  const [reportData, setReportData] = useState<FitnessReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Try to get data from URL params
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      setError('No data provided. Please access this page through the proper dashboard link.');
      setLoading(false);
      return;
    }

    try {
      const parsedData = JSON.parse(decodeURIComponent(dataParam));
      setReportData(parsedData);
      setError(null);
    } catch (error) {
      console.error('Error parsing data from URL:', error);
      setError('Invalid data format. Please try generating the report again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Report</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Unable to load report data. Please try again.'}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, background: "#0E0E0E" }}>
      <style>{`
        @font-face {
          font-family: 'Gerante';
          src: url('/fonts/Gerante-Regular.woff2') format('woff2'),
               url('/fonts/Gerante-Regular.woff') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }
      
        @font-face {
          font-family: 'Gerante';
          src: url('/fonts/Gerante-Italic.woff2') format('woff2'),
               url('/fonts/Gerante-Italic.woff') format('woff');
          font-weight: 400;
          font-style: italic;
          font-display: block;
        }
        * {
          box-sizing: border-box;
        }
        @page {
          size: 631px 892px;
          margin: 0;
        }
        html, body {
          width: 631px;
          height: 892px;
          margin: 0;
          padding: 0;
          background: #0E0E0E;
        }
        .page {
          width: 631px;
          height: 892px;
          page-break-after: always;
          overflow: hidden;
        }
        .last-page {
          width: 631px;
          height: 892px;
          overflow: hidden;
        }
      `}</style>

      <div className="page"><Page1Layout data={reportData.page1} /></div>
      <div className="page"><Page2Layout data={reportData.page3} /></div>
      <div className="page"><Page3Layout data={reportData.page3} /></div>
      <div className="page"><Page4Layout /></div>
      <div className="page"><Page5Layout data={reportData.page5} /></div>
      <div className="page"><Page6Layout data={reportData.page6} /></div>
      <div className="page"><Page7Layout data={reportData.page7} /></div>
      <div className="page"><Page8Layout /></div>
      <div className="page"><Page9Layout page9={reportData.page9} page1={reportData.page1} /></div>
      <div className="page"><Page10Layout data={reportData.page10} /></div>
      <div className="page"><Page11Layout data={reportData.page11} /></div>
      <div className="last-page"><Page12Layout data={reportData.page12} /></div>
    </div>
  );
}
