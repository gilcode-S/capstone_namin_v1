import { Head, useForm, Link } from '@inertiajs/react'
import {  Loader2 } from 'lucide-react'
import { useState } from 'react'


export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    })

    const [showPassword, setShowPassword] = useState(false)

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/login')
    }

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen grid md:grid-cols-2">

                {/* LEFT PANEL */}
                <div className="hidden md:flex flex-col justify-center items-center  text-white p-10">

                    <h1 className="text-5xl font-extrabold mb-4 text-black dark:text-gray-200"> Expertise-Aware </h1>

                    <p className="text-lg text-center max-w-md text-gray-600 dark:text-gray-200">
                        Class Scheduling System
                    </p>
                    <Link
                        href="/register"
                        className="mt-3 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                        Register
                    </Link>

                </div>

                {/* RIGHT PANEL */}
                <div className="flex items-center justify-center bg-gray-100 p-6">

                    <div className="w-full max-w-md backdrop-blur-xl bg-white/80 shadow-2xl rounded-2xl p-8">

                        <h2 className="text-2xl font-bold text-center mb-2">
                            Welcome Back 👋
                        </h2>

                        <p className="text-center text-gray-500 mb-6">
                            Login to continue
                        </p>

                        <form onSubmit={submit} className="space-y-4">

                            {/* EMAIL */}
                            <div>
                                <input
                                    type="email"
                                    placeholder="AISAT-Email"
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

                            {/* REMEMBER ME */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked)}
                                    />
                                    Remember me
                                </label>

                                <a href="/forgot-password" className="text-indigo-600">
                                    Forgot password?
                                </a>
                            </div>

                            {/* BUTTON */}
                            <button
                                disabled={processing}
                                className="w-full bg-indigo-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
                            >
                                {processing && <Loader2 className="animate-spin w-4 h-4" />}
                                Login
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