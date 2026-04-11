import { Clock, BarChart3, Moon, Palette, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", icon: Clock, label: "Clock" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/sleep", icon: Moon, label: "Sleep" },
  { to: "/personalization", icon: Palette, label: "Style" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[448px] -translate-x-1/2 border-t border-border/50 bg-background">
      <div className="flex items-center justify-around py-2.5 pb-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-[0.65rem] font-body transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground/70 hover:text-foreground"
              }`
            }
          >
            <Icon className="h-[22px] w-[22px] stroke-[1.5]" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
