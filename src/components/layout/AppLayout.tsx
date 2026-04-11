import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-background">
      <Header />
      <main className="px-4 pb-20 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
