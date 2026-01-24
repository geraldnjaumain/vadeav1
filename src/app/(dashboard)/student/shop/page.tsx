"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { CoursePurchaseCard } from "@/components/payment/CoursePurchaseCard";
import { ShoppingBag } from "lucide-react";
import { ShopSkeleton } from "@/components/ui/skeleton";

export default function StudentShopPage() {
    const courses = useQuery(api.courses.list);
    const myEnrollments = useQuery(api.payments.getMyTransactions); // Using transaction history as a proxy for enrollment check for now

    if (courses === undefined) {
        return <ShopSkeleton />;
    }

    // Helper to check enrollment Status
    const isEnrolled = (courseId: string) => {
        // In a real app we'd query `api.enrollments.myEnrollments`
        // For now we check if any successful transaction exists for this course
        return myEnrollments?.some(tx => tx.courseId === courseId && tx.status === "success");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                    <ShoppingBag className="h-8 w-8" />
                    Course Shop
                </h1>
                <p className="text-zinc-500">Discover and enroll in premium live courses.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {courses.map((course) => (
                    <CoursePurchaseCard
                        key={course._id}
                        courseId={course._id}
                        title={course.title}
                        description={course.description}
                        price={course.price}
                        imageUrl={course.imageUrl}
                        isEnrolled={isEnrolled(course._id)}
                    />
                ))}
                {courses.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500">
                        <p>No courses available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
