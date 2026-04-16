import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";
import nyotaLogo from "@/assets/nyota-logo-official.jpg";

const Footer = () => {
  return (
    <footer className="bg-nyota-charcoal text-primary-foreground py-10 md:py-16">
      <div className="container px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-8 md:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={nyotaLogo} alt="NYOTA Fund" className="h-10 w-10 rounded-lg object-cover" />
              <div className="flex items-baseline gap-0.5">
                <span className="font-display text-lg font-black text-nyota-green">NYOTA</span>
                <span className="font-display text-lg font-black text-nyota-red">Fund</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm mb-4">
              National Youth Opportunities Towards Advancement - Empowering Kenyan youth for a brighter future.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-base md:text-lg mb-3 md:mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Loan Types", "How It Works", "About NYOTA", "FAQs"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-xs md:text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Loan Products */}
          <div>
            <h4 className="font-display font-bold text-base md:text-lg mb-3 md:mb-4">Loan Products</h4>
            <ul className="space-y-2">
              {["Business Loan", "Personal Loan", "Emergency Loan", "Eligibility", "Interest Rates"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-xs md:text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-display font-bold text-base md:text-lg mb-3 md:mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-xs md:text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>ELDORET, Uasin Gishu, Postal Code 50200</span>
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>0105575260</span>
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>lonamurunga.dr@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Financial Disclosures */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-primary-foreground/50 text-[10px] md:text-xs leading-relaxed">
          <p className="mb-2">
            <strong>Financial Disclosure:</strong> Loan products are subject to credit approval. Interest rates (APR) range from 8% to 24% per annum depending on the loan product and creditworthiness. 
            Repayment periods range from a minimum of 3 months to a maximum of 36 months.
          </p>
          <p>
            Example: A loan of KES 50,000 borrowed for 12 months at an APR of 12% would have a total repayment amount of KES 56,000, with monthly installments of KES 4,667.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 md:pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-xs md:text-sm text-center md:text-left">
            © 2026 NYOTA Fund. All rights reserved. A Government of Kenya & World Bank Initiative.
          </p>
          <div className="flex gap-4 md:gap-6">
            <a href="/privacy-policy" className="text-primary-foreground/50 hover:text-primary-foreground text-xs md:text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="text-primary-foreground/50 hover:text-primary-foreground text-xs md:text-sm transition-colors">
              Terms of Service
            </a>
            <a href="/refund-policy" className="text-primary-foreground/50 hover:text-primary-foreground text-xs md:text-sm transition-colors">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
