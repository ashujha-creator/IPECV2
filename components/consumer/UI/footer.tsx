"use client";
import React from "react";
import {
  Newspaper,
  FileBarChart2,
  UserRoundPlus,
  Globe2,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { CiFacebook, CiLinkedin, CiYoutube, CiInstagram } from "react-icons/ci";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface QuickActionItem {
  /** Visible label, e.g. "Enquire Now!" */
  label: string;
  /** Destination URL */
  href: string;
  /** Lucide icon component rendered inside the badge */
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkColumn {
  heading: string;
  links: FooterLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface ContactInfo {
  addressLines: string[];
  helplineLabel: string;
  helplineLines: string[];
  email: string;
  emailHref?: string;
}

export interface FooterProps {
  quickActions?: QuickActionItem[];
  contact?: ContactInfo;
  linkColumns?: FooterLinkColumn[];
  socialLinks?: SocialLink[];
  whatsappHref?: string;
  /** Show/hide the floating WhatsApp button (default: true) */
  showWhatsapp?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default content (mirrors the design screenshot)                    */
/* ------------------------------------------------------------------ */

const defaultQuickActions: QuickActionItem[] = [
  { label: "IPEC CONNECT Newsletter", href: "#", icon: Newspaper },
  { label: "Annual Reports", href: "#", icon: FileBarChart2 },
  { label: "Enquire Now!", href: "#", icon: UserRoundPlus },
  { label: "ERP portal", href: "#", icon: Globe2 },
];

const defaultContact: ContactInfo = {
  addressLines: [
    "63 Site IV, Sahibabad Industrial Area,",
    "Surya Nagar Flyover Road Sahibabad,",
    "Ghaziabad-Up. PIN Code-201010",
  ],
  helplineLabel: "Helpline No",
  helplineLines: [
    "+91-9910449090,",
    "7428787744 (For admission-related queries)",
  ],
  email: "addmission@ipec.org.in",
};

const defaultLinkColumns: FooterLinkColumn[] = [
  {
    heading: "Quick Links",
    links: [
      { label: "About IPEC", href: "#" },
      { label: "Governance", href: "#" },
      { label: "MOA", href: "#" },
      { label: "NAD", href: "#" },
      { label: "Grievances", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Minutes Of Meeting", href: "#" },
    ],
  },
  {
    heading: "Important Links",
    links: [
      { label: "Inderprastha Business School", href: "#" },
      { label: "Mandatory disclosure", href: "#" },
      { label: "IQAC", href: "#" },
      { label: "Anti-Ragging Compliance", href: "#" },
      { label: "Career Openings", href: "#" },
      { label: "View More", href: "#" },
    ],
  },
  {
    heading: "R&D",
    links: [
      { label: "Guidelines for Research", href: "#" },
      { label: "Centres for Research", href: "#" },
      { label: "Sponsored Projects", href: "#" },
      { label: "Research Publications", href: "#" },
    ],
  },
];

const defaultSocialLinks: SocialLink[] = [
  { label: "Facebook", href: "#", icon: CiFacebook },
  { label: "Instagram", href: "#", icon: CiInstagram },
  { label: "LinkedIn", href: "#", icon: CiLinkedin },
  { label: "YouTube", href: "#", icon: CiYoutube },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function QuickActionBadge({ label, href, icon: Icon }: QuickActionItem) {
  return (
    <a
      href={href}
      className="
        group flex items-center gap-3 rounded-xl border border-white/15
        bg-white/[0.03] px-4 py-3.5 transition-colors duration-200
        hover:border-white/30 hover:bg-white/[0.07]
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-orange-400
      "
    >
      <span
        className="
          flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
          bg-white/10 text-white transition-colors duration-200
          group-hover:bg-orange-500/90
        "
        aria-hidden="true"
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="text-[13.5px] font-semibold leading-snug text-white sm:text-sm">
        {label}
      </span>
    </a>
  );
}

function FooterColumn({ heading, links }: FooterLinkColumn) {
  return (
    <nav
      aria-labelledby={`footer-heading-${heading.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <h3
        id={`footer-heading-${heading.replace(/\s+/g, "-").toLowerCase()}`}
        className="mb-3 text-[15px] font-semibold text-white"
      >
        {heading}
      </h3>
      <span
        className="mb-4 block h-px w-9 bg-orange-500/80"
        aria-hidden="true"
      />
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="
                text-[13.5px] text-white/70 transition-colors duration-150
                hover:text-white hover:underline hover:underline-offset-2
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-orange-400 focus-visible:rounded-sm
              "
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */

export default function Footer({
  quickActions = defaultQuickActions,
  contact = defaultContact,
  linkColumns = defaultLinkColumns,
  socialLinks = defaultSocialLinks,
  whatsappHref = "https://wa.me/919910449090",
  showWhatsapp = true,
  className = "",
}: FooterProps) {
  return (
    <footer
      className={`relative bg-[#0B1550] text-white ${className}`}
      aria-labelledby="site-footer-heading"
    >
      <h2 id="site-footer-heading" className="sr-only">
        Site footer
      </h2>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Quick action badges */}
        <ul
          className="
            grid grid-cols-1 gap-3 border-b border-white/10 pb-8
            sm:grid-cols-2 lg:grid-cols-4
          "
        >
          {quickActions.map((action) => (
            <li key={action.label}>
              <QuickActionBadge {...action} />
            </li>
          ))}
        </ul>

        {/* Main columns */}
        <div
          className="
            grid grid-cols-1 gap-10 py-10
            sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]
          "
        >
          {/* Contact / address column */}
          <div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin
                  className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                  aria-hidden="true"
                />
                <address className="not-italic text-[13.5px] leading-relaxed text-white/70">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
              <li className="flex gap-3">
                <Phone
                  className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                  aria-hidden="true"
                />
                <p className="text-[13.5px] leading-relaxed text-white/70">
                  <span className="text-white/90">
                    {contact.helplineLabel}{" "}
                  </span>
                  {contact.helplineLines.map((line, i) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </li>
              <li className="flex gap-3">
                <Mail
                  className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                  aria-hidden="true"
                />
                <a
                  href={contact.emailHref}
                  className="
                    break-all text-[13.5px] text-white/70 transition-colors
                    hover:text-white hover:underline
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-orange-400 focus-visible:rounded-sm
                  "
                >
                  {contact.email}
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h3 className="mb-3 text-[15px] font-semibold text-white">
                Connect With Us
              </h3>
              <ul className="flex items-center gap-2.5">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      className="
                        flex h-8 w-8 items-center justify-center rounded-full
                        bg-white text-[#0B1550] transition-transform duration-150
                        hover:scale-105 hover:bg-orange-500 hover:text-white
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                        focus-visible:outline-orange-400
                      "
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {linkColumns.map((column) => (
            <FooterColumn key={column.heading} {...column} />
          ))}
        </div>
      </div>

      {/* Floating WhatsApp button */}
      {showWhatsapp && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="
            absolute -bottom-5 left-4 flex h-11 w-11 items-center justify-center
            rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30
            transition-transform duration-150 hover:scale-105
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-orange-400
            sm:left-6
          "
        >
          <MessageCircle
            className="h-5 w-5"
            fill="currentColor"
            strokeWidth={0}
          />
        </a>
      )}
      <h3 className="text-center text-[13.5px] text-white/70 pb-4">
        &copy; {new Date().getFullYear()} Inderprastha Engineering College. All
        rights reserved. Made with ❤️ by Ashu Jha.
      </h3>
    </footer>
  );
}
