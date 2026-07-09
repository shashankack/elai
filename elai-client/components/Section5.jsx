"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VENDOR_PORTAL_URL } from "@/lib/vendor-portal-url";
import { TARGET_AUDIENCES } from "@/lib/site-content";
import "../styles/section5.scss";

gsap.registerPlugin(ScrollTrigger);

const Section5 = () => {
  const audiences = [...TARGET_AUDIENCES];

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current.children, {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: headerRef.current, start: "top 85%" },
      });

      // Cards  use fromTo so cards stay in final layout position.
      // Only animate opacity + scale, NO y movement, so all cards
      // remain on the same baseline throughout the animation.
      gsap.fromTo(
        cardsRef.current,
        {
          opacity: 0,
          scale: 0.93,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.65,
          stagger: 0.07,
          ease: "power3.out",
          clearProps: "transform,opacity", // clean up after animation completes
          scrollTrigger: { trigger: ".criteria-grid", start: "top 85%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section5" ref={sectionRef}>
      <div className="elai-shell">
        <div className="section5-content">
          <div className="section5-header" ref={headerRef}>
            <p className="section5-subtitle">TARGET AUDIENCE</p>
            <h2 className="section5-title">
              Built for every kind
              <br />
              of accessory lover.
            </h2>
            <p className="section5-description">
              From Gen Z and millennials to wedding shoppers, gift buyers, tech
              accessory enthusiasts, ethnic & festival shoppers, and fitness
              lovers  ELAI is designed for expressive, trend-focused shoppers
              across India.
            </p>
          </div>

          <div className="criteria-grid">
            {audiences.map((item, index) => (
              <div
                key={index}
                className="criteria-card"
                ref={(el) => (cardsRef.current[index] = el)}
              >
                <div className="criteria-card__img">
                  <img src={item.img} alt={item.group} />
                </div>
                <div className="criteria-card__body">
                  <p className="criteria-title">{item.group}</p>
                  <p className="criteria-desc">{item.desc}</p>
                </div>
              </div>
            ))}

            <div
              className="criteria-card cta-card"
              ref={(el) => (cardsRef.current[audiences.length] = el)}
            >
              <div className="cta-content">
                <p className="cta-text">Sound like you?</p>
                <div className="cta-action">
                  <a href={VENDOR_PORTAL_URL} className="cta-link">
                    Apply as Seller →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section5;

