export default function Page4Layout() {
  return (
    <div className="relative w-[631px] h-[892px] bg-[#0E0E0E] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <img
        src="/images/page-4-g5888.png"
        alt=""
        width={205}
        height={484}
        className="absolute top-0 left-0"
      />
      <img
        src="/images/page-4-g5757.png"
        alt=""
        width={304}
        height={184}
        className="absolute top-[708px] left-0"
      />
      <img
        src="/images/page-4-g6023.png"
        alt=""
        width={148}
        height={289}
        className="absolute top-[426px] left-[483px]"
      />
      <div className="absolute top-0 left-0 w-1 h-full bg-[#00DDF9]" />

      <div className="absolute top-[10px] left-[578px] w-[44px] h-[39px]">
        <img src="/images/nereus-icon.svg" alt="Nereus" />
      </div>

      <div className="absolute top-[54px] left-[34px] font-gerante text-white text-[83px] leading-tight">
        <p>WHAT</p>
        <p>YOU</p>
        <p>DID</p>
      </div>

      <p className="absolute top-[394px] left-[41px] font-gerante text-[15px] text-[#00DDF9]">
        You didn't just show up—
      </p>
      <p className="absolute top-[444px] left-[285px] font-gerante text-[15px] text-[#00DDF9]">
        —you put your body to the test.
      </p>

      <p className="absolute top-[558px] left-[37px] font-poppins font-light text-[12px] text-white">
        Now, here's what we measured.
      </p>

      <div className="absolute top-[582px] left-[37px] flex items-center space-x-1">
        <p className="font-gerante text-[13px] text-[#00DDF9]">Mobility</p>
        <p className="font-poppins font-light text-[18px] text-white">
          – How well you move.
        </p>
      </div>
      <div className="absolute top-[605px] left-[37px] flex items-center space-x-1">
        <p className="font-gerante text-[13px] text-[#00DDF9]">Endurance</p>
        <p className="font-poppins font-light text-[18px] text-white">
          – How long you can keep going.
        </p>
      </div>
      <div className="absolute top-[627px] left-[37px] flex items-center space-x-1">
        <p className="font-gerante text-[13px] text-[#00DDF9]">Strength</p>
        <p className="font-poppins font-light text-[18px] text-white">
          – How much power you generate.
        </p>
      </div>

      <div className="absolute top-[806px] left-[315px] w-[281px] font-gerante text-[10px] text-[#00DDF9] text-right">
        <p>Turn the page.</p>
        <p>It's time to see what your body had to say.</p>
      </div>

      <p className="absolute top-[865px] left-[18px] font-gerante text-[8px] text-[#00DDF9]">
        3
      </p>
    </div>
  );
}
