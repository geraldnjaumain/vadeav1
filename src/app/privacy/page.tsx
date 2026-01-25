import { Navbar } from "@/components/layout/Navbar";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar />
            <div className="container mx-auto px-4 py-24 max-w-3xl">
                <h1 className="text-3xl font-bold text-zinc-900 mb-6">Privacy Policy</h1>
                <div className="prose prose-blue max-w-none text-zinc-600">
                    <p>Last updated: January 2026</p>
                    <p>Your privacy is important to us. This policy explains how Vadea collects, uses, and protects your information.</p>

                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly, such as your name, email address, and educational preferences when you register.</p>

                    <h3>2. How We Use Your Data</h3>
                    <p>We use your data to:</p>
                    <ul>
                        <li>Provide and improve our educational services</li>
                        <li>Personalize your learning experience</li>
                        <li>Communicate with you about updates and support</li>
                    </ul>

                    <h3>3. Data Protection</h3>
                    <p>We implement security measures to protect your personal information. We do not sell your data to third parties.</p>

                    <h3>4. Children's Privacy</h3>
                    <p>Vadea is designed for education. We comply with applicable laws regarding the collection of data from children under 13.</p>

                    <h3>5. Contact Us</h3>
                    <p>If you have questions about this policy, please contact us at support@vadea.app.</p>
                </div>
            </div>
        </div>
    );
}
