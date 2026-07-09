"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/section3.scss";

gsap.registerPlugin(ScrollTrigger);

const Section3 = () => {
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftRef.current?.children ?? [], {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: leftRef.current, start: "top 85%" },
      });
      gsap.from(rightRef.current?.children ?? [], {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: rightRef.current, start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section3" id="about" ref={sectionRef}>
      <div className="elai-shell">
        <div className="section3-content">
          <div className="section3-left" ref={leftRef}>
            <p className="section3-subtitle">ABOUT OUR COMPANY</p>
            <h2 className="section3-title">
              Where every look
              <br />
              finds its flavour.
            </h2>
            <p className="section3-hook">#AccessoryGameStrong</p>
            <p className="section3-lead">
              Because accessories deserve a spotlight, not a side aisle. Because
              you shouldn&apos;t scroll past mixers while looking for hoops.
              Because running around ten sites is so 2015.
            </p>
            <p className="section3-body">
              ELAI was created for everyone who loves looking effortlessly
              put-together without the endless hunt. Weddings, festivals, office
              days, date nights  every look needs that perfect finishing touch.
            </p>
            <p className="section3-body">
              From big brands to indie creators, from daily must-haves to
              statement-stealers, ELAI brings the whole accessory universe to
              one place  sorted, simplified, and completely drama-free.
            </p>
          </div>

          <div className="section3-right" ref={rightRef}>
            <div className="section3-card">
              <p className="section3-card__label">Brand Story</p>
              <h3>The All-in-One Chaos Solver</h3>
              <p>
                Every season brings a new outfit crisis  weddings, festivals,
                brunches, dates, office parties. But matching accessories? Always
                the biggest headache. So we built ELAI: one place where every
                vibe, every season, and every style comes together  minus the
                drama.
              </p>
            </div>
            <div className="section3-card">
              <p className="section3-card__label">Brand Story</p>
              <h3>We Curate, So You Don&apos;t Cry</h3>
              <p>
                Scrolling through hundreds of random listings on big apps is
                basically emotional damage. At ELAI, we handpick only the good
                stuff  the cute, the classy, the aesthetic, the &quot;OMG where
                is this from?&quot; pieces. No chaos. No clutter.
              </p>
            </div>
            <div className="section3-card section3-card--highlight">
              <p className="section3-card__label">Vision</p>
              <p>
                To build India&apos;s largest, most trusted accessories ecosystem
                by offering limitless variety, convenience, affordability, and
                trend-driven discovery all in one ELAI-powered marketplace.
              </p>
            </div>
            <div className="section3-card">
              <p className="section3-card__label">Mission</p>
              <p>
                To create India&apos;s first all-inclusive accessories destination
                 a seamless, curated marketplace that brings every style, every
                trend, and every category together under one platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section3;
