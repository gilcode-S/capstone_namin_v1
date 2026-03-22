import { Link } from '@inertiajs/react';


export default function Error403() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div
                
                className="max-w-md w-full text-center"
            >
                {/* Branding (School / App Name) */}
                <p className="text-sm text-gray-400 mb-6 tracking-wide">
                   AISAT COLLEGE DASMA
                </p>

                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-50">
                        <svg
                            className="w-8 h-8 text-indigo-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m0-8v2m9 1a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-semibold text-gray-900">
                    Access restricted
                </h1>

                {/* Message */}
                <p className="mt-4 text-gray-600 leading-relaxed">
                    You do not currently have permission to access this page.
                    <br />
                    This area may be limited to specific roles such as teachers or administrators.
                </p>

                {/* Actions */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto px-5 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
                    >
                        Return to dashboard
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                    >
                        Go back
                    </button>
                </div>

                {/* Footer */}
                <p className="mt-10 text-xs text-gray-400">
                    Error 403 · Permission required
                </p>
            </div>
        </div>
    );
}