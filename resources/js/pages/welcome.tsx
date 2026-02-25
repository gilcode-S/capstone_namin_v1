import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="AISAT Scheduling System" />

            <div className="relative min-h-screen text-white ">

                {/* Background Image */}
                {/* <div
                    className="absolute inset-0 bg-center bg-no-repeat bg-cover"
                    style={{
                        backgroundImage: "url('/image/image 2.png')",
                        backgroundSize: "cover",
                        imageRendering: "auto"
                    }}
                ></div> */}

                {/* Gradient + Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-blue-900/80"></div>

                {/* Content */}
                <div className="relative z-10">

                    {/* Navbar */}
                    <nav className="flex justify-between items-center px-10 py-6">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
                            AISAT Scheduling System
                        </h1>

                        <Link
                            href="/login"
                            className="px-6 py-2 bg-white text-blue-800 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition"
                        >
                            Login
                        </Link>
                    </nav>

                    {/* Hero Section */}
                    <div className="flex items-center justify-center px-6 py-24">
                        <div className="max-w-4xl text-center backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl">

                            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
                                Expertise-Aware Class Scheduling System
                            </h2>

                            <p className="mt-6 text-lg md:text-xl text-gray-200">
                                A smart academic scheduling solution with automatic
                                conflict detection, expertise-based faculty assignment,
                                and optimized timetable generation for
                                AISAT College Dasmariñas.
                            </p>

                            <div className="mt-10 flex flex-col md:flex-row gap-6 justify-center">
                                <Link
                                    href="/login"
                                    className="px-8 py-3 bg-white text-blue-800 font-semibold rounded-lg shadow-lg hover:scale-105 transition transform"
                                >
                                    Get Started
                                </Link>

                                <a
                                    href="#features"
                                    className="px-8 py-3 border border-white rounded-lg hover:bg-white hover:text-blue-800 transition"
                                >
                                    Explore Features
                                </a>
                            </div>

                        </div>
                    </div>

                    {/* Features Section */}
                    <section id="features" className="bg-white text-gray-800 py-24 px-8">
                        <div className="max-w-6xl mx-auto text-center">

                            <h3 className="text-4xl font-bold mb-16">
                                System Capabilities
                            </h3>

                            <div className="grid md:grid-cols-3 gap-10">

                                {/* Card 1 */}
                                <div className="p-10 rounded-2xl shadow-lg border hover:shadow-2xl hover:-translate-y-2 transition transform duration-300 bg-gradient-to-br from-white to-gray-50">
                                    <div className="text-blue-700 text-4xl mb-6">🎯</div>
                                    <h4 className="text-xl font-semibold mb-4">
                                        Expertise Matching
                                    </h4>
                                    <p className="text-gray-600">
                                        Assigns faculty members based on specialization,
                                        qualifications, and teaching expertise.
                                    </p>
                                </div>

                                {/* Card 2 */}
                                <div className="p-10 rounded-2xl shadow-lg border hover:shadow-2xl hover:-translate-y-2 transition transform duration-300 bg-gradient-to-br from-white to-gray-50">
                                    <div className="text-blue-700 text-4xl mb-6">⚠️</div>
                                    <h4 className="text-xl font-semibold mb-4">
                                        Automatic Conflict Detection
                                    </h4>
                                    <p className="text-gray-600">
                                        Prevents time overlaps between rooms, instructors,
                                        and class schedules in real-time.
                                    </p>
                                </div>

                                {/* Card 3 */}
                                <div className="p-10 rounded-2xl shadow-lg border hover:shadow-2xl hover:-translate-y-2 transition transform duration-300 bg-gradient-to-br from-white to-gray-50">
                                    <div className="text-blue-700 text-4xl mb-6">⚙️</div>
                                    <h4 className="text-xl font-semibold mb-4">
                                        Automated Optimization
                                    </h4>
                                    <p className="text-gray-600">
                                        Generates efficient and optimized timetables
                                        using intelligent scheduling logic.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
                        © {new Date().getFullYear()} AISAT College Dasmariñas. All rights reserved.
                    </footer>

                </div>
            </div>
        </>
    );
}
