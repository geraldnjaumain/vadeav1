import { requireRole } from "@/lib/auth-rsc";

export default async function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireRole("teacher");
    return <>{children}</>;
}
