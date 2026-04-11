/**
 * MathChallenge — Generates math problems by difficulty tier.
 */

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChallengeDifficulty } from "@/types/alarm";

interface MathChallengeProps {
  difficulty: ChallengeDifficulty;
  onSolved: (solveTimeSec: number) => void;
}

function generateProblem(difficulty: ChallengeDifficulty): {
  question: string;
  answer: number;
} {
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  switch (difficulty) {
    case ChallengeDifficulty.Easy: {
      const a = rand(1, 9);
      const b = rand(1, 9);
      return { question: `${a} + ${b}`, answer: a + b };
    }
    case ChallengeDifficulty.Medium: {
      const a = rand(2, 15);
      const b = rand(2, 12);
      return { question: `${a} × ${b}`, answer: a * b };
    }
    case ChallengeDifficulty.Hard: {
      const a = rand(5, 25);
      const b = rand(3, 15);
      const c = rand(10, 50);
      return { question: `${a} × ${b} + ${c}`, answer: a * b + c };
    }
  }
}

const MathChallenge = ({ difficulty, onSolved }: MathChallengeProps) => {
  const [problem] = useState(() => generateProblem(difficulty));
  const [startTime] = useState(Date.now());
  const [userAnswer, setUserAnswer] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = useCallback(() => {
    const parsed = parseInt(userAnswer, 10);
    if (parsed === problem.answer) {
      const elapsed = (Date.now() - startTime) / 1000;
      onSolved(elapsed);
    } else {
      setIsWrong(true);
      setUserAnswer("");
      setTimeout(() => setIsWrong(false), 600);
    }
  }, [userAnswer, problem.answer, startTime, onSolved]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-body text-muted-foreground uppercase tracking-wider">
        {t("overlay.solveToDissmiss")}
      </p>
      <p className="text-4xl font-heading font-bold text-foreground">
        {problem.question} = ?
      </p>
      <div className="flex w-48 gap-2">
        <Input
          type="number"
          inputMode="numeric"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Answer"
          className={`text-center text-xl font-heading ${
            isWrong ? "animate-shake border-destructive" : ""
          }`}
          autoFocus
        />
      </div>
      <Button onClick={handleSubmit} size="lg" className="w-48">
        {t("overlay.submit")}
      </Button>
      {isWrong && (
        <p className="text-sm text-destructive font-body">{t("overlay.tryAgain")}</p>
      )}
    </div>
  );
};

export default MathChallenge;
