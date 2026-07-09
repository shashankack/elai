"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VENDOR_PORTAL_URL } from "@/lib/vendor-portal-url";
import {
  PLATFORM_FEATURES,
  SELLER_BENEFITS,
  SITE_CATEGORIES,
} from "@/lib/site-content";
import "../styles/section6.scss";

gsap.registerPlugin(ScrollTrigger);

const Section6 = () => {
  const features = [...PLATFORM_FEATURES];
  const revenueStreams = [...SELLER_BENEFITS];

  const sectionRef = useRef(null);
  const featCardsRef = useRef([]);
  const revenueRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".section6-header", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".section6-header", start: "top 85%" },
      });

      gsap.from(featCardsRef.current, {
        y: 60,
        opacity: 0,
        scale: 0.93,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".features-grid", start: "top 85%" },
      });

      if (revenueRef.current) {
        gsap.from(
          revenueRef.current.querySelectorAll(
            ".revenue-left > *, .revenue-item",
          ),
          {
            y: 40,
            opacity: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: revenueRef.current, start: "top 80%" },
          },
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section6" id="sellers" ref={sectionRef}>
      <div className="section6-content">
        <div className="elai-shell">
          <div className="section6-header">
            <p className="section6-subtitle">OVERVIEW OF SERVICES</p>
            <h2 className="section6-title">
              Accessorising made
              <br />
              effortless & expressive
            </h2>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card"
                ref={(el) => (featCardsRef.current[i] = el)}
              >
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section6-revenue" ref={revenueRef}>
        <div className="elai-shell">
          <div className="section6-revenue__inner">
            <div className="revenue-left">
              <p className="section6-subtitle">SELL ON ELAI</p>
              <h2 className="revenue-title">
                A marketplace
                <br />
                that works for you
              </h2>
              <p className="revenue-desc">
                ELAI supports emerging designers, artisans, and accessory brands
                with a premium digital space to showcase their craft, reach a
                nationwide audience, and stand out beyond overcrowded
                marketplaces.
              </p>
              <a href={VENDOR_PORTAL_URL} className="revenue-cta">
                Apply as a Seller →
              </a>
            </div>
            <div className="revenue-right">
              <div className="revenue-img-wrap">
                <img src="oo.jpeg" alt="Seller showcase" />
                <div className="revenue-img-glass">
                  <ul className="revenue-list">
                    {revenueStreams.map((stream, i) => (
                      <li key={i} className="revenue-item">
                        <span className="revenue-dot" />
                        {stream}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="clients-carousel">
        <div className="clients-track">
          {[...SITE_CATEGORIES, ...SITE_CATEGORIES].map((category, i) => (
            <div key={`${category.title}-${i}`} className="client-logo">
              <div className="logo-frame">
                <span className="logo-text">{category.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section6;
