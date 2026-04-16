import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Zap, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface MpesaproofUser {
  id: number;
  name: string;
  location: string;
  amount: number;
  timeAgo: string;
  avatar: string;
  initials: string;
}

const mpesaUsers: MpesaproofUser[] = [
  { id: 1, name: "James Mwangi", location: "Nairobi", amount: 5000, timeAgo: "2 min ago", avatar: "", initials: "JM" },
  { id: 2, name: "Sarah Ochieng", location: "Kisumu", amount: 15000, timeAgo: "5 min ago", avatar: "", initials: "SO" },
  { id: 3, name: "Peter Kamau", location: "Nakuru", amount: 3000, timeAgo: "8 min ago", avatar: "", initials: "PK" },
  { id: 4, name: "Grace Wanjiru", location: "Mombasa", amount: 8000, timeAgo: "12 min ago", avatar: "", initials: "GW" },
  { id: 5, name: "David Otieno", location: "Eldoret", amount: 12000, timeAgo: "15 min ago", avatar: "", initials: "DO" },
  { id: 6, name: "Mary Njeri", location: "Thika", amount: 2500, timeAgo: "18 min ago", avatar: "", initials: "MN" },
  { id: 7, name: "John Kipchoge", location: "Uasin Gishu", amount: 20000, timeAgo: "21 min ago", avatar: "", initials: "JK" },
  { id: 8, name: "Faith Mutua", location: "Machakos", amount: 4500, timeAgo: "25 min ago", avatar: "", initials: "FM" },
  { id: 9, name: "Michael Njoroge", location: "Kiambu", amount: 10000, timeAgo: "28 min ago", avatar: "", initials: "MN" },
  { id: 10, name: "Esther Akinyi", location: "Nairobi", amount: 3500, timeAgo: "32 min ago", avatar: "", initials: "EA" },
  { id: 11, name: "Daniel Koech", location: "Kericho", amount: 6000, timeAgo: "35 min ago", avatar: "", initials: "DK" },
  { id: 12, name: "Linda Wairimu", location: "Meru", amount: 9000, timeAgo: "40 min ago", avatar: "", initials: "LW" },
  { id: 13, name: "Paul Mbugua", location: "Nyeri", amount: 18000, timeAgo: "42 min ago", avatar: "", initials: "PM" },
  { id: 14, name: "Joyce Wambui", location: "Nakuru", amount: 4200, timeAgo: "45 min ago", avatar: "", initials: "JW" },
  { id: 15, name: "Kevin Omondi", location: "Kisii", amount: 7500, timeAgo: "48 min ago", avatar: "", initials: "KO" },
];

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function MpesaproofPopup() {
  const navigate = useNavigate();
  const location = useLocation();
  const isApplyPage = location.pathname === "/apply";
  const [isVisible, setIsVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<MpesaproofUser | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const showRandomNotification = useCallback(() => {
    if (isDismissed) return;
    
    const randomUser = mpesaUsers[Math.floor(Math.random() * mpesaUsers.length)];
    setCurrentUser(randomUser);
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, [isDismissed]);

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      showRandomNotification();
    }, 3000);

    const interval = setInterval(() => {
      const randomDelay = Math.random() * 4000 + 8000;
      setTimeout(() => {
        showRandomNotification();
      }, randomDelay);
    }, 12000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [showRandomNotification]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleCloseForever = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleApply = () => {
    navigate("/apply");
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && currentUser && (
        <motion.div
          initial={{ opacity: 0, x: isApplyPage ? -100 : 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: isApplyPage ? -100 : 100, scale: 0.8 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.5 
          }}
          className={`fixed bottom-4 z-50 max-w-sm ${isApplyPage ? 'left-4' : 'right-4'}`}
        >
          <div className="relative">
            {/* Animated glow background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-nyota-green via-nyota-gold to-nyota-orange rounded-2xl blur-md opacity-75 animate-pulse" />
            
            {/* Main card */}
            <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
              {/* M-Pesa Header Strip */}
              <div className="bg-gradient-to-r from-nyota-green to-nyota-green-dark px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm">M-PESA CONFIRMED</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-nyota-gold animate-pulse" />
                  <span className="text-nyota-gold text-xs font-medium">LIVE</span>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-10 right-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                    className="relative"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-nyota-green-light to-nyota-green flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {currentUser.initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-nyota-green rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-display font-semibold text-nyota-charcoal text-sm truncate">
                        {currentUser.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">{currentUser.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{currentUser.timeAgo}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Amount Display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="mt-4 bg-gradient-to-r from-nyota-cream to-white rounded-lg p-3 border border-nyota-green/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Received via M-Pesa</p>
                      <p className="font-display font-bold text-xl text-nyota-green">
                        {formatAmount(currentUser.amount)}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 rounded-full bg-nyota-green/10 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 text-nyota-green" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3"
                >
                  <Button
                    onClick={handleApply}
                    size={isApplyPage ? "sm" : "default"}
                    className="w-full bg-gradient-to-r from-nyota-orange to-nyota-gold hover:from-nyota-orange hover:to-nyota-orange-light text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                  >
                    <span className={isApplyPage ? "text-sm" : ""}>Apply Now & Get Funded</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-2"
                    >
                      →
                    </motion.span>
                  </Button>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400"
                >
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-nyota-green rounded-full animate-pulse" />
                    50+ funded today
                  </span>
                  <span>|</span>
                  <span>Secure & Fast</span>
                </motion.div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-gray-100">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-nyota-green to-nyota-gold"
                />
              </div>
            </div>

            {/* Dismiss forever button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleCloseForever}
              className="absolute -bottom-8 right-0 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Don't show again
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MpesaproofPopup;
