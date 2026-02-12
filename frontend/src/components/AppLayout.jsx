import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";


const AppLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <Navbar />
      <div className="flex-grow min-h-[90vh] bg-gray-50 dark:bg-input/110">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
