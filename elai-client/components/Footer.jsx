import Link from "next/link";
import { CONTACT, SITE_CATEGORIES } from "@/lib/site-content";
import { VENDOR_PORTAL_URL } from "@/lib/vendor-portal-url";

const shortName = (name) =>
  name
    .replace(/\s+Accessories$/i, "")
    .replace(/^Bags & Small$/i, "Bags")
    .replace(/^Beauty Add-On$/i, "Beauty");

const FALLBACK_SHOP_LINKS = SITE_CATEGORIES.map((category) => ({
  name: shortName(category.title),
  href: `/shop?category=${encodeURIComponent(category.handle)}`,
}));

const exploreLinks = [
  { name: "Shop all", href: "/shop" },
  { name: "Why Elai", href: "/#why-elai" },
  { name: "FAQ", href: "/#faq" },
];

const sellerLinks = [
  { name: "Apply as seller", href: VENDOR_PORTAL_URL, external: true },
  { name: CONTACT.email, href: `mailto:${CONTACT.email}`, external: true },
];

export default function Footer({ categories }) {
  const shopLinks =
    categories && categories.length
      ? categories.map((category) => ({
          name: shortName(category.title),
          href: `/shop?category=${encodeURIComponent(category.handle)}`,
        }))
      : FALLBACK_SHOP_LINKS;

  return (
    <footer className="footer">
      <div className="footer__glow" aria-hidden />

      <div className="elai-commerce-shell footer__inner">
        <div className="footer__hero">
          <div className="footer__brand">
            <Link href="/" className="footer__wordmark font-heading">
              elai
            </Link>
            <p className="footer__tagline font-subheading">
              India&apos;s accessories marketplace  jewellery, fashion, hair,
              bags, beauty, tech &amp; more. {CONTACT.tagline}
            </p>
          </div>

          <div className="footer__cta-row">
            <Link href="/shop" className="footer__btn footer__btn--primary font-subheading">
              Browse shop
            </Link>
            <a
              href={VENDOR_PORTAL_URL}
              className="footer__btn footer__btn--ghost font-subheading"
            >
              Sell on Elai
            </a>
          </div>
        </div>

        <div className="footer__shop">
          <p className="footer__label font-subheading">Shop by category</p>
          <ul className="footer__chips">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="footer__chip font-subheading">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__nav">
          <nav className="footer__col" aria-label="Explore">
            <p className="footer__label font-subheading">Explore</p>
            <ul>
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-subheading">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer__col" aria-label="Sellers">
            <p className="footer__label font-subheading">Sellers &amp; contact</p>
            <ul>
              {sellerLinks.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a href={link.href} className="font-subheading">
                      {link.name}
                    </a>
                  ) : (
                    <Link href={link.href} className="font-subheading">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__col footer__col--locale">
            <p className="footer__label font-subheading">Based in</p>
            <p className="footer__locale font-subheading">{CONTACT.location}</p>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="font-subheading">
            © {new Date().getFullYear()} ELAI. All rights reserved.
          </p>
          <p className="footer__credit font-subheading">
            Built by{" "}
            <a
              href="https://www.baw.studio"
              target="_blank"
              rel="noreferrer"
            >
              BAW Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
