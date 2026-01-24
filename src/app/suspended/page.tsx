export default function SuspendedPage() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 max-w-md w-full">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Account Suspended</h1>
                <p className="text-zinc-500 mb-6">
                    Your account has been temporarily suspended by the administration. This may be due to overdue fees or policy violations.
                </p>
                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 text-sm text-zinc-600 mb-6">
                    Please contact the school administration to resolve this issue.
                    <br />
                    <span className="font-semibold select-all">admin@vadea.app</span>
                </div>
                <a href="/?auth=login" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Back to Login
                </a>
            </div>
        </div>
    );
}
