import { TeacherNavbar } from "@/components/layout/TeacherNavbar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <TeacherNavbar />
            {children}
        </>
    );
}
