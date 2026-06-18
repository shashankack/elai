"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VENDOR_PORTAL_URL } from "@/lib/vendor-portal-url";
import "../styles/section2.scss";

gsap.registerPlugin(ScrollTrigger);

const categories = [
  {
    title: "Fashion Jewellery",
    items: "Earrings, rings, chains, pendants, chokers, anklets",
    img: "1.png",
  },
  {
    title: "Men's Accessories",
    items: "Watches, wallets, belts, ties, sunglasses, caps",
    img: "2.png",
  },
  {
    title: "Bags & Travel",
    items: "Handbags, totes, sling bags, backpacks, po...",
    img: "3.png",
  },
  {
    title: "Ethnic Accessories",
    items: "Jhumkas, maang tikkas, kamarbandhs, turbans",
    img: "4.png",
  },
  {
    title: "Tech Accessories",
    items: "Phone covers, smartwatch straps, earbuds c...",
    img: "5.png",
  },
  {
    title: "Beauty Add-Ons",
    items: "Headbands, rollers, cosmetic pouches, organizers",
    img: "6.png",
  },
  {
    title: "Luxury Pieces",
    items: "Silver, gold-plated, handcrafted, designer bags",
    img: "7.png",
  },
  {
    title: "Seasonal & Gifting",
    items: "Festival collections, couple rings, personali...",
    img: "8.png",
  },
];

const Section2 = () => {
  const sectionRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingRef = useRef(null);
  const rightRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Eyebrow
      gsap.from(eyebrowRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: eyebrowRef.current,
          start: "top 88%",
        },
      });

      // Heading
      gsap.from(headingRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 88%",
        },
      });

      // Right side desc + cta
      gsap.from(rightRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rightRef.current,
          start: "top 88%",
        },
      });

      // Cards — use fromTo so cards stay in final layout position.
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
          scrollTrigger: {
            trigger: ".categories-grid",
            start: "top 85%",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);
  return (
    <section className="categories" id="categories" ref={sectionRef}>
      <div className="cat-blob cat-blob--1" />
      <div className="cat-blob cat-blob--2" />

      <div className="elai-shell">
        {/* ── Header ── */}
        <div className="categories-top">
          <span className="categories-eyebrow" ref={eyebrowRef}>
            40+ categories and growing
          </span>

          <div className="categories-header">
            {/* Left: heading */}
            <div className="categories-left">
              <h2 className="categories-heading" ref={headingRef}>
                Every accessory <em>you&apos;ve ever wanted.</em>
              </h2>
            </div>

            {/* Right: description + CTA */}
            <div className="categories-right" ref={rightRef}>
              <p className="categories-desc">
                From everyday fashion to luxury statement pieces, Elai brings
                India&apos;s widest accessories selection onto one elegant,
                easy-to-browse platform.
              </p>
              <a href={VENDOR_PORTAL_URL} className="categories-cta">
                Apply as Seller →
              </a>
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="category-card"
              ref={(el) => (cardsRef.current[index] = el)}
            >
              {/* Full-bleed image */}
              <div className="category-card__img">
                <img src={cat.img} alt={cat.title} />
              </div>

              {/* Number badge */}
              <span className="category-card__num">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Bottom overlay */}
              <div className="category-card__body">
                <span className="category-card__name">{cat.title}</span>
                <span className="category-card__tags">{cat.items}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section2;
