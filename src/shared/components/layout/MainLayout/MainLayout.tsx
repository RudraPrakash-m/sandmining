import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Breadcrumb from "../Breadcrumb";
import { LayoutProvider } from "../LayoutContext";
// import DemoScenarioBanner from "@/features/shared-simulation/components/DemoScenarioBanner";

const MainLayoutContent = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Sidebar (Full Height Left Column) */}
            <Sidebar />

            {/* Right Column: Header + Page Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header (Full Width of Screen - Sidebar Width) */}
                <Header />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-transparent p-3 md:p-5 transition-colors duration-200">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <Breadcrumb />
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

const MainLayout = () => {
    return (
        <LayoutProvider>
            <MainLayoutContent />
        </LayoutProvider>
    );
};

export default MainLayout;