import { Navbar } from "@/components/layout/Navbar";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Footer } from "@/components/layout/Footer";
import { StickyCTACard } from "@/components/layout/StickyCTACard";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
