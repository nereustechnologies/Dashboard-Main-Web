import type { Page12Data } from "@/lib/report-converter";
import React from "react";

const Page12Layout: React.FC<{ data: Page12Data }> = ({ data }) => {
  return (
    <div
      className="relative h-full w-full bg-[#0E0E0E]"
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
      <div className="absolute left-[261px] top-[121px]">
        <img
          src="/images/nereus-icon.svg"
          alt="logo"
          className="h-[83.32px] w-[94px]"
        />
      </div>
      <div className="absolute left-[223px] top-[238px] w-[182px] text-center font-gerante text-[31px] leading-[44px] text-white">
        <p>MOVE.</p>
        <p>MEND.</p>
        <p>MASTER.</p>
      </div>
      <p className="absolute left-[244px] top-[412px] font-gerante text-[12px] leading-[19.78px] tracking-[0.02em] text-[#00DDF9]">
        Unique ID: {data.report_id}
      </p>

      <div className="absolute left-[152px] top-[701px] flex w-[326px] flex-col items-center gap-[18px]">
        <div className="flex items-center gap-[12px]">
          <img
            src="/images/mail.svg"
            alt="mail"
            className="h-[20px] w-[20px]"
          />
          <a
            href="mailto:info@nereustechnologies.com"
            className="font-poppins text-[15px] font-semibold leading-[18px] text-[#00DDF9]"
          >
            info@nereustechnologies.com
          </a>
        </div>
        <div className="flex w-full items-center gap-[8px]">
          <img
            src="/images/globe.svg"
            alt="globe"
            className="h-[20px] w-[20px]"
          />
          <a
            href="https://www.nereustechnologies.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-poppins text-[15px] font-semibold leading-[18px] text-[#00DDF9]"
          >
            https://www.nereustechnologies.com/
          </a>
        </div>
        <div className="flex items-center gap-[8px]">
          <img
            src="/images/map-pin.svg"
            alt="map-pin"
            className="h-[20px] w-[20px]"
          />
          <p className="font-poppins text-[15px] font-semibold leading-[18px] text-[#00DDF9]">
            Bangalore, India
          </p>
        </div>
      </div>

      <p className="absolute left-[106px] top-[823px] w-[419px] text-center font-poppins text-[10px] font-light leading-[14px] text-white">
        This report is for informational purposes only and is not a substitute
        for medical or professional advice. See full <a href="https://booking.nereustechnologies.com/terms" className="font-poppins  font-semibold leading-[18px] text-[#00DDF9]">Terms & Conditions</a> 
      </p>
    </div>
  );
};

export default Page12Layout;
