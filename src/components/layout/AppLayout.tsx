import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[448px] bg-background">
      <Header />
      <main id="main-content" className="px-6 pb-24 pt-6" role="main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
