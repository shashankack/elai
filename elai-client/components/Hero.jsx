"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { VENDOR_PORTAL_URL } from "@/lib/vendor-portal-url";
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
                India&apos;s First Accessories Marketplace
              </span>
              <h1 className="hero-text">
                Every accessory.
                <br />
                One platform.
              </h1>
              <p className="hero-text-des">
                Elai is India&apos;s only dedicated accessories marketplace,
                bringing every accessory category — across fashion, lifestyle,
                tech, beauty, ethnic, luxury, and daily essentials — onto one
                unified platform.
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
          <span>Scroll to explore</span>
        </button>
      </section>

      {/* Stats bar */}
      <div className="hero-stats">
        <div className="elai-shell hero-stats__inner">
          <div className="hero-stat">
            <span className="hero-stat__number">40+</span>
            <span className="hero-stat__label">Categories</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat__number">₹45,000 Cr</span>
            <span className="hero-stat__label">Market Opportunity</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat__number">12–15%</span>
            <span className="hero-stat__label">Annual Growth</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat__number">#1</span>
            <span className="hero-stat__label">First Mover in India</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
