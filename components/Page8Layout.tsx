export default function Page8Layout() {
  return (
    <div
      className="relative w-full h-full font-poppins"
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
      <div
        className="absolute left-0 top-0 h-full w-[4px]"
        style={{ backgroundColor: "#00DDF9" }}
      />
      <div className="absolute top-[9px] left-[578px] w-[44px] h-[39px]">
        <img
          src="/images/nereus-icon-brand.svg"
          alt="logo"
          className="w-[42.86px] h-[38px]"
        />
        <span
          className="absolute top-0 left-[36px] text-xs font-medium"
          style={{ fontFamily: "Avenir LT Pro" }}
        >
          ™
        </span>
      </div>

      <div className="p-8 text-white">
        <h1
          className="absolute top-[105px] left-[44px] text-4xl"
          style={{ fontFamily: "Gerante" }}
        >
          SCORING SYSTEM
        </h1>
        <div
          className="absolute top-[179px] left-[4px] w-[332px]"
          style={{ borderTop: "1px solid #00DDF9" }}
        />
        <div
          className="absolute top-[791px] left-[4px] w-[332px]"
          style={{ borderTop: "1px solid #00DDF9" }}
        />

        <div
          className="absolute top-[226.5px] left-[173px] h-[488.5px]"
          style={{ borderLeft: "0.3px solid #00DDF9" }}
        />
        <div
          className="absolute top-[226.5px] left-[318px] h-[488.5px]"
          style={{ borderLeft: "0.3px solid #00DDF9" }}
        />
        <div
          className="absolute top-[325.5px] left-[24px] w-[563px]"
          style={{ borderTop: "0.3px solid #00DDF9" }}
        />
        <div
          className="absolute top-[494.5px] left-[24px] w-[563px]"
          style={{ borderTop: "0.3px solid #00DDF9" }}
        />
        <div
          className="absolute top-[608.5px] left-[24px] w-[563px]"
          style={{ borderTop: "0.3px solid #00DDF9" }}
        />

        {/* General Assessment */}
        <div className="absolute top-[229px] left-[30px] w-full">
          <div className="flex text-sm">
            <div className="w-[149px] font-medium">General Assessment</div>
            <div className="w-[144px]">
              <p>Good</p>
              <p className="mt-2.5">Satisfactory</p>
              <p className="mt-2.5">Needs Improvement</p>
            </div>
            <div className="w-auto">
              <p className="tracking-tighter">
                Optimal performance with minimal limitations
              </p>
              <p className="mt-2.5 tracking-tighter">
                Functional but with room for refinement
              </p>
              <p className="mt-2.5 tracking-tighter">
                Clear deficits that impact efficiency
              </p>
            </div>
          </div>
        </div>

        {/* Fatigue Score Key */}
        <div className="absolute top-[344px] left-[30px] w-full">
          <div className="flex text-sm">
            <div className="w-[149px] font-medium">Fatigue Score Key</div>
            <div className="w-[144px]">
              <p>1/5</p>
              <p className="mt-2.5">2/5</p>
              <p className="mt-2.5">3/5</p>
              <p className="mt-2.5">4/5</p>
              <p className="mt-2.5">5/5</p>
            </div>
            <div className="w-auto">
              <p className="tracking-tighter">
                Fatigues rapidly. Endurance is a major weakness
              </p>
              <p className="mt-2.5 tracking-tighter">
                Low stamina. Strength drops off early
              </p>
              <p className="mt-2.5 tracking-tighter">
                Decent base, but fades under sustained effort
              </p>
              <p className="mt-2.5 tracking-tighter">
                Strong endurance. Hold output well
              </p>
              <p className="mt-2.5 tracking-tighter">
                Elite stamina. Repeats high effort with ease
              </p>
            </div>
          </div>
        </div>

        {/* Squat Depth Rating */}
        <div className="absolute top-[512px] left-[30px] w-full">
          <div className="flex text-sm">
            <div className="w-[149px] font-medium">Squat Depth Rating</div>
            <div className="w-[144px]">
              <p>Deep Squat</p>
              <p className="mt-2.5">Parallell Squat</p>
              <p className="mt-2.5">Partial Squat</p>
            </div>
            <div className="w-auto">
              <p className="tracking-tighter">
                Full Range of motion, optimal positioning
              </p>
              <p className="mt-2.5 tracking-tighter">
                Thighs parallel to the ground, functional range
              </p>
              <p className="mt-2.5 tracking-tighter">
                Thighs above parallel, limited depth
              </p>
            </div>
          </div>
        </div>

        {/* Lunge Depth Rating */}
        <div className="absolute top-[627px] left-[30px] w-full">
          <div className="flex text-sm">
            <div className="w-[149px] font-medium">Lunge Depth Rating</div>
            <div className="w-[144px]">
              <p>Deep Lunge</p>
              <p className="mt-2.5">Shallow Lunge</p>
              <p className="mt-2.5">Incomplete Lunge</p>
            </div>
            <div className="w-auto">
              <p className="tracking-tighter">
                Full range with controlled stability
              </p>
              <p className="mt-2.5 tracking-tighter">
                Limited depth, reduced engagement
              </p>
              <p className="mt-2.5 tracking-tighter">
                Insufficient range, potential imbalance
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[11px] left-1/2 -translate-x-1/2 w-[604.5px] flex justify-between items-center font-gerante text-[8px] leading-[1.65] tracking-[-0.01em]">
        <span className="text-[#00DDF9]">7</span>
        <div className="flex items-center gap-[9px]">
          <span className="text-white">Your Movement Signature</span>
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
