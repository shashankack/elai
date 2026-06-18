"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/section6.scss";

gsap.registerPlugin(ScrollTrigger);

const Section6 = () => {
  const features = [
    {
      title: "Smart Categories",
      desc: "40+ intelligently segmented accessory categories for effortless discovery.",
      icon: "",
    },
    {
      title: "Trend-First Homepage",
      desc: "Always updated with micro and macro fashion trends from across India.",
      icon: "",
    },
    {
      title: "Style Quiz & Recs",
      desc: "Personalised picks based on your style profile and browsing behaviour.",
      icon: "",
    },
    {
      title: "One-Day Metro Delivery",
      desc: "Lightning-fast delivery in major metros with real-time tracking.",
      icon: "",
    },
    {
      title: "Seller Dashboard",
      desc: "Inventory, analytics, brand store pages and easy onboarding for sellers.",
      icon: "",
    },
    {
      title: "Elai Prime",
      desc: "Free delivery, early access to drops, loyalty points and exclusive deals.",
      icon: "",
    },
  ];

  const revenueStreams = [
    "Marketplace Commission (8–25%)",
    "Seller Subscription Plans",
    "Ad Placements & Sponsored Listings",
    "Brand Collaborations & Exclusive Drops",
    "Elai Prime Membership",
    "Logistics Partnerships",
  ];

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
            <p className="section6-subtitle">PLATFORM FEATURES</p>
            <h2 className="section6-title">
              Built for the modern
              <br />
              accessory shopper
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
                Join India&apos;s first accessories-dedicated platform and reach
                a highly targeted audience of accessory-first shoppers.
              </p>
              <a href="#contact" className="revenue-cta">
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
          {[
            "Fashion Jewellery",
            "Men's Accessories",
            "Ethnic Pieces",
            "Tech Accessories",
            "Luxury Goods",
            "Bags & Travel",
            "Beauty Add-Ons",
            "Seasonal Gifting",
            "Foot Accessories",
            "Fashion Jewellery",
            "Men's Accessories",
            "Ethnic Pieces",
            "Tech Accessories",
            "Luxury Goods",
            "Bags & Travel",
          ].map((name, i) => (
            <div key={i} className="client-logo">
              <div className="logo-frame">
                <span className="logo-text">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section6;
