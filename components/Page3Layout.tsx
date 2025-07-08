import type { Page3Data } from "@/lib/report-converter";

export default function Page3Layout({ data }: { data: Page3Data }) {
  return (
    <div
      className="relative w-full h-full"
      style={{
        backgroundColor: "#0E0E0E",
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
      <span className="absolute left-[14px] top-[11px] w-[105px] h-[36px] font-gerante font-normal text-[11px] leading-[18px] tracking-[-0.01em] text-white">
        YOU TOOK THE FIRST STEP.
      </span>
      <span className="absolute left-[454px] top-[11px] w-[163px] h-[45px] font-gerante font-normal text-[11px] leading-[18px] text-right tracking-[-0.01em] text-white">
        WE UNLOCKED WHAT'S BEHIND IT.
      </span>

      {/* New section from Figma */}
      <div className="absolute left-[97px] top-[115px] w-[437px] h-[662px]">
        {/* White background card */}
        <div className="absolute top-0 left-0 w-[437px] h-[662px] bg-white rounded-[12px]" />

        {/* Vector 68 */}
        <div
          className="absolute top-[22px] left-1/2 -translate-x-1/2 w-[393.5px]"
          style={{ borderTop: "1.3px solid #242424" }}
        />

        {/* Gradient Ellipse */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[72px] w-[317px] h-[317px] rounded-full"
          style={{
            background: "radial-gradient(circle, #062428 39.9%, #80CACF 100%)",
            filter: "blur(32px)",
          }}
        />

        {/* Image g4336-1.png */}
        <img
          src="/images/g4336-1.png"
          alt="g4336-1"
          className="absolute left-[112px] top-[125px] w-[212px] h-[212px]"
        />

        {/* Image path4364-1.png */}
        <img
          src="/images/path4364-1.png"
          alt="path4364-1"
          className="absolute left-[187px] top-[203.36px] w-[62.23px] h-[56.64px]"
        />

        {/* Frame 10 from Figma */}
        <div className="absolute left-[28px] top-[65px] flex justify-between items-center w-[389px] font-gerante">
          <span className="font-normal text-[8px] leading-[1.65] tracking-[-0.01em] text-[#242424]">
            Potential isn't measured
          </span>
          <span className="font-normal text-[8px] leading-[1.65] tracking-[-0.01em] text-[#242424]">
            it's understood.
          </span>
        </div>

        {/* Text "WHAT YOU TOLD US" */}
        <div className="absolute left-[26px] top-[20px] w-[385px] h-[49px]">
          <span className="font-gerante text-[30px] leading-[1.65] tracking-[-0.01em] text-[#242424]">
            WHAT YOU TOLD US
          </span>
        </div>

        {/* Vector Lines */}
        <div
          className="absolute top-[405px] left-1/2 -translate-x-1/2 w-[393.5px]"
          style={{ borderTop: "1.3px solid #242424" }}
        />
        <div
          className="absolute top-[415px] left-[136px] h-[15.5px]"
          style={{ borderLeft: "1px solid #242424" }}
        />
        <div
          className="absolute top-[415px] left-[215px] h-[15.5px]"
          style={{ borderLeft: "1px solid #242424" }}
        />
        <div
          className="absolute top-[415px] left-[292px] h-[15.5px]"
          style={{ borderLeft: "1px solid #242424" }}
        />
        <div
          className="absolute top-[415px] left-[362px] h-[15.5px]"
          style={{ borderLeft: "1px solid #242424" }}
        />
        <div
          className="absolute top-[441px] left-1/2 -translate-x-1/2 w-[393.5px]"
          style={{ borderTop: "1.3px solid #242424" }}
        />
        <div
          className="absolute top-[503px] left-1/2 -translate-x-1/2 w-[393.5px]"
          style={{ borderTop: "0.6px dashed #242424" }}
        />
        <div
          className="absolute top-[565px] left-1/2 -translate-x-1/2 w-[393.5px]"
          style={{ borderTop: "0.6px dashed #242424" }}
        />
        <div
          className="absolute top-[644px] left-[32.5px] w-[372px]"
          style={{ borderTop: "1.3px solid #242424" }}
        />

        {/* User Info Section */}
        <div className="absolute top-[414px] left-[22px] w-[392px] text-[#5E5F5F] font-poppins text-[12px] leading-[1.5] tracking-[-0.01em]">
          <span className="absolute left-0 w-[170px] overflow-hidden text-ellipsis whitespace-nowrap">{data.name}</span>
          <span className="absolute left-[180px]">{data.age} y/o</span>
          <span className="absolute left-[250px]">{data.height} cm</span>
          <span className="absolute left-[310px]">{data.weight} kg</span>
          <span className="absolute left-[370px]">{data.gender}</span>
        </div>

        {/* "Why You Move" Section */}
        <div className="absolute top-[447px] left-[22px] w-[380px] text-[#242424]">
          <h3 className="font-poppins font-bold text-[14px] leading-[1.5] tracking-[-0.01em] mb-1">
            Why You Move
          </h3>
          <p className="font-poppins text-[12px] leading-[1.17] tracking-[-0.01em] italic">
            "{data.why_you_move}"
          </p>
        </div>

        {/* "Your Next Milestone" Section */}
        <div className="absolute top-[508px] left-[22px] w-[380px] text-[#242424]">
          <h3 className="font-poppins font-bold text-[14px] leading-[1.5] tracking-[-0.01em] mb-1">
            Your Next Milestone
          </h3>
          <p className="font-poppins text-[12px] leading-[1.17] tracking-[-0.01em] italic">
            "{data.fitness_goal}"
          </p>
        </div>

        {/* "How You Felt" Section */}
        <div className="absolute top-[569px] left-[22px] w-[380px] text-[#242424]">
          <h3 className="font-poppins font-bold text-[14px] leading-[1.5] tracking-[-0.01em] mb-1">
            How You Felt
          </h3>
          <p className="font-poppins text-[12px] leading-[1.17] tracking-[-0.01em]">
            <span className="italic font-bold">Before the workout:</span>{" "}
            <span className="not-italic">{data.pre_workout_feeling}</span>
            <br />
            <span className="italic font-bold">After the workout:</span>{" "}
            <span className="not-italic">{data.post_workout_feeling}</span>
            <br />
            <span className="italic font-bold">How hard you pushed:</span>{" "}
            <span className="not-italic">{data.effort_level}</span>
          </p>
        </div>

        {/* Logo */}
        <img
          src="/images/nereus-icon-black.svg"
          alt="logo"
          className="absolute w-[30.46px] h-[27px] top-[631px] left-[400px]"
        />
      </div>

      {/* Frame 9 from Figma */}
      <div className="absolute bottom-[11px] left-1/2 -translate-x-1/2 w-[604.5px] flex justify-between items-center font-gerante text-[8px] leading-[1.65] tracking-[-0.01em]">
        <span className="text-[#00DDF9]">2</span>
        <div className="flex items-center gap-[9px]">
          <img
            src="/images/brand-arrow.svg"
            alt="arrow"
            className="w-[56.5px] h-[10px]"
          />
          <span className="text-white">WHAT YOU DID</span>
        </div>
      </div>
    </div>
  );
}
