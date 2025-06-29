import type { Page11Data } from "@/lib/report-converter";
import React from "react";

const Page11Layout: React.FC<{ data: Page11Data }> = ({ data }) => {
  return (
    <div
      className="relative w-full h-full bg-[#0E0E0E]"
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
      <img
        src="/images/nereus-icon.svg"
        alt="logo"
        className="absolute left-[5px] top-[7.89px] h-[30.14px] w-[34px]"
      />
      <p className="absolute left-[48px] top-[76px] h-[82px] w-[578px] font-gerante text-[50px] leading-[82px] text-white">
        THE NEXT MOVE
      </p>
      <p className="absolute left-[48px] top-[136px] h-[82px] w-[299px] font-gerante text-[50px] leading-[82px] text-white">
        IS YOURS
      </p>
      <div className="absolute left-[376px] top-[208px] w-[255px] border-t border-[#00DDF9]" />
      <p className="absolute left-[49px] top-[231px] h-[18px] w-[360px] font-poppins text-[15px] font-semibold italic leading-[18px] text-white">
        This report means nothing unless you act on it.
      </p>
      <p className="absolute left-[63px] top-[305px] h-[43px] w-[430px] font-gerante text-[18px] leading-[30px] text-white">
        NEXT TIME, HERE'S WHAT YOU BEAT
      </p>
      <div className="absolute left-[48px] top-[365px] h-[308px] w-[535px]">
        <img
          src="/images/page-11-rectangle.svg"
          alt="rectangle"
          className="absolute left-0 top-0 h-full w-full"
        />
        <div className="absolute left-[208px] top-0 h-full w-0 border-l border-[#00DDF9]" />
        <div className="absolute left-0 top-[103px] w-full border-t border-[#00DDF9]" />
        <div className="absolute left-0 top-[205px] w-full border-t border-[#00DDF9]" />

        {data.metrics.map((metric, index) => (
          <React.Fragment key={index}>
            <div
              className="absolute left-[23px] flex w-[140px] flex-col items-start gap-2"
              style={{ top: `${22 + index * 102}px` }}
            >
              <p className="h-auto w-full font-poppins text-[19px] font-light italic leading-[24px] text-white">
                {metric.name}:
              </p>
              <p className="h-[14px] w-full font-poppins text-[19px] font-light italic leading-[14px] text-white">
                {metric.current_score}
                {metric.unit !== "score" && ` ${metric.unit}`}
              </p>
            </div>
            <img
              src="/images/page-11-polygon.svg"
              alt="polygon"
              className="absolute left-[172px] h-[24px] w-[24px]"
              style={{ top: `${59 + index * 105}px` }}
            />
            <p
              className="absolute left-[252px] font-poppins text-[68px] font-medium leading-[77px] text-white"
              style={{ top: `${20 + index * 102}px` }}
            >
              {metric.target_score}
            </p>
            <p
              className="absolute left-[373px] font-poppins text-[32px] font-medium leading-[48px] text-white"
              style={{ top: `${46 + index * 102}px` }}
            >
              {metric.unit !== "score" && metric.unit.toUpperCase()}
            </p>
          </React.Fragment>
        ))}
      </div>
      <p className="absolute left-[128px] top-[838px] h-[20px] w-[469px] font-gerante text-[12px] leading-[20px] tracking-[0.02em] text-[#00DDF9]">
        Your movement is data-driven. Your progress is personal.
      </p>
      <div className="absolute left-[18px] top-[865px] flex h-[13px] w-[604.5px] flex-row items-center justify-between p-0">
        <p className="font-gerante text-[8px] font-normal leading-[13px] tracking-[-0.01em] text-[#00DDF9]">
          10
        </p>
      </div>
    </div>
  );
};

export default Page11Layout;
