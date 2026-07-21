"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UVP_BENEFITS } from "@/lib/site-content";
import "../styles/section4.scss";

gsap.registerPlugin(ScrollTrigger);

const UVP_MARQUEE_TAGS = [
  "Curated Collections",
  "Trend Discovery",
  "Style Expression",
  "Verified Sellers",
  "Effortless Browsing",
  "Jewellery Finds",
  "Hair Essentials",
  "Bag Edit",
  "Beauty Add-Ons",
  "Tech Accents",
  "Festive Looks",
  "Everyday Glam",
  "Statement Pieces",
  "Layered Styles",
  "New Arrivals",
  "Seller Spotlight",
  "Mood Boards",
  "Accessory First",
  "Handpicked Finds",
  "Wear Your Flavour",
];

const Section4 = () => {
  const benefits = [...UVP_BENEFITS];

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
              <p className="section4-subtitle">UNIQUE VALUE PROPOSITION</p>
              <h2 className="section4-title">
                Why ELAI
                <br />
                is different?
              </h2>
              <p className="section4-description">
                Unlike Amazon, Myntra, or Nykaa, ELAI is exclusively built for
                accessories. India lacks a dedicated, well-organised accessories
                platform  we bring jewellery, bags, watches, eyewear, hair
                add-ons, tech accessories, and more into one seamless,
                enjoyable, and personalised experience.
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

      <div className="uvp-strip" aria-hidden>
        <div className="uvp-strip__inner">
          {[0, 1].map((copy) => (
            <div key={copy} className="uvp-strip__group">
              {UVP_MARQUEE_TAGS.map((tag) => (
                <span key={`${copy}-${tag}`} className="uvp-strip__item">
                  <span className="uvp-strip__tag">{tag}</span>
                  <span className="uvp-strip__dot" aria-hidden>
                    ·
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Section4;

