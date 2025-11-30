"use client";

import Image from "next/image";

export default function MovingBanner({
  text = "Letick Store",
  speed = 40,
  includeLogo = true,
  logoSrc = "/Storefront/images/leticklogo.webp",
  logoHeight = 50,
}: {
  text?: string;
  speed?: number; // seconds per loop
  includeLogo?: boolean;
  logoSrc?: string;
  logoHeight?: number;
}) {
  return (
    <section className="" style={{ marginInline: "calc(50% - 50vw)" }}>
      <div style={{ backgroundColor: "black" }}>
        <div className="py-4 sm:py-5">
          <div className="flex items-center overflow-hidden whitespace-nowrap will-change-transform" aria-hidden>
            <Row
              text={text}
              speed={speed}
              offset={0}
              includeLogo={includeLogo}
              logoSrc={logoSrc}
              logoHeight={logoHeight}
            />
            <Row
              text={text}
              speed={speed}
              offset={50}
              includeLogo={includeLogo}
              logoSrc={logoSrc}
              logoHeight={logoHeight}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({
  text,
  speed,
  offset,
  includeLogo,
  logoSrc,
  logoHeight,
}: {
  text: string;
  speed: number;
  offset: number;
  includeLogo?: boolean;
  logoSrc?: string;
  logoHeight?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-22 px-8 md:gap-28"
      style={{
        width: "200%",
        animation: `bannerScroll ${speed}s linear infinite`,
        animationDelay: `-${(offset / 100) * speed}s`,
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="flex items-center gap-8 sm:gap-10">
          <span
            className="text-2xl font-extrabold tracking-wide text-white uppercase sm:text-3xl md:text-4xl"
            style={{ fontFamily: `` }}
          >
            {text}
          </span>
          {includeLogo ? (
            <Image
              src={logoSrc ?? "/Storefront/images/logo (1).png"}
              alt=""
              width={logoHeight ?? 20}
              height={logoHeight ?? 20}
              className="opacity-95"
              style={{ height: logoHeight, width: "auto" }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
