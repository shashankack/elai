"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/section7.scss";

gsap.registerPlugin(ScrollTrigger);

const Section7 = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);

  const faqs = [
    {
      question: "What is Elai?",
      answer:
        "Elai is India's first and only dedicated accessories marketplace. Unlike general e-commerce platforms, Elai is exclusively built around accessories — covering 40+ categories from fashion jewellery to tech accessories, ethnic pieces, luxury items, and everything in between.",
    },
    {
      question: "When will Elai launch?",
      answer:
        "We are currently in the early-access phase, building out our seller network and platform experience. Sign up to be among the first to shop on Elai the moment we go live. Early access members will receive exclusive launch offers.",
    },
    {
      question: "How is Elai different from Myntra or Amazon?",
      answer:
        "Myntra and Amazon are general marketplaces where accessories are just one of thousands of categories. Elai is exclusively accessories-first — every feature, every filter, every recommendation is designed for accessory discovery. You'll find deeper category segmentation, trend-driven curation, and a far better browsing experience.",
    },
    {
      question: "Can I sell my accessories on Elai?",
      answer:
        "Yes! Elai is a marketplace open to sellers across India. We offer Starter, Growth, and Premium seller plans. Sellers get a dedicated brand store page, inventory management dashboard, analytics, and exposure to a highly targeted accessories-focused audience.",
    },
    {
      question: "What categories does Elai cover?",
      answer:
        "Elai hosts 40+ accessory categories including fashion jewellery, men's accessories, ethnic pieces, luxury accessories, tech accessories, bags & travel, beauty add-ons, foot accessories, and seasonal/gifting collections. The number of categories will keep growing.",
    },
    {
      question: "Does Elai offer fast delivery?",
      answer:
        "Yes. Elai will offer one-day delivery in metro cities at launch, with pan-India delivery for all other locations. We also support Cash on Delivery and all major secure payment methods.",
    },
    {
      question: "Will Elai have an app?",
      answer:
        "Absolutely. Elai will launch as a mobile-first app with smart category browsing, a style quiz for personalised recommendations, ultra-fast search, and AR virtual try-ons as a future feature.",
    },
    {
      question: "Is there an Elai membership?",
      answer:
        "Yes — Elai Prime membership will offer free delivery, early access to new drops, loyalty points, and exclusive brand collaboration deals. Details will be shared at launch.",
    },
  ];

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
    <section className="section7" ref={sectionRef}>
      <div className="elai-shell">
        <div className="section7-content">
          <div className="section7-header">
            <p className="section7-subtitle">FAQs</p>
            <h2 className="section7-title">
              Got questions<br />about Elai?
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
  