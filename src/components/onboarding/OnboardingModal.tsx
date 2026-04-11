/**
 * OnboardingModal — First-visit welcome flow with feature highlights.
 * Shows once, stores dismissal in localStorage.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, BarChart3, Moon, Palette, Keyboard } from "lucide-react";

const STORAGE_KEY = "alarm_app_onboarded";

interface Step {
  icon: typeof Bell;
  titleKey: string;
  descKey: string;
}

const STEPS: Step[] = [
  { icon: Bell, titleKey: "onboarding.alarms", descKey: "onboarding.alarmsDesc" },
  { icon: Moon, titleKey: "onboarding.sleep", descKey: "onboarding.sleepDesc" },
  { icon: BarChart3, titleKey: "onboarding.analytics", descKey: "onboarding.analyticsDesc" },
  { icon: Palette, titleKey: "onboarding.personalize", descKey: "onboarding.personalizeDesc" },
  { icon: Keyboard, titleKey: "onboarding.shortcuts", descKey: "onboarding.shortcutsDesc" },
];

const OnboardingModal = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-border">
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          {/* Step indicator dots */}
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5">
            <Icon className="h-8 w-8 text-primary" />
          </div>

          {/* Content */}
          <h2 className="text-lg font-heading font-bold mb-2">
            {t(current.titleKey)}
          </h2>
          <p className="text-sm font-body text-muted-foreground leading-relaxed mb-6">
            {t(current.descKey)}
          </p>

          {/* Actions */}
          <div className="flex w-full gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                {t("onboarding.back")}
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {isLast ? t("onboarding.getStarted") : t("onboarding.next")}
            </Button>
          </div>

          {!isLast && (
            <button
              onClick={handleClose}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground font-body transition-colors"
            >
              {t("onboarding.skip")}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
