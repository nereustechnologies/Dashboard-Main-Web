import type { Page7Data } from "@/lib/report-converter";

export default function Page7Layout({ data }: { data: Page7Data }) {
  return (
    <div
      className="relative h-[892px] w-[631px] bg-[#0E0E0E]"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: "30px 30px, 30px 30px",
        backgroundPosition: "0 0, 0 0",
        backgroundRepeat: "repeat, repeat",
        backgroundBlendMode: "normal, normal",
      }}
    >
      <div className="absolute left-0 top-0 h-[892px] w-1 bg-[#00DDF9]" />
      <p className="absolute left-[36px] top-[22px] h-[82px] w-[393px] font-gerante text-[50px] font-normal leading-[82px] tracking-[-0.01em] text-white">
        ENDURANCE
      </p>
      <div className="absolute left-[450px] top-[44px] w-[181px] border-t border-[#00DDF9]" />
      <p className="absolute left-[456px] top-[65px] h-[78px] w-[155px] text-right font-gerante text-[8px] font-normal leading-[13px] tracking-[-0.01em] text-white">
        POWER FADES IF YOU CAN'T SUSTAIN IT. WE MEASURED HOW WELL YOU HOLD
        SPEED, MAINTAIN INTENSITY, AND FIGHT FATIGUE WHEN IT MATTERS MOST.
      </p>

      {/* Plank Hold Section */}
      <div className="absolute left-[68px] top-[178px] h-[127px] w-[195px] text-white">
        <p className="absolute left-[18px] top-0 font-gerante text-[16px] leading-[19px]">
          Plank Hold
        </p>
        <p className="absolute left-0 top-[1px] font-gerante text-[12px] leading-[18px] text-[#00DDF9]">
          1
        </p>
        <div
          className="absolute left-[0.5px] top-[29px] w-[194.5px] border-t border-white/45"
          style={{ borderWidth: "0.3px" }}
        />
        <p className="absolute left-[19px] top-[33px] font-poppins text-[13px] font-medium italic leading-[18px]">
          1 rep
        </p>
        <p className="absolute left-[19px] top-[52px] font-poppins text-[13px] font-medium italic leading-[18px]">
          Duration: {data.plank["Total Hold Duration"]}
        </p>
        <p className="absolute left-[19px] top-[71px] w-[156px] font-poppins text-[9px] italic leading-[12px]">
          Core ,Glutes, Lower Back, Shoulders
        </p>
        <div
          className="absolute left-[0.5px] top-[89px] w-[194.5px] border-t border-white/45"
          style={{ borderWidth: "0.3px" }}
        />
        <p className="absolute left-[19px] top-[93px] font-poppins text-[12px] font-medium leading-[18px]">
          Hip Angle:
        </p>
        <p className="absolute left-[82px] top-[93px] font-poppins text-[12px] font-light leading-[18px]">
          {Math.round(data.plank["Average Hip Angle"])}°
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "99px" }}
        />
        <p className="absolute left-[19px] top-[109px] font-poppins text-[12px] font-medium leading-[18px]">
          Stability:
        </p>
        <p className="absolute left-[73px] top-[109px] font-poppins text-[12px] font-light leading-[18px]">
          {data.plank.Stability || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "115px" }}
        />
      </div>

      {/* Step-Up Endurance Test Section */}
      <div className="absolute left-[354px] top-[178px] h-[127px] w-[195px] text-white">
        <p className="absolute left-[18px] top-0 h-[38px] w-[170px] font-gerante text-[16px] leading-[19px] tracking-[-0.01em]">
          Step-Up Endurance Test
        </p>
        <p className="absolute left-0 top-[1px] font-gerante text-[12px] leading-[18px] text-[#00DDF9]">
          2
        </p>
        <div
          className="absolute left-[0.5px] top-[47px] w-[194.5px] border-t border-white/45"
          style={{ borderWidth: "0.3px" }}
        />
        <p className="absolute left-[19px] top-[51px] font-poppins text-[13px] font-medium italic leading-[18px]">
          Duration: {data.step_up.duration ? `${data.step_up.duration}s` : "N/A"}
        </p>
        <p className="absolute left-[19px] top-[70px] w-[139px] font-poppins text-[9px] italic leading-[12px]">
          Hamstrings, Quadriceps, Glutes
        </p>
        <div
          className="absolute left-[0.5px] top-[90px] w-[194.5px] border-t border-white/45"
          style={{ borderWidth: "0.3px" }}
        />
        <p className="absolute left-[19px] top-[94px] font-poppins text-[12px] font-medium leading-[18px]">
          No. of Reps:
        </p>
        <p className="absolute left-[91px] top-[94px] font-poppins text-[12px] font-light leading-[18px]">
          {data.step_up.rep_count ?? "N/A"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "100px" }}
        />
        <p className="absolute left-[19px] top-[109px] font-poppins text-[12px] font-medium leading-[18px]">
          Rep time:
        </p>
        <p className="absolute left-[80px] top-[109px] font-poppins text-[12px] font-light leading-[18px]">
          {data.step_up.rep_time ? `${data.step_up.rep_time.toFixed(1)}s` : "N/A"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "115px" }}
        />
      </div>

      <div
        className="absolute left-[315px] top-[157px] h-[361px] w-0 border-l border-white/45"
        style={{ borderWidth: "0.3px" }}
      />

      <img
        src="/images/page-7-img.png"
        alt="page 7 decoration"
        className="absolute left-[399px] top-[505px] h-[154px] w-[166px]"
      />

      <div className="absolute left-[585px] top-[596px] w-[46px] border-t border-[#00DDF9]" />
      <img
        src="/images/nereus-icon-brand.svg"
        alt="logo"
        className="absolute left-[590px] top-[562px] h-[28px] w-[31.59px]"
      />
      <div className="absolute left-[31px] top-[596px] w-[344px] border-t border-[#00DDF9]" />
      <p className="absolute left-[34px] top-[615px] h-[30px] w-[207px] font-poppins text-[13px] font-semibold italic leading-[15px] tracking-[-0.01em] text-white">
        Your Endurance Sets Your Pace. Here's What It Says:
      </p>

      {/* Group 37 */}
      <div className="absolute left-[78px] top-[695px] h-[116px] w-[187px] text-white">
        <p className="absolute left-0 top-0 h-[46px] w-[187px] font-gerante text-[16px] italic leading-[23px] tracking-[-0.04em]">
          {data.summary?.[0]?.title || "Endurance Assessment"}
        </p>
        <div
          className="absolute left-[1px] top-[55px] w-[146px] border-t border-[#00DDF9]"
          style={{ borderWidth: "0.6px" }}
        />
        <p className="absolute left-0 top-[71px] h-[45px] w-[167.6px] font-poppins text-[12px] font-light leading-[15px] tracking-[-0.01em]">
          {data.summary?.[0]?.paragraph || "Good endurance foundation."}
        </p>
      </div>

      {/* Group 38 */}
      <div className="absolute left-[346px] top-[695px] h-[131px] w-[241px] text-white">
        <p className="absolute left-0 top-0 h-[46px] w-[241px] font-gerante text-[16px] italic leading-[23px] tracking-[-0.04em]">
          {data.summary?.[1]?.title || "Endurance Focus"}
        </p>
        <div
          className="absolute left-[1px] top-[55px] w-[163px] border-t border-[#00DDF9]"
          style={{ borderWidth: "0.6px" }}
        />
        <p className="absolute left-0 top-[71px] h-[60px] w-[216px] font-poppins text-[12px] font-light leading-[15px] tracking-[-0.01em]">
          {data.summary?.[1]?.paragraph || "Focus on endurance improvement."}
        </p>
      </div>
      <div
        className="absolute left-[304px] top-[714px] h-[102px] w-0 border-l border-white/45"
        style={{ borderWidth: "0.3px" }}
      />
      <div className="absolute left-[89px] top-[854px] h-[13px] w-[300px] font-gerante text-[8px] leading-[13px] tracking-[-0.05em] text-white">
        Every exercise performed. Every muscle engaged.
      </div>
      <div
        className="absolute left-[87px] top-[871px] w-[394px] border-t border-white/45"
        style={{ borderWidth: "0.6px" }}
      />
      <div className="absolute left-[18px] top-[865px] flex w-[604.5px] items-center justify-between">
        <p className="font-gerante text-[8px] leading-[13px] tracking-[-0.01em] text-[#00DDF9]">
          6
        </p>
        <div className="flex items-center gap-[9px]">
          <img
            src="/images/brand-arrow.svg"
            alt="brand arrow"
            className="h-[10px] w-[32px]"
          />
          <p className="font-gerante text-[8px] leading-[13px] tracking-[-0.01em] text-white">
            Scoring System
          </p>
        </div>
      </div>
    </div>
  );
}
