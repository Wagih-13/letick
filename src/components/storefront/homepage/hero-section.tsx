"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// Animation and typing timings (tweak as desired)
const REVEAL_DELAY_STEP = 0.06; // seconds between line starts
const REVEAL_DURATION = 900; // ms
const FADE_DURATION = 900; // ms
const HEADING_CHAR_MS = 18; // snappier per-letter for heading
const LINE_BREAK_DELAY_MS = 0; // no pause between heading lines
const PARA_CHAR_MS = 14; // snappier per-letter for paragraph

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView } as const;
}

function Counter({ value, suffix = "+", duration = 1200, start = 0, inView = false }: { value: number; suffix?: string; duration?: number; start?: number; inView: boolean }) {
  const [val, setVal] = useState(start);
  const target = useMemo(() => Math.max(0, value), [value]);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const animate = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [duration, target, inView]);
  const formatted = useMemo(() => val.toLocaleString(), [val]);
  return (
    <div className="text-2xl sm:text-4xl font-extrabold tracking-tight">
      {formatted}
      {suffix}
    </div>
  );
}

function LineReveal({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <h1 className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="block opacity-0 will-change-transform animate-reveal"
          style={{ animationDelay: `${i * REVEAL_DELAY_STEP}s` as any }}
        >
          {line}
        </span>
      ))}
    </h1>
  );
}

export function HeroSection() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const dressRef = useRef<HTMLImageElement | null>(null);
  const rose1Ref = useRef<HTMLImageElement | null>(null);
  const rose2Ref = useRef<HTMLImageElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [reservedHeight, setReservedHeight] = useState(0);

  // typing text (per-line for heading)
  const headingLines = ["Find clothes that", "matches your", "style"];
  const [hLine, setHLine] = useState(0);
  const [hChar, setHChar] = useState(0);
  const typedHeading = useMemo(
    () =>
      headingLines.map((line, idx) =>
        idx < hLine ? line : idx === hLine ? line.slice(0, hChar) : ""
      ),
    [headingLines, hLine, hChar],
  );
  const [headingDone, setHeadingDone] = useState(false);
  const paraFull =
    "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.";
  const [pChar, setPChar] = useState(0);
  const typedPara = useMemo(() => paraFull.slice(0, pChar), [paraFull, pChar]);

  // Start heading typewriter when in view
  useEffect(() => {
    if (headingDone) return;
    if (hLine >= headingLines.length) {
      setHeadingDone(true);
      return;
    }
    const delay = hChar < headingLines[hLine].length ? HEADING_CHAR_MS : LINE_BREAK_DELAY_MS;
    const t = setTimeout(() => {
      if (hChar < headingLines[hLine].length) {
        setHChar(hChar + 1);
      } else {
        setHLine(hLine + 1);
        setHChar(0);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [headingDone, hLine, hChar]);

  // Paragraph typewriter after heading finishes
  useEffect(() => {
    if (!headingDone) return;
    if (pChar >= paraFull.length) return;
    const t = setTimeout(() => setPChar(pChar + 1), PARA_CHAR_MS);
    return () => clearTimeout(t);
  }, [headingDone, pChar, paraFull]);

  // light parallax (lg+ only)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const isLarge = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    if (!isLarge) return;
    let raf = 0;
    let lastDress = 0;
    let lastRose1 = 0;
    let lastRose2 = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        // progress -1..1 around viewport
        const center = rect.top + rect.height / 2 - vh / 2;
        const p = Math.max(-1, Math.min(1, center / vh));
        const dressTarget = -6 * p; // px (gentle)
        const roseTarget = 8 * p;
        // simple lerp for smoothness
        lastDress = lastDress + (dressTarget - lastDress) * 0.15;
        lastRose1 = lastRose1 + (roseTarget - lastRose1) * 0.15;
        lastRose2 = lastRose2 + (roseTarget * 1.2 - lastRose2) * 0.15;
        if (dressRef.current) dressRef.current.style.transform = `translateY(${lastDress.toFixed(2)}px)`;
        if (rose1Ref.current) rose1Ref.current.style.transform = `translateY(${lastRose1.toFixed(2)}px)`;
        if (rose2Ref.current) rose2Ref.current.style.transform = `translateY(${lastRose2.toFixed(2)}px)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  useLayoutEffect(() => {
    const target = headingRef.current;
    const meas = measureRef.current;
    if (!target || !meas) return;
    const update = () => {
      if (!headingRef.current || !measureRef.current) return;
      const w = headingRef.current.clientWidth;
      measureRef.current.style.width = `${w}px`;
      requestAnimationFrame(() => {
        if (!measureRef.current) return;
        const h = measureRef.current.offsetHeight;
        setReservedHeight(h);
      });
    };
    update();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(target);
    }
    const onWinResize = () => update();
    window.addEventListener("resize", onWinResize);
    return () => {
      window.removeEventListener("resize", onWinResize);
      if (ro) ro.disconnect();
    };
  }, []);
  return (
    <section className="  lg:relative" style={{marginTop:"-20px", ["--reveal-duration" as any]: `${REVEAL_DURATION}ms`, ["--fade-dur" as any]: `${FADE_DURATION}ms` }}>
      <div ref={sectionRef} className="container py-8 sm:py-8 lg:h-[85dvh] lg:py-0 justify-center flex items-start   " style={{margin:"0px auto"}}>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
          {/* Left column */}
          <div>
            <div ref={headingRef} style={{ height: reservedHeight || undefined }}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.05] text-foreground">
                <span className="block">{typedHeading[0]}</span>
                <span className="block">{typedHeading[1]}</span>
                <span className="block">{typedHeading[2]}</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl">{typedPara}</p>
            </div>
            <div
              ref={measureRef}
              aria-hidden
              style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", left: "-10000px", top: 0 }}
            >
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.05] text-foreground">
                <span className="block">{headingLines[0]}</span>
                <span className="block">{headingLines[1]}</span>
                <span className="block">{headingLines[2]}</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl">{paraFull}</p>
            </div>
            <div className="mt-8">
              <Button asChild size="lg" className="h-12 px-8 text-base rounded-full">
                <Link href="/shop">Shop Now</Link>
              </Button>
            </div>
            <div ref={ref} className="mt-10 grid grid-cols-3 divide-x divide-border/60">
              <div className="px-6">
                <Counter value={40} suffix="+" inView={true} />
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground/80">Unique Designs</div>
              </div>
              <div className="px-6">
                <Counter value={100} suffix="+" inView={true} />
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground/80">High-Quality Products</div>
              </div>
              <div className="px-6">
                <Counter value={3000} suffix="+" inView={true} />
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground/80">Happy Customers</div>
              </div>
            </div>
          </div>
          {/* Right column */}
          <div className="flex items-center justify-center lg:relative">
            <div className="w-full max-w-[560px] lg:relative">
              <img
                src="/Storefront/images/dress.png"
                alt="Featured"
                className="w-full h-auto object-contain animate-fade-in will-change-transform"
                loading="eager"
                ref={dressRef}
              />
              <img
                src="/Storefront/images/vector2.png"
                alt=""
                aria-hidden
                className="hidden lg:block pointer-events-none select-none absolute w-20 sm:w-24 opacity-90 -rotate-12 animate-float-slow will-change-transform"
                ref={rose1Ref}
                style={{ top: "14%", right: "8%" }}
              />
              <img
                src="/Storefront/images/vector2.png"
                alt=""
                aria-hidden
                className="hidden lg:block pointer-events-none select-none absolute w-14 sm:w-16 opacity-90 rotate-6 animate-float-slower will-change-transform"
                ref={rose2Ref}
                style={{ bottom: "40%", left: "7%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
