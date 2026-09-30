import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/common/Button";
import { WaveBackground } from "@/components/common/WaveBackground";
import { useAuthStore } from "@/store/authStore";
import { Check, ArrowRight } from "lucide-react";

export const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { introSeen, setIntroSeen } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  // If intro has been seen previously in this session or reduced motion is preferred, jump to ready
  const [step, setStep] = useState<number>(introSeen || shouldReduceMotion ? 5 : 0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    introSeen || shouldReduceMotion ? [0, 1, 2, 3] : []
  );

  const statusItems = [
    "Loading rainfall and river data",
    "Preparing terrain layers",
    "Building road risk map",
    "Workspace ready",
  ];

  useEffect(() => {
    if (introSeen || shouldReduceMotion) {
      setStep(5);
      setCompletedSteps([0, 1, 2, 3]);
      return;
    }

    // Sequenced step transitions (total ~4.5s)
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    // Step 1: Wordmark & Tagline fade in
    timers.push(setTimeout(() => setStep(1), 1200));

    // Steps 2-4: Status items sequential build
    timers.push(
      setTimeout(() => {
        setStep(2);
        setCompletedSteps([0]);
      }, 2000)
    );

    timers.push(
      setTimeout(() => {
        setStep(3);
        setCompletedSteps([0, 1]);
      }, 2800)
    );

    timers.push(
      setTimeout(() => {
        setStep(4);
        setCompletedSteps([0, 1, 2]);
      }, 3600)
    );

    // Final Ready state: Show "Get started" button
    timers.push(
      setTimeout(() => {
        setStep(5);
        setCompletedSteps([0, 1, 2, 3]);
        setIntroSeen(true);
      }, 4400)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [introSeen, shouldReduceMotion, setIntroSeen]);

  const handleSkip = () => {
    setStep(5);
    setCompletedSteps([0, 1, 2, 3]);
    setIntroSeen(true);
  };

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="relative min-h-[calc(100vh-6px)] flex flex-col justify-between items-center bg-cream-bg text-ink-primary overflow-hidden px-6 py-8 select-none">
      <WaveBackground opacity={0.035} />

      {/* Top Bar with Skip Button */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
          Platform Initialization
        </span>

        {step < 5 && (
          <button
            onClick={handleSkip}
            className="text-xs font-mono text-ink-muted hover:text-ink-primary transition-colors cursor-pointer px-2 py-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
          >
            Skip intro &rarr;
          </button>
        )}
      </div>

      {/* Main Center Stage */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg w-full text-center z-10 my-8">
        {/* Animated Logo Mark */}
        <div className="mb-6">
          <Logo size="xl" animated={!introSeen && !shouldReduceMotion} />
        </div>

        {/* Wordmark Title */}
        <motion.div
          initial={introSeen || shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-4xl sm:text-5xl font-serif font-medium text-ink-primary tracking-tight">
            Flood<span className="text-terracotta">Pulse</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={introSeen || shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 8 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mt-3"
        >
          <p className="text-base sm:text-lg text-ink-secondary font-serif italic">
            Flood forecasts that reach the street.
          </p>
        </motion.div>

        {/* Slim Progress Line & Sequenced Status Steps */}
        <div className="w-full mt-10 max-w-sm space-y-4">
          {/* Progress Bar Line */}
          <div className="h-0.5 w-full bg-hairline rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-terracotta"
              initial={{ width: "0%" }}
              animate={{
                width:
                  step === 0
                    ? "10%"
                    : step === 1
                    ? "25%"
                    : step === 2
                    ? "50%"
                    : step === 3
                    ? "75%"
                    : "100%",
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Status Lines List */}
          <div className="space-y-2 text-left pt-2">
            {statusItems.map((text, idx) => {
              const isVisible = step >= idx + 1 || step === 5;
              const isDone = completedSteps.includes(idx) || step === 5;

              return (
                <motion.div
                  key={idx}
                  initial={introSeen || shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
                  animate={{
                    opacity: isVisible ? 1 : 0.2,
                    x: isVisible ? 0 : -6,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2.5 text-xs"
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isDone
                        ? "bg-terracotta text-white"
                        : "border border-hairline text-transparent"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span
                    className={`font-mono transition-colors duration-200 ${
                      isDone ? "text-ink-primary font-medium" : "text-ink-muted"
                    }`}
                  >
                    {text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* "Get started" Button (Fades & Slides in when ready) */}
        <AnimatePresence>
          {step >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <Button
                size="lg"
                variant="primary"
                onClick={handleGetStarted}
                className="group px-7 py-3 rounded-full text-sm font-medium shadow-card"
                rightIcon={
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                }
              >
                Get started
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Footer Attribution */}
      <div className="z-10 text-center">
        <p className="text-xs text-ink-muted font-mono">
          Research-Grade Probabilistic Hydrology &middot; Peninsular Indian Basins
        </p>
      </div>
    </div>
  );
};
