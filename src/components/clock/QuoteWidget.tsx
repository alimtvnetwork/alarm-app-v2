/**
 * QuoteWidget — Displays a daily motivational quote, rotated by date.
 */

import { useMemo } from "react";
import { Quote } from "lucide-react";

const QUOTES = [
  { text: "The early morning has gold in its mouth.", author: "Benjamin Franklin" },
  { text: "Every morning brings new potential, but if you dwell on the misfortunes of the day before, you tend to overlook tremendous opportunities.", author: "Harvey Mackay" },
  { text: "An early-morning walk is a blessing for the whole day.", author: "Henry David Thoreau" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "It is well to be up before daybreak, for such habits contribute to health, wealth, and wisdom.", author: "Aristotle" },
  { text: "Lose an hour in the morning, and you will be all day hunting for it.", author: "Richard Whately" },
  { text: "Morning is an important time of day, because how you spend your morning often tells you what kind of day you are going to have.", author: "Lemony Snicket" },
  { text: "The breeze at dawn has secrets to tell you. Don't go back to sleep.", author: "Rumi" },
  { text: "With the new day comes new strength and new thoughts.", author: "Eleanor Roosevelt" },
  { text: "Each morning we are born again. What we do today is what matters most.", author: "Buddha" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Every day is a new beginning. Take a deep breath, smile, and start again.", author: "Unknown" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Today is a good day to have a good day.", author: "Unknown" },
  { text: "Rise up, start fresh, see the bright opportunity in each new day.", author: "Unknown" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The sun himself is weak when he first rises, and gathers strength and courage as the day gets on.", author: "Charles Dickens" },
  { text: "Set a goal that makes you want to jump out of bed in the morning.", author: "Unknown" },
  { text: "Some people dream of success, while other people get up every morning and make it happen.", author: "Wayne Huizenga" },
  { text: "First thing every morning before you arise, say out loud: I believe.", author: "Ovid" },
  { text: "When you arise in the morning, think of what a precious privilege it is to be alive.", author: "Marcus Aurelius" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Be willing to be a beginner every single morning.", author: "Meister Eckhart" },
  { text: "Nothing is impossible. The word itself says I'm possible.", author: "Audrey Hepburn" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "I wake up every morning and think to myself, how far can I push this company in the next 24 hours.", author: "Leah Busque" },
  { text: "Think in the morning. Act in the noon. Eat in the evening. Sleep in the night.", author: "William Blake" },
];

const QuoteWidget = () => {
  const quote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <div className="w-full flex items-start gap-2.5 px-1">
      <Quote className="h-4 w-4 mt-0.5 text-primary/50 shrink-0 rotate-180" />
      <div className="min-w-0">
        <p className="text-xs font-body text-muted-foreground leading-relaxed italic">
          {quote.text}
        </p>
        <p className="mt-0.5 text-[10px] font-body text-muted-foreground/60">
          — {quote.author}
        </p>
      </div>
    </div>
  );
};

export default QuoteWidget;
