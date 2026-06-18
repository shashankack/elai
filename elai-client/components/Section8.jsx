"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VENDOR_PORTAL_URL } from "@/lib/vendor-portal-url";
import "../styles/section8.scss";

gsap.registerPlugin(ScrollTrigger);

const Section8 = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "",
    newsletter: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".section8-left > *", {
        x: -60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".section8-left", start: "top 80%" },
      });
      gsap.from(".section8-right", {
        x: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".section8-right", start: "top 80%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = VENDOR_PORTAL_URL;
  };

  return (
    <section className="section8" id="contact" ref={sectionRef}>
      {/* bg image layer */}
      <div className="section8-bg" />

      <div className="elai-shell">
        <div className="section8-content">
          <div className="section8-left">
            <p className="section8-subtitle">BE PART OF ELAI</p>
            <h2 className="section8-title">
              Apply as
              <br />
              Seller on Elai
            </h2>
            <p className="section8-description">
              India&apos;s first accessories-only marketplace is launching soon.
              Sign up now to be first in line — whether you&apos;re a shopper or
              a seller.
            </p>
            <div className="section8-perks">
              <div className="perk">✓ Exclusive early-access offers</div>
              <div className="perk">✓ Priority access to new drops</div>
              <div className="perk">
                ✓ Free Elai Prime for first 1000 members
              </div>
            </div>

            {/* Floating accessory images */}
            <div className="s8-floaters">
              <img className="s8-floater s8-floater--a" src="77.jpeg" alt="" />
              <img className="s8-floater s8-floater--b" src="99.jpeg" alt="" />
            </div>
          </div>

          <div className="section8-right">
            {submitted ? (
              <div className="form-success">
                <div className="form-success__icon">✓</div>
                <h3>You&apos;re on the list!</h3>
                <p>
                  We&apos;ll be in touch as soon as Elai launches. Stay tuned.
                </p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row name-row">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row two-col-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group radio-group">
                  <label className="radio-label">I am interested as a:</label>
                  <div className="radio-options">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="type"
                        value="shopper"
                        checked={formData.type === "shopper"}
                        onChange={handleInputChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-text">Shopper</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="type"
                        value="seller"
                        checked={formData.type === "seller"}
                        onChange={handleInputChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-text">Seller / Brand</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="type"
                        value="both"
                        checked={formData.type === "both"}
                        onChange={handleInputChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-text">Both</span>
                    </label>
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="newsletter-checkbox">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">
                      Keep me updated with Elai news, launches and exclusive
                      offers.
                    </span>
                  </label>
                </div>

                <button type="submit" className="submit-btn">
                  Apply as Seller →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section8;
