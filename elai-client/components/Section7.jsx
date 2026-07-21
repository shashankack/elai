"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FAQS } from "@/lib/site-content";
import "../styles/section7.scss";

gsap.registerPlugin(ScrollTrigger);

const Section7 = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);

  const faqs = [...FAQS];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".section7-header > *", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".section7-header", start: "top 85%" },
      });
      gsap.from(".faq-item", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: ".faq-list", start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="section7" id="faq" ref={sectionRef}>
      <div className="elai-shell">
        <div className="section7-content">
          <div className="section7-header">
            <p className="section7-subtitle">FAQs</p>
            <h2 className="section7-title">
              Got questions<br />about ELAI?
            </h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openIndex === index ? "open" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openIndex === index}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>
                <div className="faq-answer-wrapper">
                  <div className="faq-answer-inner">
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section7;
  