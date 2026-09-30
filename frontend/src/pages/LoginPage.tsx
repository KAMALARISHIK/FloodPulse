import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { WaveBackground } from "@/components/common/WaveBackground";
import { DEMO_USERS, DEFAULT_DEMO_USER, DemoUser } from "@/config/demoUsers";
import { useAuthStore } from "@/store/authStore";
import { ShieldCheck, Info, ArrowRight } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, clearError } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [shake, setShake] = useState(false);

  // Form Validation
  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email format.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) {
      triggerShake();
      return;
    }

    try {
      await login(email, password);
      navigate("/app");
    } catch {
      triggerShake();
    }
  };

  const triggerShake = () => {
    if (!shouldReduceMotion) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleFillDemo = (user: DemoUser = DEFAULT_DEMO_USER) => {
    setEmail(user.email);
    setPassword(user.password);
    setErrors({});
    clearError();
  };

  return (
    <div className="relative min-h-[calc(100vh-6px)] bg-cream-bg text-ink-primary flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-8 select-none">
      <WaveBackground opacity={0.03} />

      {/* Top Navbar Header */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <Link to="/" className="inline-block focus:outline-none">
          <Logo size="md" showText />
        </Link>
        <span className="text-xs font-mono text-ink-muted">
          Auth Service &middot; v0.1.0 Preview
        </span>
      </div>

      {/* Main Split Layout */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center my-auto py-8 z-10">
        {/* Left Column: Headline & Platform Summary */}
        <div className="lg:col-span-6 space-y-5 text-left">
          <Badge variant="terracotta" size="md">
            Emergency Response & Hydrology
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-ink-primary tracking-tight leading-[1.15]">
            Welcome back to the flood intelligence portal.
          </h2>

          <p className="text-base text-ink-secondary leading-relaxed font-sans max-w-lg">
            Access probabilistic river hydrographs, live inundation hazard mapping, and
            risk-penalized emergency vehicle routing across Peninsular Indian river basins.
          </p>

          <div className="pt-4 border-t border-hairline flex items-center gap-4 text-xs font-mono text-ink-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-success" />
              <span>CAMELS-IND Streamflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-water" />
              <span>OSM Highway Network</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto lg:mr-0">
          <motion.div
            animate={
              shake
                ? {
                    x: [0, -8, 8, -6, 6, -3, 3, 0],
                  }
                : { x: 0 }
            }
            transition={{ duration: 0.45 }}
          >
            <Card variant="surface" padding="lg" className="space-y-5 shadow-card">
              <div className="border-b border-hairline pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-medium text-ink-primary">Sign in</h3>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Enter your authorized organization credentials
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillDemo(DEFAULT_DEMO_USER)}
                  className="text-xs text-terracotta hover:text-terracotta-hover font-medium underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Fill demo login
                </button>
              </div>

              {/* Global Error Banner */}
              {authError && (
                <div
                  className="p-3 rounded-control bg-red-50 border border-red-200 text-xs text-status-danger font-medium flex items-start gap-2"
                  role="alert"
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Email address"
                  id="email"
                  type="email"
                  placeholder="operator@floodpulse.demo"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    clearError();
                  }}
                  error={errors.email}
                  autoComplete="email"
                  required
                />

                <Input
                  label="Password"
                  id="password"
                  isPassword
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    clearError();
                  }}
                  error={errors.password}
                  autoComplete="current-password"
                  required
                />

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  isLoading={isLoading}
                  className="w-full mt-2 font-medium"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign in to workspace
                </Button>
              </form>

              {/* Demo Credentials Box */}
              <div className="pt-4 border-t border-hairline bg-cream-subtle -mx-7 -mb-7 p-5 rounded-b-card space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-ink-primary font-semibold">
                      Demo access (frontend preview)
                    </span>
                  </div>
                  <Badge variant="sample" size="sm">
                    Mock Auth
                  </Badge>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-ink-secondary">
                  {DEMO_USERS.map((demo) => (
                    <div
                      key={demo.role}
                      onClick={() => handleFillDemo(demo)}
                      className="flex items-center justify-between p-1.5 rounded hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-hairline"
                      title={`Click to fill ${demo.role} account`}
                    >
                      <span className="truncate">
                        <strong className="text-ink-primary">{demo.email}</strong> / {demo.password}
                      </span>
                      <span className="text-[10px] text-terracotta font-medium uppercase shrink-0 ml-2">
                        [{demo.role}]
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-ink-muted leading-relaxed italic border-t border-hairline pt-2">
                  * Note: Real JWT/OIDC authentication will replace this client mock when FastAPI is connected.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full max-w-6xl mx-auto text-center z-10">
        <p className="text-xs text-ink-muted">
          FloodPulse &middot; MIT License &middot; Multi-Basin Hydrological & Transit Network Platform
        </p>
      </div>
    </div>
  );
};
