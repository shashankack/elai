"use client";

import { useState, useEffect } from "react";
import { VENDOR_PORTAL_URL } from "@/lib/vendor-portal-url";
import "../styles/navbar.scss";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="nav-outer">
      <header
        className={`header ${scrolled ? "header--scrolled" : ""} ${menuOpen ? "header--open" : ""}`}
      >
        <div className="header-top">
          <img
            src="/logo.png"
            style={{ width: "60px", cursor: "pointer" }}
            alt="Elai Logo"
            onClick={() => (window.location.href = "/")}
          />

          <nav className="header-nav">
            <a href="/shop">Shop</a>
            <a href="#categories">Categories</a>
            <a href="#why-elai">Why Elai</a>
            <a href="#sellers">Sell on Elai</a>
            <a href={VENDOR_PORTAL_URL} className="header-nav__cta">
              Apply as Seller
            </a>
          </nav>

          <button
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Always in DOM — animated via CSS */}
        <nav className="mobile-menu">
          <a href="/shop" onClick={() => setMenuOpen(false)}>
            Shop
          </a>
          <a href="#categories" onClick={() => setMenuOpen(false)}>
            Categories
          </a>
          <a href="#why-elai" onClick={() => setMenuOpen(false)}>
            Why Elai
          </a>
          <a href="#sellers" onClick={() => setMenuOpen(false)}>
            Sell on Elai
          </a>
          <a
            href={VENDOR_PORTAL_URL}
            onClick={() => setMenuOpen(false)}
            className="mobile-menu__cta"
          >
            Apply as Seller →
          </a>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
