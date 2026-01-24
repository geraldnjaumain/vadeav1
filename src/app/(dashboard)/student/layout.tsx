import { requireRole } from "@/lib/auth-rsc";

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireRole("student");
    return <>{children}</>;
}
