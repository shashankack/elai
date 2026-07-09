"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { VENDOR_PORTAL_URL } from "@/lib/vendor-portal-url";
import { HERO_STATS } from "@/lib/site-content";
import "../styles/hero.scss";

const Hero = () => {
  const heroImageRef = useRef(null);
  const heroTextRef = useRef(null);

  // Initial entry animation
  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(heroImageRef.current, {
      scale: 1.15,
      opacity: 0,
      duration: 1.6,
      ease: "power3.out",
    }).from(
      heroTextRef.current,
      { y: 80, opacity: 0, duration: 1.1, ease: "power3.out" },
      "-=0.9",
    );
  }, []);

  return (
    <div className="elai-container">
      <section className="hero">
        <div className="hero-carousel">
          <div
            className="hero-image active"
            ref={heroImageRef}
            style={{ opacity: 1 }}
          >
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
              .getElementById("about")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span>↓</span>
          <span>Scroll to explore</span>
        </button>
      </section>

      {/* Stats bar */}
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
