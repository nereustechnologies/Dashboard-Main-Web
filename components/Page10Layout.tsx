import { Page10Data } from "@/lib/report-converter";

export default function Page10Layout({ data }: Readonly<{ data: Page10Data }>) {
  // Inline style for dashed lines (not directly possible in Tailwind)
  const dashedLineStyle = {
    height: 0.5,
    width: "100%",
    backgroundImage:
      "repeating-linear-gradient(to right, #D1D1D1 0, #D1D1D1 4px, transparent 4px, transparent 8px)",
    position: "absolute" as const,
    zIndex: 2,
  };

  return (
    <div className="relative w-full h-full">
      {/* Main content */}
      <div
        className="w-full h-full bg-[#0E0E0E] text-white"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="relative w-full h-full">
          {/* TRAINING WITH PURPOSE */}
          <div
            className="absolute font-gerante text-[32px] leading-[52.74px] tracking-[0.06em]"
            style={{ left: 24, top: 34, width: 580, height: 53 }}
          >
            TRAINING WITH PURPOSE
          </div>

          {/* Subheader */}
          <div className="absolute" style={{ left: 34, top: 104, width: 537 }}>
            <p className="font-poppins text-[17px] leading-[14px]">
              Your blueprint for progress
            </p>
            <p className="font-poppins italic text-[13px] leading-[15px] font-light mt-[11px] tracking-[-0.01em]">
              Based on expert analysis and data from your session, here's how
              you can refine your strengths, address imbalances, and reduce
              injury risk.
            </p>
          </div>

          {/* Background Rectangles */}
          <div
            className="absolute bg-[#00DDF9]/25 border border-[#00DDF9]"
            style={{ left: 19, top: 192, width: 592, height: 184 }}
          />
          <div
            className="absolute bg-[#00DDF9]/25 border border-[#00DDF9]"
            style={{ left: 19, top: 384, width: 592, height: 213 }}
          />
          <div
            className="absolute bg-[#00DDF9]/25 border border-[#00DDF9]"
            style={{ left: 19, top: 605, width: 592, height: 231 }}
          />

          {/* Section Titles & Subtitles */}
          {/* Expand Your Strengths */}
          <div className="absolute" style={{ left: 127, top: 199, width: 377 }}>
            <div className="flex items-center justify-center gap-3">
              <img
                src="/images/trending-up.svg"
                alt="trending up"
                className="h-6 w-6"
              />
              <div className="font-gerante text-[16px] leading-[28px] tracking-[-0.04em]">
                Expand Your Strengths
              </div>
            </div>
            <div className="font-poppins text-[14px] text-[#00DDF9] leading-[16px] tracking-[-0.02em] text-center italic mt-[6px]">
              Try 3 new training styles that suit your body and goals.
            </div>
          </div>

          {/* Targeted Improvements */}
          <div className="absolute" style={{ left: 127, top: 391, width: 377 }}>
            <div className="flex items-center justify-center gap-3">
              <img
                src="/images/crosshair.svg"
                alt="crosshair"
                className="h-6 w-6"
              />
              <div className="font-gerante text-[16px] leading-[28px] tracking-[-0.04em]">
                Targeted Improvements
              </div>
            </div>
            <div className="font-poppins text-[14px] text-[#00DDF9] leading-[16px] tracking-[-0.02em] text-center italic mt-[6px]">
              Boost your 3 lowest scores with targeted tips and actions.
            </div>
          </div>

          {/* Injury Risk Assessment */}
          <div className="absolute" style={{ left: 127, top: 614, width: 377 }}>
            <div className="flex items-center justify-center gap-3">
              <img src="/images/search.svg" alt="search" className="h-6 w-6" />
              <div className="font-gerante text-[16px] leading-[28px] tracking-[-0.04em]">
                Injury Risk Assessment
              </div>
            </div>
            <div className="font-poppins text-[14px] text-[#00DDF9] leading-[16px] tracking-[-0.02em] text-center italic mt-[6px]">
              Spot your top 3 injury risks—and learn how to avoid them.
            </div>
          </div>

          {/* Content Sections */}
          {/* Section 1 Content */}
          <div
            className="absolute flex gap-[40px]"
            style={{ left: 37, top: 265 }}
          >
            {data.strengths.map((strength, index) => (
              <div key={index} style={{ width: 159, height: 93 }}>
                <div className="flex items-center gap-1">
                  <span className="text-[#00DDF9] text-lg">•</span>
                  <span className="font-poppins font-semibold text-xs text-[#00DDF9] tracking-[-0.02em] italic">
                    {strength.title}
                  </span>
                </div>
                <p className="font-poppins text-[10px] leading-[15px] tracking-[-0.02em] ml-2.5">
                  {strength.paragraph}
                </p>
              </div>
            ))}
          </div>

          {/* Section 2 Content */}
          <div
            className="absolute flex gap-[38px]"
            style={{ left: 38, top: 455 }}
          >
            {data.improvements.map((improvement, index) => (
              <div key={index} style={{ width: 160, height: 123 }}>
                <div className="flex items-center gap-1">
                  <span className="text-[#00DDF9] text-lg">•</span>
                  <span className="font-poppins font-semibold text-xs text-[#00DDF9] tracking-[-0.02em] italic">
                    {improvement.title}
                  </span>
                </div>
                <p className="font-poppins text-[10px] leading-[15px] tracking-[-0.02em] ml-2.5">
                  {improvement.paragraph}
                </p>
              </div>
            ))}
          </div>

          {/* Section 3 Content */}
          <div
            className="absolute flex gap-[40px]"
            style={{ left: 38, top: 682 }}
          >
            {data.risks.map((risk, index) => (
              <div key={index} style={{ width: 159, height: 138 }}>
                <div className="flex items-center gap-1">
                  <span className="text-[#00DDF9] text-lg">•</span>
                  <span className="font-poppins font-semibold text-xs text-[#00DDF9] tracking-[-0.02em] italic">
                    {risk.title}
                  </span>
                </div>
                <p className="font-poppins text-[10px] leading-[15px] tracking-[-0.02em] ml-2.5">
                  {risk.paragraph}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="absolute flex items-center justify-between"
            style={{ left: 18, top: 865, width: "604.5px" }}
          >
            <span className="font-gerante text-[8px] text-[#00DDF9]">9</span>
            <div className="flex items-center gap-2">
              <img
                src="/images/brand-arrow.svg"
                alt="Brand Arrow"
                className="w-[32px] h-[10px]"
              />
              <span className="font-gerante text-[8px]">
                THE NEXT MOVE IS YOURS.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
