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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-body transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
