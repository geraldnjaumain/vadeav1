import { Navbar } from "@/components/layout/Navbar";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar />
            <div className="container mx-auto px-4 py-24 max-w-3xl">
                <h1 className="text-3xl font-bold text-zinc-900 mb-6">Terms of Service</h1>
                <div className="prose prose-blue max-w-none text-zinc-600">
                    <p>Last updated: January 2026</p>
                    <p>Welcome to Vadea. By accessing or using our website and services, you agree to be bound by these Terms of Service.</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing Vadea, you agree to comply with these terms. If you do not agree, please do not use our services.</p>

                    <h3>2. Use of Service</h3>
                    <p>You agree to use Vadea for lawful educational purposes only. You are responsible for all activity associated with your account.</p>

                    <h3>3. User Accounts</h3>
                    <p>To access certain features, you must create an account. You agree to provide accurate information and keep your password secure.</p>

                    <h3>4. Content</h3>
                    <p>All educational content on Vadea is protected by copyright. You may not copy, distribute, or resell our materials without permission.</p>

                    <h3>5. Termination</h3>
                    <p>We reserve the right to suspend or terminate your account if you violate these terms.</p>
                </div>
            </div>
        </div>
    );
}
