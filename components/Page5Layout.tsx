import type { Page5Data } from "@/lib/report-converter";

export default function Page5Layout({ data }: { data: Page5Data }) {
  return (
    <div
      className="relative w-[631px] h-[892px] bg-[#0E0E0E] "
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
      <p className="absolute top-[22px] left-[36px] h-[82px] w-[299px] font-gerante text-[50px] font-normal leading-[82px] tracking-[-0.01em] text-white">
        MOBILITY
      </p>
      <div className="absolute left-[351px] top-[44px] w-[280px] border-t border-[#00DDF9]" />
      <p className="absolute left-[374px] top-[65px] h-[65px] w-[232px] text-right font-gerante text-[8px] font-normal leading-[13px] tracking-[-0.01em] text-white">
        RANGE IS NOTHING WITHOUT CONTROL. WE TESTED HOW FREELY YOUR JOINTS MOVE,
        HOW EFFICIENTLY YOU TRANSITION, AND WHETHER FLEXIBILITY WORKS FOR YOU
        —OR AGAINST YOU.
      </p>
      <div
        className="absolute w-[258px] border-t border-white/45"
        style={{
          left: "56.5px",
          top: "364px",
          borderWidth: "0.3px",
        }}
      />
      <div
        className="absolute h-[414.5px] border-l border-white/45"
        style={{
          left: "314.5px",
          top: "157px",
          borderWidth: "0.3px",
        }}
      />
      <div className="absolute left-[36px] top-[150px] h-[176px] w-[195px] text-white">
        <div
          className="absolute w-[194.5px] border-t border-white/45"
          style={{
            top: "109px",
            left: "0.5px",
            borderWidth: "0.3px",
          }}
        />
        <p
          className="absolute left-[18px] top-0 font-gerante text-[16px]"
          style={{
            width: "140px",
            height: "38px",
            lineHeight: "1.1875em",
            letterSpacing: "-0.01em",
          }}
        >
          Knee Flexion
          <br />& Extension
        </p>
        <p
          className="absolute left-0 top-[21px] font-gerante text-[12px] text-[#00DDF9]"
          style={{
            width: "5px",
            height: "18px",
            lineHeight: "1.5em",
            letterSpacing: "-0.01em",
          }}
        >
          1
        </p>
        <p
          className="absolute left-[19px] top-[53px] font-poppins text-[13px] font-medium italic"
          style={{ lineHeight: "1.38", letterSpacing: "-0.01em" }}
        >
          {data.knee_flexion["Rep Count"] / 2} reps
        </p>
        <p
          className="absolute left-[19px] top-[72px] font-poppins text-[13px] font-medium italic"
          style={{ lineHeight: "1.38", letterSpacing: "-0.01em" }}
        >
          Duration: {data.knee_flexion["Total Duration"]}s
        </p>
        <p
          className="absolute left-[32px] top-[129px] font-poppins text-[12px] font-medium italic"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Left Leg:
        </p>
        <p
          className="absolute left-[32px] top-[144px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Right Leg:
        </p>
        <p
          className="absolute left-[19px] top-[88px] font-poppins text-[9px] italic"
          style={{ lineHeight: "2em", letterSpacing: "-0.01em" }}
        >
          Hamstrings and Quadriceps
        </p>
        <p
          className="absolute left-[19px] top-[115px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Knee Flexion Angle:
        </p>
        <p
          className="absolute left-[19px] top-[158px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Range of Motion:
        </p>
        <p
          className="absolute left-[84px] top-[129px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {Math.round(data.knee_flexion["Max Knee Flexion Left"])}º
        </p>
        <p
          className="absolute left-[93px] top-[144px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {Math.round(data.knee_flexion["Max Knee Flexion Right"])}º
        </p>
        <p
          className="absolute left-[122px] top-[158px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {data.knee_flexion["Range of Motion"] || "NA"}
        </p>
        <div
          className="absolute w-[194.5px] border-t border-white/45"
          style={{
            top: "49px",
            left: "0.5px",
            borderWidth: "0.3px",
          }}
        />
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "120px" }}
        />
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "164px" }}
        />
      </div>
      <div className="absolute left-[36px] top-[397px] h-[172px] w-[207px] text-white">
        <div
          className="absolute w-[194.5px] border-t border-white/45"
          style={{
            top: "29px",
            left: "0.5px",
            borderWidth: "0.3px",
          }}
        />
        <p
          className="absolute left-[18px] top-0 font-gerante text-[16px]"
          style={{
            width: "195px",
            height: "19px",
            lineHeight: "1.1875em",
            letterSpacing: "-0.01em",
          }}
        >
          Knee-to-Wall Test
        </p>
        <p
          className="absolute left-0 top-[1px] max-w-[32px] font-gerante text-[12px] text-[#00DDF9]"
          style={{
            height: "18px",
            lineHeight: "1.5em",
            letterSpacing: "-0.01em",
          }}
        >
          2
        </p>
        <p
          className="absolute left-[19px] top-[33px] font-poppins text-[13px] font-medium italic"
          style={{ lineHeight: "1.38", letterSpacing: "-0.01em" }}
        >
          1 rep/leg
        </p>
        <p
          className="absolute left-[19px] top-[52px] font-poppins text-[13px] font-medium italic"
          style={{ lineHeight: "1.38", letterSpacing: "-0.01em" }}
        >
          Duration: {data.knee_to_wall["Total Time"]}s
        </p>
        <p
          className="absolute left-[19px] top-[68px] font-poppins text-[9px] italic"
          style={{ lineHeight: "2em", letterSpacing: "-0.01em" }}
        >
          Calf muscles- Gastrocnemius and Soleus
        </p>
        <div
          className="absolute w-[194.5px] border-t border-white/45"
          style={{
            left: "0.5px",
            top: "89px",
            borderWidth: "0.3px",
          }}
        />
        <p
          className="absolute left-[19px] top-[95px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Knee Angle:
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "101.5px" }}
        />
        <p
          className="absolute left-[32px] top-[109px] font-poppins text-[12px] font-medium italic"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Left Knee:
        </p>
        <p
          className="absolute left-[94px] top-[109px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {Math.round(data.knee_to_wall["Max Knee Flexion Left"])}º
        </p>
        <p
          className="absolute left-[32px] top-[124px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Right Knee:
        </p>
        <p
          className="absolute left-[103px] top-[124px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {Math.round(data.knee_to_wall["Max Knee Flexion Right"])}º
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "145.5px" }}
        />
        <p
          className="absolute left-[19px] top-[139px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Ankle Mobility:
        </p>
        <p
          className="absolute left-[112px] top-[139px] font-poppins text-[12px] font-light w-full "
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {data.knee_to_wall["Ankle Mobility"] || "NA"}
        </p>
        <div
          className="absolute w-[194.5px] border-t border-white/45"
          style={{
            left: "0.5px",
            top: "165px",
            borderWidth: "0.3px",
          }}
        />
      </div>
      <div className="absolute left-[31px] top-[596px] w-[344px] border-t border-[#00DDF9]" />
      <img
        src="/images/path7426-1.png"
        alt="decoration"
        className="absolute left-[400px] top-[464px] h-[171px] w-[171px]"
      />
      <div className="absolute left-[585px] top-[596px] w-[46px] border-t border-[#00DDF9]" />
      <img
        src="/images/nereus-icon-brand.svg"
        alt="logo"
        className="absolute left-[590px] top-[562px] h-[28px] w-[31.59px]"
      />
      <p
        className="absolute left-[34px] top-[615px] w-[200px] h-[30px] font-poppins italic font-semibold text-[13px] leading-[15px] text-white"
        style={{ letterSpacing: "-0.01em" }}
      >
        Your Mobility Speaks Volumes. Here's What It Says:
      </p>
      <div className="absolute left-[28px] top-[670px] w-[164px] h-[161px]">
        <p
          className="absolute left-0 top-0 w-[159px] h-[46px] font-gerante italic text-[16px] leading-[23px] text-white"
          style={{ letterSpacing: "-0.04em" }}
        >
          {data.summary?.[0]?.title || "Mobility Assessment"}
        </p>
        <div
          className="absolute left-[1px] top-[55px] w-[131px] border-t border-[#00DDF9]"
          style={{ borderWidth: "0.6px" }}
        />
        <p
          className="absolute left-0 top-[71px] w-[164px] h-[90px] font-poppins text-[12px] font-light leading-[15px] text-white"
          style={{ letterSpacing: "-0.01em" }}
        >
          {data.summary?.[0]?.paragraph || "Good mobility foundation established."}
        </p>
      </div>
      <div className="absolute left-[229px] top-[670px] w-[166px] h-[146px]">
        <p
          className="absolute left-0 top-0 w-[151px] h-[46px] font-gerante italic text-[16px] leading-[23px] text-white"
          style={{ letterSpacing: "-0.04em" }}
        >
          {data.summary?.[1]?.title || "Mobility Insight"}
        </p>
        <div
          className="absolute left-[1px] top-[55px] w-[131px] border-t border-[#00DDF9]"
          style={{ borderWidth: "0.6px" }}
        />
        <p
          className="absolute left-[2px] top-[71px] w-[164px] h-[75px] font-poppins text-[12px] font-light leading-[15px] text-white"
          style={{ letterSpacing: "-0.01em" }}
        >
          {data.summary?.[1]?.paragraph || "Continue working on your mobility patterns."}
        </p>
      </div>
      <div className="absolute left-[440px] top-[670px] w-[175px] h-[146px]">
        <p
          className="absolute left-[2px] top-0 w-[163px] h-[46px] font-gerante italic text-[16px] leading-[23px] text-white"
          style={{ letterSpacing: "-0.04em" }}
        >
          {data.summary?.[2]?.title || "Movement Focus"}
        </p>
        <div
          className="absolute left-0 top-[55px] w-[131px] border-t border-[#00DDF9]"
          style={{ borderWidth: "0.6px" }}
        />
        <p
          className="absolute left-[2px] top-[71px] w-[173px] h-[75px] font-poppins text-[12px] font-light leading-[15px] text-white"
          style={{ letterSpacing: "-0.01em" }}
        >
          {data.summary?.[2]?.paragraph || "Focus on consistent movement patterns."}
        </p>
      </div>
      <div className="absolute left-[346px] top-[177px] h-[243px] w-[195px] text-white">
        <div
          className="absolute w-[194.5px] border-t border-white/45"
          style={{ top: "29px", left: "0.5px", borderWidth: "0.3px" }}
        />
        <p
          className="absolute left-[18px] top-0 font-gerante text-[16px]"
          style={{
            width: "155px",
            height: "19px",
            lineHeight: "1.1875em",
            letterSpacing: "-0.01em",
          }}
        >
          Lunge Stretch
        </p>
        <p
          className="absolute left-0 top-[1px] font-gerante text-[12px] text-[#00DDF9]"
          style={{
            width: "11px",
            height: "18px",
            lineHeight: "1.5em",
            letterSpacing: "-0.01em",
          }}
        >
          3
        </p>
        <p
          className="absolute left-[19px] top-[33px] font-poppins text-[13px] font-medium italic"
          style={{ lineHeight: "1.38", letterSpacing: "-0.01em" }}
        >
          {data.lunge_stretch["Max Rep Count"]} reps
        </p>
        <p
          className="absolute left-[19px] top-[52px] font-poppins text-[13px] font-medium italic"
          style={{ lineHeight: "1.38", letterSpacing: "-0.01em" }}
        >
          Duration: 60s
        </p>
        <p
          className="absolute left-[19px] top-[71px] w-[162px] font-poppins text-[9px] italic"
          style={{ lineHeight: "12px", letterSpacing: "-0.01em" }}
        >
          Hip Flexors, Quadriceps, Hamstrings, Glutes, Calves
        </p>
        <div
          className="absolute w-[194.5px] border-t border-white/45"
          style={{ top: "101px", left: "0.5px", borderWidth: "0.3px" }}
        />
        <p
          className="absolute left-[19px] top-[105px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Hip Flexion Angle:
        </p>
        <p
          className="absolute left-[127px] top-[105px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {Math.round(data.lunge_stretch["Average Hip Flexion Angle"])}º
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "111.5px" }}
        />
        <p
          className="absolute left-[19px] top-[118px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Knee Flexion Angle:
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "124.5px" }}
        />
        <p
          className="absolute left-[32px] top-[132px] font-poppins text-[12px] font-medium italic"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Left Knee:
        </p>
        <p
          className="absolute left-[94px] top-[132px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {Math.round(data.lunge_stretch["Average Knee Flexion Angle Left"])}º
        </p>
        <p
          className="absolute left-[32px] top-[147px] font-poppins text-[12px] font-medium italic"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Right Knee:
        </p>
        <p
          className="absolute left-[103px] top-[147px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {Math.round(data.lunge_stretch["Average Knee Flexion Angle Right"])}º
        </p>
        <p
          className="absolute left-[19px] top-[162px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Quadriceps Stretch:
        </p>
        <p
          className="absolute left-[141px] top-[162px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {data.lunge_stretch["Quadriceps Stretch"] || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "168.5px" }}
        />
        <p
          className="absolute left-[19px] top-[178px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Hold Duration:
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "184.5px" }}
        />
        <p
          className="absolute left-[32px] top-[192px] font-poppins text-[12px] font-medium italic"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Left Leg:
        </p>
        <p
          className="absolute left-[83px] top-[192px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {data.lunge_stretch["Hold Duration Left (s)"]}s
        </p>
        <p
          className="absolute left-[32px] top-[207px] font-poppins text-[12px] font-medium italic"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Right Leg:
        </p>
        <p
          className="absolute left-[93px] top-[207px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {data.lunge_stretch["Hold Duration Right (s)"]}s
        </p>
        <p
          className="absolute left-[19px] top-[225px] font-poppins text-[12px] font-medium"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          Hip Stability:
        </p>
        <p
          className="absolute left-[97px] top-[225px] font-poppins text-[12px] font-light"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
        >
          {data.lunge_stretch["Hip Stability"] || "NA"}
        </p>
        <img
          src="/images/brand-arrow-small.svg"
          alt="arrow"
          className="absolute left-0 w-[11px]"
          style={{ top: "231.5px" }}
        />
      </div>
      <p
        className="absolute left-[89px] top-[854px] w-[300px] h-[13px] font-gerante text-[8px] leading-[13px] text-white"
        style={{ letterSpacing: "-0.05em" }}
      >
        Every exercise performed. Every muscle engaged.
      </p>
      <div
        className="absolute left-[87px] top-[871px] w-[424px] border-t border-white/45"
        style={{ borderWidth: "0.6px" }}
      />
      <div
        className="absolute left-[18px] top-[865px] w-[604.5px] h-[13px] flex flex-row justify-between items-center p-0"
        style={{ gap: "432px" }}
      >
        <span
          className="font-gerante text-[8px] leading-[13px] text-[#00DDF9]"
          style={{ width: "7px", height: "13px", letterSpacing: "-0.01em" }}
        >
          4
        </span>
        <div
          className="flex flex-row items-center p-0"
          style={{ gap: "9px", width: "87px", height: "13px" }}
        >
          <img
            src="/images/brand-arrow.svg"
            alt="brand-arrow"
            className=""
            style={{ width: "32px", height: "10px" }}
          />
          <span
            className="font-gerante text-[8px] leading-[13px] text-white"
            style={{ width: "46px", height: "13px", letterSpacing: "-0.01em" }}
          >
            Strength
          </span>
        </div>
      </div>
    </div>
  );
}
