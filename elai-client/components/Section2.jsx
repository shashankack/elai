"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE_CATEGORIES } from "@/lib/site-content";
import "../styles/section2.scss";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_CATEGORIES = SITE_CATEGORIES.map((c) => ({
  id: `static:${c.handle}`,
  title: c.title,
  handle: c.handle,
  items: c.items,
  img: c.img,
}));

const Section2 = ({ categories: categoriesProp }) => {
  const categories =
    categoriesProp && categoriesProp.length
      ? categoriesProp
      : FALLBACK_CATEGORIES;
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
            50+ categories and growing
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
                From jewellery and bags to watches, eyewear, hair add-ons, tech
                accessories, belts, socks, and travel essentials  ELAI brings
                together every category that completes a look, with clean
                segmentation and curated collections.
              </p>
              <a href="/shop" className="categories-cta">
                Shop all categories →
              </a>
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <a
              key={cat.handle}
              href={`/shop?category=${encodeURIComponent(cat.handle)}`}
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section2;
