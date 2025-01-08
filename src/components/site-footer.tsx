"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { useTheme } from "next-themes";

const sections = [
  {
    title: "Product",
    links: [
      { label: "Benefits", href: "/benefits" },
      { label: "Solutions", href: "/solutions" },
      { label: "Pricing", href: "/pricing" },
      { label: "Savings Tool", href: "/tool" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
      { label: "Server Status", href:"/status" },
      
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Affiliate Program", href: "/partners/affiliate" },
      { label: "Agency Program", href: "/partners/agency" },
      { label: "Documentation (soon)", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: Linkedin, href: "https://www.linkedin.com/company/dialwiseai/" },
  { icon: Twitter, href: "https://x.com/TheDialwiseAI" },
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61567280125355" },
  { icon: Instagram, href: "https://www.instagram.com/dialwiseai" },
  { icon: Youtube, href: "https://www.youtube.com/@dialwiseai" },
];

const SiteFooter = () => {
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show logo after client-side hydration is complete
  const logoSrc = !mounted ? '/dialwise-logo-w' : theme === 'dark' ? '/dialwise-logo-w.webp' : '/dialwise-logo.webp';

  return (
    <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div>
              <Link href="/" className="block mb-4">
                <div className="relative">
                  <Image
                    src={logoSrc}
                    alt="DialWise.ai"
                    height={31}
                    width={166}
                    className="object-contain"
                  />
                </div>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Transforming customer experience with AI-powered voice agents and chatbots. 
                Delivering intelligent, natural conversations that drive results.
              </p>
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Navigation Sections */}
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © {currentYear} DialWise.ai. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                {/* <Link href="/partners" className="text-sm text-muted-foreground hover:text-primary">
                  Partners
                </Link> */}
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
    </footer>
  );
};

export default SiteFooter;
