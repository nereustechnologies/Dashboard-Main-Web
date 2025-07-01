import type { Page6Data } from "@/lib/report-converter";

export default function Page6Layout({ data }: { data: Page6Data }) {
  return (
    <div
      className="relative w-[631px] h-[892px] bg-[#0E0E0E]"
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
      <p className="absolute left-[36px] top-[22px] h-[82px] w-[353px] font-gerante text-[50px] font-normal leading-[82px] tracking-[-0.01em] text-white">
        STRENGTH
      </p>
      <div className="absolute left-[411px] top-[44px] w-[220px] border-t border-[#00DDF9]" />
      <p className="absolute left-[409px] top-[65px] h-[65px] w-[197px] text-right font-gerante text-[8px] font-normal leading-[13px] tracking-[-0.01em] text-white">
        STRENGTH ISN'T JUST ABOUT LIFTING —IT'S ABOUT CONTROL. WE TESTED HOW
        WELL YOU PRODUCE POWER, STABILIZE UNDER LOAD, AND TRANSLATE EFFORT INTO
        MOVEMENT.
      </p>
      {/* Squats Section */}
      <div className="absolute left-[68px] top-[178px] h-[216px] w-[231px] text-white">
        <p className="absolute left-[18px] top-0 font-gerante text-[16px] leading-[19px]">
          Squats
        </p>
        <p className="absolute left-0 top-[1px] font-gerante text-[12px] leading-[18px] text-[#00DDF9]">
          1
        </p>
        <div
          className="absolute left-[0.5px] top-[29px] w-[194.5px] border-t border-white/45"
          style={{ borderWidth: "0.3px" }}
        />
        <p className="absolute left-[19px] top-[33px] font-poppins text-[13px] font-medium italic leading-[18px]">
          {data.squats["Rep Count"]} reps
        </p>
        <p className="absolute left-[19px] top-[52px] font-poppins text-[13px] font-medium italic leading-[18px]">
          Duration: 60s
        </p>
        <p className="absolute left-[19px] top-[71px] w-[158px] font-poppins text-[9px]  leading-[12px]">
          Quadriceps & Hamstrings, Glutes, Calves & Ankles, Core & Lower Back
        </p>
        <div
          className="absolute left-[0.5px] top-[101px] w-[194.5px] border-t border-white/45"
          style={{ borderWidth: "0.3px" }}
        />
        <p className="absolute left-[19px] top-[105px] font-poppins text-[12px] font-medium leading-[18px]">
          Squat Depth Rating:
        </p>
        <p className="absolute left-[141px] top-[105px] font-poppins text-[12px] font-light leading-[18px]">
          {data.squats["Squat Depth Rating"] || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "110.5px" }}
        />

        <p className="absolute left-[19px] top-[120px] font-poppins text-[12px] font-medium leading-[18px]">
          Repetition Consistency:
        </p>
        <p className="absolute left-[161px] top-[120px] font-poppins text-[12px] font-light leading-[18px]">
          {data.squats["Repetition Consistency"] || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "125.5px" }}
        />

        <p className="absolute left-[19px] top-[135px] font-poppins text-[12px] font-medium leading-[18px]">
          Stability:
        </p>
        <p className="absolute left-[73px] top-[135px] font-poppins text-[12px] font-light leading-[18px]">
          {data.squats["Stability"] || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "140.5px" }}
        />

        <p className="absolute left-[19px] top-[151px] font-poppins text-[12px] font-medium leading-[18px]">
          Max Knee Flexion Angle:
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "156.5px" }}
        />

        <p className="absolute left-[32px] top-[165px] font-poppins text-[12px] font-medium italic leading-[18px]">
          Left Leg:
        </p>
        <p className="absolute left-[83px] top-[165px] font-poppins text-[12px] font-light leading-[18px]">
          {Math.round(data.squats["Left Knee Flexion Avg"])}°
        </p>

        <p className="absolute left-[32px] top-[180px] font-poppins text-[12px] font-medium italic leading-[18px]">
          Right Leg:
        </p>
        <p className="absolute left-[93px] top-[180px] font-poppins text-[12px] font-light leading-[18px]">
          {Math.round(data.squats["Right Knee Flexion Avg"])}°
        </p>

        <p className="absolute left-[19px] top-[198px] font-poppins text-[12px] font-medium leading-[18px]">
          Fatigue Score:
        </p>
        <p className="absolute left-[107px] top-[198px] font-poppins text-[12px] font-light leading-[18px]">
          {data.squats["Fatigue Score"] || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "203.5px" }}
        />
      </div>
      {/* Vector 84 - vertical line */}
      <div
        className="absolute border-l border-white/45"
        style={{
          left: "315px",
          top: "157px",
          height: "361px",
          width: "0px",
          borderWidth: "0.3px",
        }}
      />
      {/* Lunges Section */}
      <div className="absolute left-[354px] top-[178px] h-[216px] w-[231px] text-white">
        <p className="absolute left-[18px] top-0 font-gerante text-[16px] leading-[19px]">
          Lunges
        </p>
        <p className="absolute left-0 top-[1px] font-gerante text-[12px] leading-[18px] text-[#00DDF9]">
          2
        </p>
        <div
          className="absolute left-[0.5px] top-[29px] w-[194.5px] border-t border-white/45"
          style={{ borderWidth: "0.3px" }}
        />
        <p className="absolute left-[19px] top-[33px] font-poppins text-[13px] font-medium italic leading-[18px]">
          {data.lunges["Rep Count"]} reps
        </p>
        <p className="absolute left-[19px] top-[52px] font-poppins text-[13px] font-medium italic leading-[18px]">
          Duration: {data.lunges["Total Duration"]}
        </p>
        <p className="absolute left-[19px] top-[71px] w-[158px] font-poppins text-[9px]  leading-[12px]">
          Quadriceps & Hamstrings, Glutes, Calves & Ankles, Core & Lower Back
        </p>
        <div
          className="absolute left-[0.5px] top-[101px] w-[194.5px] border-t border-white/45"
          style={{ borderWidth: "0.3px" }}
        />
        <p className="absolute left-[19px] top-[105px] font-poppins text-[12px] font-medium leading-[18px]">
          Lunge Depth Rating:
        </p>
        <p className="absolute left-[141px] top-[105px] font-poppins text-[12px] font-light leading-[18px]">
          {data.lunges["Lunge Depth Rating"] || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "110.5px" }}
        />

        <p className="absolute left-[19px] top-[120px] font-poppins text-[12px] font-medium leading-[18px]">
          Repetition Consistency:
        </p>
        <p className="absolute left-[161px] top-[120px] font-poppins text-[12px] font-light leading-[18px]">
          {data.lunges["Repetition Consistency"] || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "125.5px" }}
        />

        <p className="absolute left-[19px] top-[135px] font-poppins text-[12px] font-medium leading-[18px]">
          Stability:
        </p>
        <p className="absolute left-[73px] top-[135px] font-poppins text-[12px] font-light leading-[18px]">
          {data.lunges.Stability || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "140.5px" }}
        />

        <p className="absolute left-[19px] top-[151px] font-poppins text-[12px] font-medium leading-[18px]">
          Max Knee Flexion Angle:
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "156.5px" }}
        />

        <p className="absolute left-[32px] top-[165px] font-poppins text-[12px] font-medium italic leading-[18px]">
          Left Leg:
        </p>
        <p className="absolute left-[83px] top-[165px] font-poppins text-[12px] font-light leading-[18px]">
          {Math.round(data.lunges["Average Knee Angle Left"])}°
        </p>

        <p className="absolute left-[32px] top-[180px] font-poppins text-[12px] font-medium italic leading-[18px]">
          Right Leg:
        </p>
        <p className="absolute left-[93px] top-[180px] font-poppins text-[12px] font-light leading-[18px]">
          {Math.round(data.lunges["Average Knee Angle Right"])}°
        </p>

        <p className="absolute left-[19px] top-[198px] font-poppins text-[12px] font-medium leading-[18px]">
          Fatigue Score:
        </p>
        <p className="absolute left-[107px] top-[198px] font-poppins text-[12px] font-light leading-[18px]">
          {data.lunges["Fatigue Score"] || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "203.5px" }}
        />
      </div>
      {/* Vector 86 */}
      <div className="absolute left-[31px] top-[566px] w-[344px] border-t border-[#00DDF9]" />
      {/* Image */}
      <img
        src="/images/page-6-img.png"
        alt="decoration"
        className="absolute left-[349px] top-[424px] h-[232px] w-[229px]"
      />
      {/* Logo */}
      <img
        src="/images/nereus-icon-brand.svg"
        alt="logo"
        className="absolute left-[590px] top-[562px] h-[28px] w-[31.59px]"
      />
      {/* Vector 93 */}
      <div className="absolute left-[585px] top-[596px] w-[46px] border-t border-[#00DDF9]" />
      {/* Strength subtitle */}
      <p className="absolute left-[34px] top-[585px] h-[30px] w-[173px] font-poppins text-[13px] font-semibold italic leading-[15px] tracking-[-0.01em] text-white">
        Your Strength Fuels Power. Here's What It Says:
      </p>
      {/* Group 37 */}
      <p className="absolute left-[39px] top-[695px] h-[46px] w-[241px] font-gerante text-[16px] italic leading-[23px] tracking-[-0.04em] text-white">
        {data.summary?.[0]?.title || "Strength Assessment"}
      </p>
      <div
        className="absolute left-[40px] top-[750px] w-[232px] border-t border-[#00DDF9]"
        style={{ borderWidth: "0.6px" }}
      />
      <p className="absolute left-[39px] top-[766px] h-[45px] w-[241px] font-poppins text-[12px] font-light leading-[15px] tracking-[-0.01em] text-white">
        {data.summary?.[0]?.paragraph || "Good strength foundation established."}
      </p>
      {/* Group 38 */}
      <p className="absolute left-[348px] top-[675px] h-[69px] w-[241px] font-gerante text-[16px] italic leading-[23px] tracking-[-0.04em] text-white">
        {data.summary?.[1]?.title || "Strength Focus"}
      </p>
      <div
        className="absolute left-[349px] top-[752px] w-[232px] border-t border-[#00DDF9]"
        style={{ borderWidth: "0.6px" }}
      />
      <p className="absolute left-[348px] top-[768px] h-[45px] w-[235px] font-poppins text-[12px] font-light leading-[15px] tracking-[-0.01em] text-white">
        {data.summary?.[1]?.paragraph || "Continue building strength consistency."}
      </p>
      <p className="absolute left-[89px] top-[854px] h-[13px] w-[400px] font-gerante text-[8px] leading-[13px] tracking-[-0.05em] text-white">
        Your complete movement breakdown — every exercise, every metric.
      </p>
      <div
        className="absolute left-[87px] top-[871px] w-[418px] border-t border-white/45"
        style={{ borderWidth: "0.6px" }}
      />
      {/* Frame 10 footer */}
      <div
        className="absolute flex flex-row justify-between items-center left-[18px] top-[865px] w-[604.5px] h-[13px]"
        style={{ gap: "432px", padding: 0 }}
      >
        <span className="font-gerante text-[8px] leading-[13px] tracking-[-0.01em] text-[#00DDF9] w-[7px] h-[13px]">
          5
        </span>
        <div className="flex flex-row items-center gap-[9px] w-[96px] h-[13px]">
          <img
            src="/images/brand-arrow.svg"
            alt="brand arrow"
            className="w-[32px] h-[10px]"
          />
          <span className="font-gerante text-[8px] leading-[13px] tracking-[-0.01em] text-white w-[55px] h-[13px]">
            Endurance
          </span>
        </div>
      </div>
    </div>
  );
}
