import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onApplyClick: () => void;
}

const CTASection = ({ onApplyClick }: CTASectionProps) => {
  return (
    <section className="py-12 md:py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-48 md:w-96 h-48 md:h-96 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-nyota-orange rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 md:mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-sm md:text-lg lg:text-xl text-primary-foreground/80 mb-6 md:mb-10 max-w-2xl mx-auto px-4">
            Join thousands of Kenyan youth who have already taken the first step towards 
            financial independence. Apply today and unlock your potential.
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <Button variant="hero" size="lg" className="w-full sm:w-auto" onClick={onApplyClick}>
              Start Your Application
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 mt-10 md:mt-16 pt-8 md:pt-10 border-t border-primary-foreground/20">
            {[
              { value: "Ksh 2B+", label: "Loans Disbursed" },
              { value: "50,000+", label: "Youth Empowered" },
              { value: "98%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/70 text-[10px] sm:text-xs md:text-sm mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
