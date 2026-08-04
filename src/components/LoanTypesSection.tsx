import { motion } from "framer-motion";
import { ArrowRight, Briefcase, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import businessLoanImg from "@/assets/business-loan.jpg";
import personalLoanImg from "@/assets/personal-loan.jpg";
import emergencyLoanImg from "@/assets/emergency-loan.jpg";

interface LoanTypesSectionProps {
  onApplyClick: () => void;
}

const loanTypes = [
  {
    title: "Business Loan",
    description: "Start or grow your business with capital up to Ksh 200,000",
    maxAmount: "Ksh 200,000",
    icon: Briefcase,
    image: businessLoanImg,
    features: ["Startup capital", "Inventory purchase", "Equipment financing", "Business expansion"],
    color: "from-nyota-green to-nyota-green-dark",
  },
  {
    title: "Personal Loan",
    description: "Cover personal expenses and achieve your goals with up to Ksh 50,000",
    maxAmount: "Ksh 50,000",
    icon: User,
    image: personalLoanImg,
    features: ["Education fees", "Home improvement", "Personal development", "Life events"],
    color: "from-nyota-orange to-nyota-gold",
  },
  {
    title: "Emergency Loan",
    description: "Quick financial support during emergencies up to Ksh 20,000",
    maxAmount: "Ksh 20,000",
    icon: AlertCircle,
    image: emergencyLoanImg,
    features: ["Medical emergencies", "Urgent repairs", "Family support", "Quick disbursement"],
    color: "from-accent to-nyota-green-light",
  },
];

const LoanTypesSection = ({ onApplyClick }: LoanTypesSectionProps) => {
  return (
    <section id="loan-types" className="py-12 md:py-20 lg:py-32 bg-muted/30">
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
            Loan Options
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Choose Your Path to{" "}
            <span className="text-gradient-primary">Success</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
            We offer flexible loan products tailored to meet the diverse needs of Kenyan youth.
          </p>
        </motion.div>

        {/* Loan Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {loanTypes.map((loan, index) => (
            <motion.div
              key={loan.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card variant="loan" className="h-full flex flex-col">
                {/* Image Section */}
                <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                  <img
                    src={loan.image}
                    alt={loan.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${loan.color} opacity-60`} />
                  <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
                    <div className="flex items-center gap-2 text-primary-foreground">
                      <loan.icon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="font-semibold text-sm md:text-base">Up to {loan.maxAmount}</span>
                    </div>
                  </div>
                </div>

                <CardHeader className="p-4 md:p-6 pb-2 md:pb-3">
                  <CardTitle className="text-lg md:text-xl">{loan.title}</CardTitle>
                  <CardDescription className="text-sm md:text-base">{loan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6 flex-1">
                    {loan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full group text-sm md:text-base"
                    onClick={onApplyClick}
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoanTypesSection;
