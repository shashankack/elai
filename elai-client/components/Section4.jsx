"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/section4.scss";

gsap.registerPlugin(ScrollTrigger);

const Section4 = () => {
  const benefits = [
    "First-of-its-kind accessories-only marketplace in India",
    "40+ deep-segregated categories for effortless discovery",
    "Affordable options alongside premium and luxury picks",
    "Trend-first platform, always current with micro & macro trends",
    "Personalised recommendations via style quiz",
    "One-day delivery in metros with Secure payments & COD",
  ];

  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(imgRef.current, {
        x: -80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: imgRef.current, start: "top 80%" },
      });

      gsap.from(rightRef.current.children, {
        x: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: rightRef.current, start: "top 80%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="section4" id="why-elai" ref={sectionRef}>
        <div className="elai-shell">
          <div className="section4-content">
            <div className="section4-left" ref={imgRef}>
              <div className="s4-img-stack">
                <img
                  className="s4-img s4-img--back"
                  src="papa.jpg"
                  alt="Jewellery"
                />
                <img
                  className="s4-img s4-img--front"
                  src="mumma.jpg"
                  alt="Luxury accessories"
                />

              </div>
            </div>

            <div className="section4-right" ref={rightRef}>
              <p className="section4-subtitle">WHY CHOOSE ELAI</p>
              <h2 className="section4-title">
                Why Elai
                <br />
                is different?
              </h2>
              <p className="section4-description">
                Unlike Amazon, Myntra, or Nykaa, Elai is exclusively built for
                accessories. Every feature, every category, every drop —
                designed for the accessory-first shopper.
              </p>

              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <div className="check-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#748956"
                          strokeWidth="2"
                        />
                        <path
                          d="M8 12L11 15L16 9"
                          stroke="#748956"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="uvp-strip">
        <div className="uvp-strip__inner">
          {[
            "Elai Choice",
            "Elai Style",
            "Elai Confidence",
            "Elai Personality",
            "Elai Convenience",
            "Elai Choice",
            "Elai Style",
            "Elai Confidence",
            "Elai Personality",
            "Elai Convenience",
          ].map((tag, i) => (
            <span key={i} className="uvp-strip__tag">
              {tag}
              <span className="uvp-strip__dot"> &#183; </span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default Section4;

