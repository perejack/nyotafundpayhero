import { motion } from "framer-motion";
import { FileText, CheckCircle, CreditCard, ArrowRight, ArrowDown } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Fill Application",
    description: "Complete our simple online form with your personal and financial details",
    step: "01",
  },
  {
    icon: CheckCircle,
    title: "Quick Review",
    description: "Our team reviews your application within 24 hours",
    step: "02",
  },
  {
    icon: CreditCard,
    title: "Get Funded",
    description: "Once approved, receive funds directly to your M-Pesa",
    step: "03",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-12 md:py-20 lg:py-32 bg-background">
      <div className="container px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-secondary/20 text-secondary rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            How It <span className="text-nyota-orange">Works</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
            Get the funding you need in three simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="bg-card rounded-2xl p-5 md:p-6 border border-border shadow-md hover:shadow-lg transition-shadow relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm md:text-base shadow-glow">
                    {step.step}
                  </div>

                  <div className="text-center pt-3 md:pt-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <step.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-xs md:text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Arrow - Desktop (horizontal) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-20">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                )}

                {/* Arrow - Mobile (vertical) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-2">
                    <ArrowDown className="w-5 h-5 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
