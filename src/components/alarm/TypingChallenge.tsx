/**
 * TypingChallenge — User must type a displayed sentence exactly to dismiss.
 */

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Keyboard } from "lucide-react";

const SENTENCES = [
  "I am awake and ready to start my day",
  "Rise and shine it is a brand new morning",
  "Good morning the early bird catches the worm",
  "Today is going to be a great day",
  "Wake up and make your dreams happen",
  "The sun is up and so am I",
  "Every morning brings new possibilities",
  "I choose to be productive today",
];

interface TypingChallengeProps {
  onSolved: (solveTimeSec: number) => void;
}

const TypingChallenge = ({ onSolved }: TypingChallengeProps) => {
  const { t } = useTranslation();
  const [sentence] = useState(() => SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
  const [input, setInput] = useState("");
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isCorrect = input.trim().toLowerCase() === sentence.toLowerCase();

  const handleChange = (value: string) => {
    setInput(value);
    if (value.trim().toLowerCase() === sentence.toLowerCase()) {
      const elapsed = (Date.now() - startTime) / 1000;
      onSolved(Math.round(elapsed * 10) / 10);
    }
  };

  const progress = (() => {
    const target = sentence.toLowerCase();
    const typed = input.trim().toLowerCase();
    let correct = 0;
    for (let i = 0; i < typed.length && i < target.length; i++) {
      if (typed[i] === target[i]) correct++;
      else break;
    }
    return Math.round((correct / target.length) * 100);
  })();

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
      <div className="flex items-center gap-2 text-primary">
        <Keyboard className="h-5 w-5" />
        <span className="text-sm font-heading font-semibold">
          {t("challenge.typingTitle")}
        </span>
      </div>

      <p className="text-center text-base font-body leading-relaxed tracking-wide bg-secondary/50 rounded-lg p-3 select-none">
        {sentence}
      </p>

      <div className="w-full h-1.5 rounded-full bg-muted-foreground/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t("challenge.typingPlaceholder")}
        className={`text-center font-body ${
          input.length > 0 && !isCorrect && progress < 5
            ? "border-destructive"
            : ""
        }`}
        autoComplete="off"
        spellCheck={false}
      />

      <p className="text-xs text-muted-foreground font-body">
        {progress}% {t("challenge.complete")}
      </p>
    </div>
  );
};

export default TypingChallenge;
