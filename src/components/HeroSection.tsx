import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";
import nyotaLogo from "@/assets/nyota-logo.jpg";

interface HeroSectionProps {
  onApplyClick: () => void;
}

const HeroSection = ({ onApplyClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 md:pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Kenyan youth entrepreneurs"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-nyota-charcoal/95 via-nyota-charcoal/85 to-nyota-charcoal/60 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-nyota-charcoal/60 to-transparent" />
      </div>

      {/* Floating Elements - Hidden on mobile for performance */}
      <motion.div
        className="absolute top-20 right-10 w-20 h-20 bg-nyota-orange/20 rounded-full blur-2xl hidden md:block"
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-32 h-32 bg-nyota-green/20 rounded-full blur-3xl hidden md:block"
        animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      <div className="container relative z-10 px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-3xl">
          {/* Logo Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 md:gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-primary-foreground/20">
              <img src={nyotaLogo} alt="NYOTA Fund" className="h-6 w-auto md:h-8 rounded" />
              <span className="text-primary-foreground/90 text-xs md:text-sm font-medium">
                National Youth Opportunities for Advancement
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight"
          >
            Kuza, Imarisha,{" "}
            <span className="text-nyota-orange">Endeleza</span>{" "}
            Vijana!
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base md:text-lg lg:text-xl text-primary-foreground/80 mb-6 md:mb-8 max-w-2xl leading-relaxed"
          >
            Empowering Kenyan youth aged 18-29 with accessible loans for business growth, 
            personal development, and emergency support. Your future starts here.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-4 md:gap-6 mb-8 md:mb-10"
          >
            {[
              { icon: Users, label: "Youth Served", value: "50,000+" },
              { icon: Clock, label: "Quick Approval", value: "24 Hours" },
              { icon: Shield, label: "Govt. Backed", value: "100%" },
            ].map((stat, index) => (
              <div key={index} className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-nyota-orange" />
                </div>
                <div>
                  <div className="text-primary-foreground font-bold text-sm md:text-base">{stat.value}</div>
                  <div className="text-primary-foreground/60 text-xs md:text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4"
          >
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-base md:text-lg py-3 md:py-4" onClick={onApplyClick}>
              Apply for Loan Now
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button 
              variant="hero-outline" 
              size="lg" 
              className="w-full sm:w-auto text-base md:text-lg py-3 md:py-4"
              onClick={() => document.getElementById('loan-types')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Loan Types
            </Button>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 md:mt-10 flex items-center gap-2 text-primary-foreground/60"
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-nyota-gold text-nyota-gold" />
              ))}
            </div>
            <span className="text-xs md:text-sm">Trusted by 50,000+ Kenyan youth</span>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
