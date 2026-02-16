import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="AISAT Scheduling System" />

            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-600 text-white">

                {/* Navbar */}
                <nav className="flex justify-between items-center px-8 py-6">
                    <h1 className="text-xl font-bold tracking-wide">
                        AISAT Scheduling System
                    </h1>

                    <div className="space-x-4">
                        <Link
                            href="/login"
                            className="px-4 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                        >
                            Login
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center text-center px-6 py-20">
                    <h2 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl">
                        Expertise-Aware Class Scheduling System
                    </h2>

                    <p className="mt-6 text-lg md:text-xl max-w-2xl text-gray-200">
                        An intelligent scheduling solution with automatic conflict
                        detection designed for AISAT College Dasmariñas.
                    </p>

                    <div className="mt-8 flex gap-4">
                        <Link
                            href="/login"
                            className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-lg hover:scale-105 transition transform"
                        >
                            Get Started
                        </Link>

                        <a
                            href="#features"
                            className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-blue-700 transition"
                        >
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="bg-white text-gray-800 py-20 px-8">
                    <div className="max-w-6xl mx-auto text-center">
                        <h3 className="text-3xl font-bold mb-12">
                            System Features
                        </h3>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-6 shadow-lg rounded-xl border hover:shadow-xl transition">
                                <h4 className="text-xl font-semibold mb-4">
                                    Expertise Matching
                                </h4>
                                <p className="text-gray-600">
                                    Automatically assigns instructors based on their
                                    field of expertise.
                                </p>
                            </div>

                            <div className="p-6 shadow-lg rounded-xl border hover:shadow-xl transition">
                                <h4 className="text-xl font-semibold mb-4">
                                    Conflict Detection
                                </h4>
                                <p className="text-gray-600">
                                    Detects and prevents schedule overlaps in real-time.
                                </p>
                            </div>

                            <div className="p-6 shadow-lg rounded-xl border hover:shadow-xl transition">
                                <h4 className="text-xl font-semibold mb-4">
                                    Automated Scheduling
                                </h4>
                                <p className="text-gray-600">
                                    Generates optimized schedules efficiently and accurately.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center py-6 text-gray-200 text-sm">
                    © {new Date().getFullYear()} AISAT College Dasmariñas. All rights reserved.
                </footer>
            </div>
        </>
    );
}
