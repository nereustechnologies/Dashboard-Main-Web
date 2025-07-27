import type { Page3Data } from "@/lib/report-converter";


export default function Page2Layout({ data }: { data: Page3Data }) {
  
  return (
    <div
      className="relative w-full h-full overflow-hidden"
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
      {/* Bottom bar */}
      <div className="absolute top-[865px] left-[18px] w-[604.5px] flex justify-between items-center">
        <span className="font-gerante font-normal text-[8px] text-[#00DDF9] leading-[1.65em] tracking-[-0.01em]">
          1
        </span>
        <div className="flex flex-row items-center gap-[9px]">
          <img
            src="/images/brand-arrow.svg"
            alt="Figma Arrow"
            className="w-[56.5px] h-[10px]"
            style={{ pointerEvents: "none" }}
          />
          <span className="font-gerante font-normal text-[8px] text-white leading-[1.65em] tracking-[-0.01em]">
            WHAT YOU TOLD US
          </span>
        </div>
      </div>

      {/* Top-left text */}
      <div
        className="absolute left-[14px] top-[10px] w-[71px] h-[32px] font-gerante font-normal text-[8px] text-white whitespace-pre-line"
        style={{ letterSpacing: "-0.01em" }}
      >
        HERE'S WHAT{`\n`}IT TOLD US
      </div>

      {/* nereus-icon.svg from Figma */}
      <img
        src="/images/nereus-icon.svg"
        alt="Nereus Icon"
        className="absolute left-[90px] top-[10px] w-[44px] h-[39px]"
        style={{ pointerEvents: "none" }}
      />
      {/* page-2-design-icons.png from Figma */}
      <img
        src="/images/page-2-design-icons.png"
        alt="Page 2 Design Icons"
        className="absolute left-[603px] top-[11px] w-[15.92px] h-[78px]"
        style={{ pointerEvents: "none" }}
      />
      {/* page-2-circles.svg from Figma */}
      <img
        src="/images/page-2-circles.svg"
        alt="Page 2 Circles"
        className="absolute"
        style={{
          left: 420,
          top: 406,
          width: 246.66,
          height: 240.1,
          pointerEvents: "none",
        }}
      />
      {/* Figma Text 1 */}
      <span
        className="absolute left-[38px] top-[89px] w-[224px] h-[129px] font-gerante font-normal text-[65px] text-[#00EDF9]"
        style={{ letterSpacing: "-0.01em" }}
      >
        {data.name.split(" ")[0].toUpperCase()},
      </span>
      {/* Figma Text 2 */}
      <span
        className="absolute left-[123px] top-[198px] w-[473px] h-[107px] font-gerante font-normal text-[65px] text-white"
        style={{ letterSpacing: "-0.01em" }}
      >
        YOUR BODY
      </span>
      {/* Figma Text 3 */}
      <span
        className="absolute left-[34px] top-[278px] w-[563px] h-[107px] font-gerante font-normal text-[65px] text-white"
        style={{ letterSpacing: "-0.01em" }}
      >
        HAS SPOKEN.
      </span>
      {/* Figma Two-line Text Block */}
      <div
        className="absolute left-[46px] top-[416px] w-[335px] h-[96px] font-poppins text-[16px] leading-[1.5em]"
        style={{ letterSpacing: "-0.01em" }}
      >
        <p className="font-bold text-[#00DDF9]">
          This isn't just a report—it's your blueprint.
        </p>
        <p className="font-normal text-white">
          A reflection of your biology in motion, your strengths, and the next
          step in unlocking your potential.
        </p>
      </div>
      {/* page-2-lines.svg from Figma */}
      <img
        src="/images/page-2-lines.svg"
        alt="Page 2 Lines"
        className="absolute left-[34px] top-[678px] w-[562.5px] h-[35.5px]"
        style={{ pointerEvents: "none" }}
      />
      {/* Figma Text at X:38px, Y:716px */}
      <div
        className="absolute left-[38px] top-[716px] w-[82px] h-[42px] font-gerante font-normal text-[12px] text-white whitespace-pre-line"
        style={{ letterSpacing: "-0.01em" }}
      >
        WHAT YOU{`\n`}TOLD US
      </div>
      {/* Figma Text at X:154px, Y:716px */}
      <div
        className="absolute left-[154px] top-[716px] w-[61px] h-[42px] font-gerante font-normal text-[12px] text-white whitespace-pre-line"
        style={{ letterSpacing: "-0.01em" }}
      >
        WHAT{`\n`}YOU DID
      </div>
      {/* Figma Text at X:266px, Y:716px */}
      <div
        className="absolute left-[266px] top-[716px] w-[88px] h-[63px] font-gerante font-normal text-[12px] text-white whitespace-pre-line"
        style={{ letterSpacing: "-0.01em" }}
      >
        YOUR{`\n`}MOVEMENT{`\n`}IDENTITY
      </div>
      {/* Figma Text at X:393px, Y:716px */}
      <div
        className="absolute left-[393px] top-[716px] w-[74px] h-[63px] font-gerante font-normal text-[12px] text-white whitespace-pre-line"
        style={{ letterSpacing: "-0.01em" }}
      >
        TRAINING{`\n`}WITH{`\n`}PURPOSE
      </div>
      {/* Figma Text at X:512px, Y:716px */}
      <div
        className="absolute left-[512px] top-[716px] w-[76px] h-[63px] font-gerante font-normal text-[12px] text-white whitespace-pre-line"
        style={{ letterSpacing: "-0.01em" }}
      >
        THE NEXT{`\n`}MOVE IS{`\n`}YOURS
      </div>
    </div>
  );
}
