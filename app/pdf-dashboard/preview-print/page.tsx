'use client';
import { useEffect, useState, Suspense } from 'react';

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
import { Scale } from 'lucide-react';

function PreviewPrintContent() {
  
  const [reportData, setReportData] = useState<FitnessReportData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
const [confirmInput, setConfirmInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const searchParams = useSearchParams();

  // Font loading check
  useEffect(() => {
    const checkFonts = async () => {
      try {
        if ('fonts' in document) {
          await document.fonts.load('400 16px Gerante');
          await document.fonts.load('italic 400 16px Gerante');
          await document.fonts.ready;
        }
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Font loading check failed, proceeding anyway:', error);
        setFontsLoaded(true);
      }
    };
    
    // Small delay to ensure font files are loaded
    setTimeout(checkFonts, 500);
  }, []);



const handleApprove = async () => {
  if (!reportData || loading || !fontsLoaded) {
    alert('⏳ Report is still loading. Please wait a moment before sending.');
    return;
  }

  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).jsPDF;
    const element = document.getElementById('report-container');
    if (!element) throw new Error('Report container not found');

    const pdf = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });

    for (let i = 0; i < element.children.length; i++) {
      const canvas = await html2canvas(element.children[i] as HTMLElement, {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgProps = pdf.getImageProperties(imgData);

      const pdfWidth = 148;
      const pdfHeight = 210;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const yOffset = (pdfHeight - imgHeight) / 2;

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, yOffset > 0 ? yOffset : 0, pdfWidth, imgHeight);
    }

    const pdfBlob = pdf.output('blob');

    // ✅ Build FormData
    const formData = new FormData();
    formData.append('pdf', pdfBlob, 'fitness_report.pdf');
    formData.append('id', reportData.page1?.uniqueId ?? '');
    formData.append('name', reportData.page1?.name ?? '');
    formData.append('email', reportData.page1?.email ?? '');

   const res = await fetch('https://send-pdf-production.up.railway.app/send-pdf', {
  method: 'POST',
  body: formData, // 🔥 No JSON, no base64, just raw binary
});


    if (!res.ok) throw new Error('Failed to send PDF');
    alert('✅ PDF report sent successfully!');
  } catch (err) {
    alert('❌ Error sending PDF: ' + (err instanceof Error ? err.message : String(err)));
  } finally {
    setLoading(false);
    setCooldownSeconds(0);
  }
};

  const handleDownloadPDF = () => { 
    // Set document title for the PDF filename
    const customerName = reportData?.page1?.name || 'Customer';
    const currentDate = new Date().toISOString().split('T')[0];
    const originalTitle = document.title;
    document.title = `${customerName}_fitness_report_${currentDate}`;
    
    // Show instructions first
    setShowInstructions(true);
    
    // Small delay then trigger print dialog
    setTimeout(() => {
      window.print();
      setShowInstructions(false);
    }, 2000);
    
    // Restore original title after a brief delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 3000);
  };
  useEffect(() => {
  if (cooldownSeconds <= 0) return;

  const interval = setInterval(() => {
    setCooldownSeconds((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [cooldownSeconds]);

  useEffect(() => {
    setLoading(true);
    // Try to get data from session storage first
    const sessionData = sessionStorage.getItem('pdfReportData');

    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        setReportData(parsedData);
        // Optional: remove the data from session storage after reading it
        // sessionStorage.removeItem('pdfReportData');
      } catch (error) {
        console.error('Error parsing data from session storage:', error);
        setError('Invalid data format. Please try generating the report again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback to URL params if session storage is empty
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      setError('No data provided. Please access this page through the proper dashboard link.');
      setLoading(false);
      return;
    }

    try {
      const parsedData = JSON.parse(decodeURIComponent(dataParam));
      setReportData(parsedData);
    } catch (error) {
      console.error('Error parsing data from URL:', error);
      setError('Invalid data format. Please try generating the report again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Show loading state
  if (loading || !fontsLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading report data...' : 'Loading fonts...'}
          </p>
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
      {/* Font Preloading */}
      <link 
        rel="preload" 
        href="/fonts/Gerante-Regular.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous"
      />
      <link 
        rel="preload" 
        href="/fonts/Gerante-Italic.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous"
      />
      
      <style>{`
        @font-face {
          font-family: 'Gerante';
          src: url('/fonts/Gerante-Regular.woff2') format('woff2'),
               url('/fonts/Gerante-Regular.woff') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
      
        @font-face {
          font-family: 'Gerante';
          src: url('/fonts/Gerante-Italic.woff2') format('woff2'),
               url('/fonts/Gerante-Italic.woff') format('woff');
          font-weight: 400;
          font-style: italic;
          font-display: swap;
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        * {
          box-sizing: border-box;
        }
        
        /* Optimize for A4/Letter paper with proper scaling */
        @page {
          size: A4;
          margin: 0;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          background: #0E0E0E;
          width: 100%;
          height: 100%;
        }
        
        /* Screen display */
        @media screen {
          html, body {
            width: 631px;
            height: 892px;
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
        }
        
        /* Print optimization */
        @media print {
          html, body {
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .page {
            width: 100% !important;
            height: 100vh !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: scale(1) !important;
            display: block !important;
          }
          
          .last-page {
            width: 100% !important;
            height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: scale(1) !important;
            display: block !important;
            page-break-after: avoid !important;
          }
          
          /* Ensure background graphics are printed */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }
          
          /* Ensure Gerante font is available for components that use it */
          .font-gerante, [class*="font-gerante"] {
            font-family: 'Gerante', 'Georgia', 'Times New Roman', serif !important;
          }
          
          /* Hide scroll bars and other screen elements */
          ::-webkit-scrollbar {
            display: none !important;
          }
        }
        .download-button {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background: #00D4EF;
          color: white;
          border: none;
          border-radius: 50px;
          padding: 15px 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 212, 239, 0.3);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .download-button:hover {
          background: #00B8CC;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 212, 239, 0.4);
        }
        .send{
          
          background: #00D4EF;
          color: white;
          border: none;
          border-radius: 50px;
          padding: 15px 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 212, 239, 0.3);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .send:hover {
          background: #00B8CC;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 212, 239, 0.4);
        }
                @media print {
          .download-button, .instructions-modal {
            display: none !important;
          }
        }
        
        .instructions-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(5px);
        }
        
        .instructions-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          margin: 20px;
          text-align: center;
        }
        
        .instructions-title {
          color: #00D4EF;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .instructions-list {
          text-align: left;
          margin: 20px 0;
          color: #333;
        }
        
        .instructions-list li {
          margin: 8px 0;
          padding-left: 10px;
        }
        
        .instructions-note {
          background: #f0f9ff;
          border: 1px solid #00D4EF;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #0369a1;
          font-size: 14px;
        }
      `}</style>

      {showConfirmModal && (
  <div className="fixed inset-0 z-[1000] bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">📤 Confirm Email</h2>
      <p className="text-gray-600 mb-4">
        Are you sure you want to send this report to the client?
        <br /> Type <span className="font-semibold text-blue-600">confirm</span> to proceed.
      </p>

      <input
        type="text"
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Type 'confirm'"
        value={confirmInput}
        onChange={(e) => setConfirmInput(e.target.value)}
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowConfirmModal(false);
            setConfirmInput('');
          }}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          disabled={confirmInput.trim().toLowerCase() !== 'confirm'}
          onClick={async () => {
            setShowConfirmModal(false);
            setConfirmInput('');
            setCooldownSeconds(120); 
           await handleApprove();
// 2 minutes

          }}
          className={`px-4 py-2 rounded text-sm font-medium text-white ${
            confirmInput.trim().toLowerCase() === 'confirm'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-300 cursor-not-allowed'
          }`}
        >
          Send Email
        </button>
      </div>
    </div>
  </div>
)}

      
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="instructions-modal">
          <div className="instructions-content">
            <div className="instructions-title">📄 Print Settings Guide</div>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              For best results, please use these settings in the print dialog:
            </p>
            <ul className="instructions-list">
              <li>✅ <strong>Destination:</strong> Save as PDF</li>
              <li>✅ <strong>Pages:</strong> All</li>
              <li>✅ <strong>Layout:</strong> Portrait</li>
              <li>✅ <strong>Paper size:</strong> A4 (recommended)</li>
              <li>✅ <strong>Margins:</strong> None or Minimum</li>
              <li>✅ <strong>Scale:</strong> Default (100%)</li>
              <li>✅ <strong>Options:</strong> ☑️ Background graphics</li>
            </ul>
            <div className="instructions-note">
              💡 The print dialog will open automatically in 2 seconds...
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Download Button */}
      <button 
        className="download-button"
        onClick={handleDownloadPDF}
        title="Click to open print dialog and save as PDF"
      >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         </svg>
        Download PDF
      </button>
      <button
  onClick={() => setShowConfirmModal(true)}
  disabled={loading || cooldownSeconds > 0}
  className={`fixed right-60 top-[20px] send ${
    cooldownSeconds > 0 ? 'opacity-60 cursor-not-allowed' : ''
  }`}
>
  {loading
    ? 'Sending...'
    : cooldownSeconds > 0
    ? `Cooldown (${cooldownSeconds}s)`
    : 'Send Report'}
</button>


    <div id="report-container">

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
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function PreviewPrintPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PreviewPrintContent />
    </Suspense>
  );
}
