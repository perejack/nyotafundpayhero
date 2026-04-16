import { motion } from "framer-motion";
import { Shield, Clock, Wallet, HeartHandshake, GraduationCap, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Government Backed",
    description: "Supported by the Kenyan Government and World Bank for your security",
  },
  {
    icon: Clock,
    title: "Quick Processing",
    description: "Get your loan application reviewed within 24 hours",
  },
  {
    icon: Wallet,
    title: "Low Interest Rates",
    description: "Competitive rates designed to help youth thrive",
  },
  {
    icon: HeartHandshake,
    title: "Mentorship Support",
    description: "Access to business training and mentorship programs",
  },
  {
    icon: GraduationCap,
    title: "Skills Training",
    description: "Free skills development and certification programs",
  },
  {
    icon: Smartphone,
    title: "M-Pesa Integration",
    description: "Receive funds directly to your M-Pesa wallet",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 md:py-20 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            Why Choose Us
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Built for <span className="text-gradient-primary">Kenyan Youth</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
            We understand your needs and have designed our services to help you succeed
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="feature" className="h-full">
                <CardContent className="p-4 md:p-6">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-hero flex items-center justify-center mb-3 md:mb-4 shadow-glow">
                    <feature.icon className="w-5 h-5 md:w-7 md:h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-sm md:text-lg font-bold text-foreground mb-1 md:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
