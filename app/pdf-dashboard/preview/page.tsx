// 'use client';
// import { useState } from 'react';
// import Link from 'next/link';
// import Page1Layout from '@/components/Page1Layout';
// import Page2Layout from '@/components/Page2Layout';
// import Page3Layout from '@/components/Page3Layout';
// import Page4Layout from '@/components/Page4Layout';
// import Page5Layout from '@/components/Page5Layout';
// import Page6Layout from '@/components/Page6Layout';
// import Page7Layout from '@/components/Page7Layout';
// import Page8Layout from '@/components/Page8Layout';
// import Page9Layout from '@/components/Page9Layout';
// import Page10Layout from '@/components/Page10Layout';
// import Page11Layout from '@/components/Page11Layout';
// import Page12Layout from '@/components/Page12Layout';
// import { FitnessReportData } from '@/types/report';
// import sampleData from '@/utils/Kavya_Jain_fitness_report_2025-06-28 (5).json';

// export default function PreviewPage() {
//   const pages = [
//     <Page1Layout data={sampleData.page1} key="p1" />,
//     <Page2Layout data={sampleData.page3} key="p2" />,
//     <Page3Layout data={sampleData.page3} key="p3" />,
//     <Page4Layout key="p4" />,
//     <Page5Layout data={sampleData.page5} key="p5" />,
//     <Page6Layout data={sampleData.page6} key="p6" />,
//     <Page7Layout data={sampleData.page7} key="p7" />,
//     <Page8Layout key="p8" />,
//     <Page9Layout page9={sampleData.page9} page1={sampleData.page1} key="p9" />,
//     <Page10Layout data={sampleData.page10} key="p10" />,
//     <Page11Layout data={sampleData.page11} key="p11" />,
//     <Page12Layout data={sampleData.page12} key="p12" />
//   ];
//   const [current, setCurrent] = useState(0);

//   return (
//     <div className="flex min-h-screen flex-col items-center gap-6 bg-gray-100 p-8">
//       <div className="flex w-full max-w-[631px] items-center justify-between">
//         <Link
//           href="/pdf-dashboard"
//           className="text-blue-600 hover:underline"
//         >
//           ← Back to Dashboard
//         </Link>
//         {/* Paginator */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => setCurrent((i) => Math.max(i - 1, 0))}
//             disabled={current === 0}
//             className="rounded text-white bg-gray-900 px-4 py-2 disabled:opacity-50"
//           >
//             Previous
//           </button>

//           <span>
//             Page {current + 1} of {pages.length}
//           </span>

//           <button
//             onClick={() => setCurrent((i) => Math.min(i + 1, pages.length - 1))}
//             disabled={current === pages.length - 1}
//             className="rounded text-white bg-gray-900 px-4 py-2 disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//       <h1 className="text-2xl font-bold">Preview Pages</h1>

//       {/* Page frame */}
//       <div
//         className="overflow-hidden border border-gray-300 bg-white shadow-lg"
//         style={{
//           width: 631,
//           height: 892,
//         }}
//       >
//         {pages[current]}
//       </div>
//     </div>
//   );
// }
