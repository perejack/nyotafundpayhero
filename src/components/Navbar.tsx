import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import nyotaLogo from "@/assets/nyota-logo-official.jpg";

interface NavbarProps {
  onApplyClick: () => void;
}

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Loan Types", href: "#loan-types" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

const Navbar = ({ onApplyClick }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("#") && href !== "#") {
      const element = document.getElementById(href.slice(1));
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="container px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo Section */}
            <a href="#" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <img
                src={nyotaLogo}
                alt="NYOTA Fund"
                className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover shadow-sm"
              />
              <div className="flex items-baseline gap-0.5">
                <span className="font-display text-xl md:text-2xl font-black text-nyota-green tracking-tight">
                  NYOTA
                </span>
                <span className="font-display text-xl md:text-2xl font-black text-nyota-red tracking-tight">
                  Fund
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  className="text-sm font-medium text-nyota-charcoal hover:text-nyota-green transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <Button variant="default" size="default" onClick={onApplyClick}>
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-16 right-0 bottom-0 w-3/4 max-w-sm bg-white shadow-2xl"
            >
              <div className="p-6 space-y-6">
                {/* Logo in Mobile Menu */}
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <img
                    src={nyotaLogo}
                    alt="NYOTA Fund"
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-display text-lg font-black text-nyota-green">
                      NYOTA
                    </span>
                    <span className="font-display text-lg font-black text-nyota-red">
                      Fund
                    </span>
                  </div>
                </div>

                {/* Mobile Links */}
                <div className="space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.href);
                      }}
                      className="block py-3 px-4 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </div>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onApplyClick();
                    }}
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
