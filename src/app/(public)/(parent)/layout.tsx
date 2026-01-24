import { PublicNavbar } from "@/components/layout/PublicNavbar";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <PublicNavbar />
            {children}
        </>
    );
}
