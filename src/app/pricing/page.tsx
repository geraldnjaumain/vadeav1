import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-4xl font-bold text-zinc-900 mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-zinc-600 mb-12 max-w-2xl mx-auto">
                    Start for free and upgrade as you grow. Choose the best plan for your child's education.
                </p>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="border border-zinc-200 rounded-xl p-8 hover:shadow-lg transition-all">
                        <h3 className="text-xl font-bold mb-2">Free</h3>
                        <div className="text-3xl font-bold mb-6">$0<span className="text-base font-normal text-zinc-500">/mo</span></div>
                        <ul className="text-left space-y-3 mb-8 text-zinc-600">
                            <li>✓ Access to limited lessons</li>
                            <li>✓ Basic progress tracking</li>
                            <li>✓ Community support</li>
                        </ul>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/auth?mode=register">Get Started</Link>
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="border-2 border-blue-600 rounded-xl p-8 shadow-xl relative transform scale-105">
                        <div className="absolute top-0 right-0 left-0 bg-blue-600 text-white text-sm font-bold py-1 rounded-t-lg">MOST POPULAR</div>
                        <h3 className="text-xl font-bold mb-2 mt-4">Pro</h3>
                        <div className="text-3xl font-bold mb-6">$9<span className="text-base font-normal text-zinc-500">/mo</span></div>
                        <ul className="text-left space-y-3 mb-8 text-zinc-600">
                            <li>✓ Unlimited lessons</li>
                            <li>✓ Full offline access</li>
                            <li>✓ Advanced analytics</li>
                            <li>✓ Priority support</li>
                        </ul>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                            <Link href="/auth?mode=register">Start Free Trial</Link>
                        </Button>
                    </div>

                    {/* School Plan */}
                    <div className="border border-zinc-200 rounded-xl p-8 hover:shadow-lg transition-all">
                        <h3 className="text-xl font-bold mb-2">Schools</h3>
                        <div className="text-3xl font-bold mb-6">Custom</div>
                        <ul className="text-left space-y-3 mb-8 text-zinc-600">
                            <li>✓ Bulk student management</li>
                            <li>✓ Teacher dashboard</li>
                            <li>✓ Usage reports</li>
                            <li>✓ Dedicated account manager</li>
                        </ul>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/contact">Contact Sales</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
