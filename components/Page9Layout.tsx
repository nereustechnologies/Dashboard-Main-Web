import type { Page9Data, Page1Data } from "@/lib/report-converter";

export default function Page9Layout({
  page9,
  page1,
}: {
  page9: Page9Data;
  page1: Page1Data;
}) {
  const { endurance, strength, mobility } = page9.scores;

  const maxScore = Math.max(endurance, strength, mobility);

  const enduranceIsMax = endurance === maxScore;
  const strengthIsMax = strength === maxScore;
  const mobilityIsMax = mobility === maxScore;

  const numMax = [enduranceIsMax, strengthIsMax, mobilityIsMax].filter(
    Boolean
  ).length;

  let trait: "endurance" | "strength" | "mobility" | "hybrid" = "hybrid";

let Identity=page9.identity
if(Identity=="Mobility-Dominant"){
  trait="mobility"
}
if(Identity=="Strength-Dominant"){
  trait="strength"
}
if(Identity=="Endurance-Dominant"){
  trait="endurance"
}
if(Identity=="Hybrid-Dominant"){
  trait="hybrid"
}

  const content = {
    endurance: {
      image: "/images/page-7-img.png",
      title: "YOU ARE ENDURANCE-DOMINANT",
      leftText: (
        <>Your body is built for resilience, rhythm, and relentless output.</>
      ),
      rightText: (
        <>
          You move with grit. Consistent, composed, and made to last. Your
          ability to sustain effort, hold pace, and stay efficient under fatigue
          makes endurance your defining trait. This isn't just stamina, it's
          staying power under pressure.
        </>
      ),
    },
    strength: {
      image: "/images/page-6-img.png",
      title: "YOU ARE STRENGTH-DOMINANT",
      leftText: <>Your body is built for power, control, and raw output.</>,
      rightText: (
        <>
          You move with force, deliberate, grounded, and hard to move. Your
          ability to generate torque, hold tension, and resist external pressure
          makes strength your defining trait. This isn't just muscle, it's
          mastery over force.
        </>
      ),
    },
    mobility: {
      image: "/images/page-9-path.png",
      title: "YOU ARE MOBILITY-DOMINANT",
      leftText: (
        <>
          Your body is built for
          <br />
          precision, control, and
          <br />
          unrestricted motion.
        </>
      ),
      rightText: (
        <>
          You move with intent—fluid, adaptable, and always in
          <br />
          control. Your ability to shift positions smoothly, maintain
          <br />
          balance, and sustain motion makes mobility your defining
          <br />
          trait. This isn't just flexibility—it's efficiency in movement.
        </>
      ),
    },
    hybrid: {
      image: "/images/hybrid.png",
      title: "YOU ARE A HYBRID",
      leftText: (
        <>
          Your body is built for range, readiness, and multi-dimensional
          movement.
        </>
      ),
      rightText: (
        <>
          You move with versatility, capable of shifting from force to flow in
          an instant. Your ability to blend power, endurance, and control makes
          adaptability your defining trait. This isn't just balance, it's
          biomechanical agility.
        </>
      ),
    },
  }[trait];
  return (
    <div
      className="relative w-full h-full font-poppins text-white"
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
      <div className="absolute left-0 top-0 w-[630px] h-[392px]">
        <img
          src="/images/page-9-image.png"
          alt="background texture"
          className="absolute left-0 top-0 w-[630px] h-[392px]"
          style={{ pointerEvents: "none" }}
        />
        <img
          src="/images/page-9-frame.svg"
          alt="frame"
          className="absolute left-[29px] top-[40px] w-[563px] h-[323.5px]"
        />
        {/* Blue lines */}
        <img
          src={content.image}
          alt="blue lines"
          className="absolute left-[204px] top-[82px] w-[223px] h-[223px]"
          style={{ pointerEvents: "none" }}
        />
      </div>

      {/* Title */}
      <div className="absolute top-[373px] left-[29px] w-[578px]">
        <p
          className="text-4xl tracking-[6%] leading-relaxed"
          style={{ fontFamily: "Gerante" }}
        >
          {content.title}
        </p>
      </div>

      <p className="absolute top-[679px] left-[267px] text-[15px] tracking-tighter">
        {mobility}/10
      </p>
      <p className="absolute top-[769px] left-[271px] text-[15px] tracking-tighter">
        {endurance}/10
      </p>
      <p className="absolute top-[729px] left-[573px] text-[15px] tracking-tighter">
        {strength}/10
      </p>

      <div
        className="absolute"
        style={{
          left: 39,
          top: 536,
          width: 199,
          height: 66,
        }}
      >
        {/* Left text */}
        <p className="italic text-[19px] leading-tight tracking-tight text-right text-[#00DDF9]">
          {content.leftText}
        </p>
      </div>
      <div
        className="absolute"
        style={{
          left: 258,
          top: 543,
          width: 333,
          height: 56,
        }}
      >
        {/* Right text */}
        <p className="italic text-[12px] leading-tight tracking-tight text-left text-[#FFFFFF]">
          {content.rightText}
        </p>
      </div>

      <div className="absolute top-[642px] left-[29px] w-[526px] border-t-[0.6px] border-white/45" />
      <div className="absolute top-[743px] left-[450px] w-[116px] border-t-[0.3px] border-dashed border-white" />
      <div className="absolute top-[669px] left-[326px] h-[180px] border-l-[0.6px] border-white" />
      <div className="absolute top-[692px] left-[117px] w-[142px] border-t-[0.3px] border-dashed border-white" />
      <div className="absolute top-[782px] left-[147px] w-[118px] border-t-[0.3px] border-dashed border-white" />

      {/* Mobility Label */}
      <div
        className="absolute"
        style={{ left: 37, top: 676, width: 74, height: 18 }}
      >
        <span className="italic font-bold text-[18px] leading-[18px] tracking-tighter text-[#FFFFFF]">
          Mobility
        </span>
      </div>
      {/* Endurance Label */}
      <div
        className="absolute"
        style={{ left: 37, top: 767, width: 99, height: 18 }}
      >
        <span className="italic font-bold text-[18px] leading-[18px] tracking-tighter text-[#FFFFFF]">
          Endurance
        </span>
      </div>
      {/* Strength Label */}
      <div
        className="absolute"
        style={{ left: 356, top: 728, width: 80, height: 18 }}
      >
        <span className="italic font-bold text-[18px] leading-[18px] tracking-tighter text-[#FFFFFF]">
          Strength
        </span>
      </div>

      {/* Mobility score */}
      <div
        className="absolute flex"
        style={{ left: 36, top: 717, width: 161, height: 16 }}
      >
        {Array.from({ length: mobility }).map((_, i) => (
          <img
            key={i}
            src="/images/scoring-point.svg"
            alt="scoring point"
            width={17}
            height={16}
            style={{ position: "absolute", left: i * 16, top: 0 }}
          />
        ))}
      </div>
      {/* Endurance score */}
      <div
        className="absolute flex"
        style={{ left: 36, top: 807, width: 113, height: 16 }}
      >
        {Array.from({ length: endurance }).map((_, i) => (
          <img
            key={i}
            src="/images/scoring-point.svg"
            alt="scoring point"
            width={17}
            height={16}
            style={{ position: "absolute", left: i * 16, top: 0 }}
          />
        ))}
      </div>
      {/* Strength score */}
      <div
        className="absolute flex"
        style={{ left: 360, top: 769, width: 49, height: 16 }}
      >
        {Array.from({ length: strength }).map((_, i) => (
          <img
            key={i}
            src="/images/scoring-point.svg"
            alt="scoring point"
            width={17}
            height={16}
            style={{ position: "absolute", left: i * 16, top: 0 }}
          />
        ))}
      </div>

      <div className="absolute top-[310px] left-[47px] text-[9px] font-gerante tracking-tighter text-[#00DDF9]">
        {page1.name.split(" ")[0].toUpperCase()}
      </div>
      <div className="absolute top-[67px] left-[553px] text-[9px] font-gerante tracking-tighter text-[#00DDF9]">
        2025
      </div>

      <div className="absolute top-[623.5px] left-[571.44px] w-[40px] h-[35.45px]">
        <img
          src="/images/nereus-icon-brand.svg"
          alt="logo"
          className="w-[38.96px] h-[34.55px]"
        />
        <span
          className="absolute top-0 left-[32.73px] text-[7.27px] font-medium"
          style={{ fontFamily: "Avenir LT Pro" }}
        >
          ™
        </span>
      </div>

      <div className="absolute bottom-[11px] left-1/2 -translate-x-1/2 w-[604.5px] flex justify-between items-center font-gerante text-[8px] leading-[1.65] tracking-[-0.01em]">
        <span className="text-[#00DDF9]">8</span>
        <div className="flex items-center gap-[9px]">
          <span className="text-white">TRAINING WITH PURPOSE</span>
          <img
            src="/images/brand-arrow.svg"
            alt="arrow"
            className="w-[32px] h-[10px]"
          />
        </div>
      </div>
    </div>
  );
}
