import type { Page1Data } from "@/lib/report-converter";

export default function Page1Layout({
  data,
}: Readonly<{ data: Page1Data }>) {
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
      {/* Top blue strip */}
      <div className="absolute top-0 left-0 w-full h-[5px] bg-[#00DDF9] z-[2]" />

      {/* Top dashed lines */}
      <div style={{ ...dashedLineStyle, top: 49 }} />
      <div style={{ ...dashedLineStyle, top: 56 }} />

      {/* Main content */}
      <div
        className="w-full h-full bg-[#0E0E0E]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px),
            url(/images/page-1-bg.png)
          `,
          backgroundSize: "30px 30px, 30px 30px, cover",
          backgroundPosition: "0 0, 0 0, center",
          backgroundRepeat: "repeat, repeat, no-repeat",
          backgroundBlendMode: "normal, normal, normal",
        }}
      >
        {/* YOUR ATHLETIC Text */}
        <span
          className="absolute left-[41px] top-[349px] w-[530px] h-[86px] font-gerante font-normal text-[52px] text-white opacity-100 leading-[86px] z-[3] whitespace-pre-line"
          style={{ letterSpacing: "-0.01em" }}
        >
          YOUR ATHLETIC
        </span>
        {/* Additional Text */}
        <span
          className="absolute left-[183px] top-[426px] w-[407px] h-[92px] font-gerante font-normal text-[56px] text-white opacity-100 leading-[92px] z-[3] whitespace-pre-line"
          style={{ letterSpacing: "-0.01em" }}
        >
          BLUEPRINT
        </span>
        {/* Nereus Logo */}
        <img
          src="/images/nereus-logo.svg"
          alt="Nereus Logo"
          className="absolute left-[119px] top-[220px] w-[119px] h-[73px] z-[3]"
        />
        {/* Ellipse 1 */}
        <img
          src="/images/page-1-ellipse1.svg"
          alt="Ellipse 1"
          className="absolute z-[2] pointer-events-none"
          style={{ left: 314.77, top: 213, width: 233.19, height: 229.04 }}
        />
        {/* Ellipse 2 */}
        <img
          src="/images/page-1-ellipse2.svg"
          alt="Ellipse 2"
          className="absolute z-[2] pointer-events-none"
          style={{ left: 83, top: 445, width: 233, height: 233 }}
        />
        {/* Line */}
        <img
          src="/images/page-1-line.svg"
          alt="Line"
          className="absolute z-[2] pointer-events-none"
          style={{ left: 247, top: 520, width: 113, height: 194 }}
        />
        {/* Blueprint Box */}
        <div
          className="absolute border-[#D1D1D1]/45 border-[0.3px] left-[387px] top-[614px] w-[218px] h-[81px] bg-transparent pt-[15px] pr-[10px] pb-[10px] pl-[12px]"
          style={{ borderRadius: 0 }}
        >
          <span
            className="font-gerante italic text-[20px] text-[#00DDF9] leading-tight w-[193px] h-[58px] block"
            style={{ letterSpacing: "-0.01em" }}
          >
            THE BIOLOGY OF POTENTIAL.
          </span>
        </div>
        {/* For. Ava Mitchell Box */}
       <div className="absolute border-[#D1D1D1]/45 border-[0.3px] left-[23px] top-[712px] bg-transparent pt-[6px] pr-[10px] pb-[6px] pl-[71px] flex items-center"style={{ borderRadius: 0, width: "auto", height: "auto" }}
       >
          <span className="[font-family:var(--font-poppins)] text-[18px] text-white italic whitespace-nowrap">
          For. <span className="font-bold text-[#00DDF9]">{data.name}</span>
          </span>
        </div>
        {/* Brand Arrow */}
        <img
          src="/images/brand-arrow.svg"
          alt="Brand Arrow"
          className="absolute left-[450px] top-[860.5px] w-[56.5px] h-[10px]"
          style={{ pointerEvents: "none" }}
        />
        {/* LET'S GET STARTED Text */}
        <span
          className="absolute flex justify-center items-center left-[514px] top-[854px] w-[110px] h-[20px] font-gerante font-normal text-[8px] text-white leading-[13px]"
          style={{ letterSpacing: "-0.01em" }}
        >
          LET'S GET STARTED
        </span>
      </div>

      {/* Bottom dashed lines */}
      <div style={{ ...dashedLineStyle, bottom: 49 }} />
      <div style={{ ...dashedLineStyle, bottom: 57 }} />

      {/* Bottom blue strip */}
      <div className="absolute bottom-0 left-0 w-full h-[5px] bg-[#00DDF9] z-[2]" />
    </div>
  );
}
