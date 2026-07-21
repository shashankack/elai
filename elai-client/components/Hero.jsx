"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { VENDOR_PORTAL_URL } from "@/lib/vendor-portal-url";
import { HERO_STATS } from "@/lib/site-content";
import "../styles/hero.scss";

gsap.registerPlugin(useGSAP);

const Hero = () => {
  const rootRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroTextRef = useRef(null);
  const pathname = usePathname();

  // Re-run on every visit to `/` (client navigations remount, but
  // pathname keeps the timeline honest if the instance is reused).
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set([heroImageRef.current, heroTextRef.current], {
          clearProps: "all",
          opacity: 1,
          scale: 1,
          y: 0,
        });
        return;
      }

      gsap
        .timeline()
        .fromTo(
          heroImageRef.current,
          { scale: 1.15, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.6, ease: "power3.out" },
        )
        .fromTo(
          heroTextRef.current,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" },
          "-=0.9",
        );
    },
    { scope: rootRef, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div className="elai-container" ref={rootRef}>
      <section className="hero">
        <div className="hero-carousel">
          <div className="hero-image active" ref={heroImageRef}>
            <img src="/Gradient.png" alt="Elai hero background" />
          </div>
        </div>

        <div className="hero-content">
          <div className="elai-shell">
            <div ref={heroTextRef}>
              <span className="hero-eyebrow">
                India&apos;s Accessory Destination · 2026
              </span>
              <h1 className="hero-text">
                Every accessory.
                <br />
                One platform.
              </h1>
              <p className="hero-text-des">
                ELAI is India&apos;s only dedicated accessories marketplace,
                designed to bring every possible accessory category  across
                fashion, lifestyle, tech, beauty, ethnic, luxury, and daily
                essentials  onto one unified platform. With a clean, premium
                experience and deep category segmentation, we aim to become the
                go-to app for every accessory a customer needs.
              </p>
              <div className="hero-ctas">
                <a
                  href={VENDOR_PORTAL_URL}
                  className="hero-cta hero-cta--primary"
                >
                  Apply as Seller
                </a>
                <a href="/shop" className="hero-cta hero-cta--secondary">
                  Shop now
                </a>
              </div>
            </div>
          </div>
        </div>

        <button
          className="scroll-indicator"
          onClick={() => {
            document
              .getElementById("categories")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span>↓</span>
          <span>Shop by category</span>
        </button>
      </section>

      <div className="hero-stats">
        <div className="elai-shell hero-stats__inner">
          {HERO_STATS.flatMap((stat, index) => [
            index > 0 ? (
              <div key={`divider-${index}`} className="hero-stat-divider" />
            ) : null,
            <div key={stat.label} className="hero-stat">
              <span className="hero-stat__number">{stat.number}</span>
              <span className="hero-stat__label">{stat.label}</span>
            </div>,
          ])}
        </div>
      </div>
    </div>
  );
};

export default Hero;
