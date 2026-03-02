import { Head, Link, useForm } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    })

    const [showPassword, setShowPassword] = useState(false)

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/register')
    }

    return (
        <>
            <Head title="Register" />

            <div className="min-h-screen grid md:grid-cols-2">

                {/* LEFT PANEL */}
                <div className="hidden md:flex flex-col justify-center items-center text-center p-10">

                    <h1 className="text-5xl font-extrabold mb-4 text-black dark:text-gray-200">
                        Expertise-Aware
                    </h1>

                    <p className="text-lg max-w-md text-gray-600 dark:text-gray-200">
                        Class Scheduling System
                    </p>

                    <p className="mt-10 text-gray-500">
                        Already have an account?
                    </p>

                    <Link
                        href="/login"
                        className="mt-3 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                        Login
                    </Link>

                </div>

                {/* RIGHT PANEL */}
                <div className="flex items-center justify-center bg-gray-100 p-6">

                    <div className="w-full max-w-md backdrop-blur-xl bg-white/80 shadow-2xl rounded-2xl p-8">

                        <h2 className="text-2xl font-bold text-center mb-2">
                            Create an Account ✨
                        </h2>

                        <p className="text-center text-gray-500 mb-6">
                            Register to get started
                        </p>

                        <form onSubmit={submit} className="space-y-4">

                            {/* NAME */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full border p-3 rounded-xl"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm">{errors.name}</p>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div>
                                <input
                                    type="email"
                                    placeholder="AISAT Email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full border p-3 rounded-xl"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm">{errors.email}</p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full border p-3 rounded-xl"
                                />
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={data.password_confirmation}
                                    onChange={e =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    className="w-full border p-3 rounded-xl"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-indigo-600 mt-1"
                                >
                                    {showPassword ? 'Hide Password' : 'Show Password'}
                                </button>

                                {errors.password && (
                                    <p className="text-red-500 text-sm">{errors.password}</p>
                                )}
                            </div>

                            {/* BUTTON */}
                            <button
                                disabled={processing}
                                className="w-full bg-indigo-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
                            >
                                {processing && (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                )}
                                Register
                            </button>

                        </form>

                        <p className="text-center text-xs text-gray-400 mt-6">
                            © 2026 AISAT College Dasma
                        </p>

                    </div>

                </div>
            </div>
        </>
    )
}