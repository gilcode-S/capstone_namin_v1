import { Head, useForm } from '@inertiajs/react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
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

            <div className="min-h-screen bg-[#e9e9e9] flex items-center justify-center p-6">

                {/* MAIN CONTAINER */}
                <div className="w-full max-w-6xl h-[700px] bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">


                    {/* LEFT SIDE */}
                    {/* LEFT SIDE */}
                    <div className="hidden md:flex relative flex-col justify-between p-10 text-white overflow-hidden">

                        {/* BACKGROUND IMAGE */}
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-100"
                            style={{
                                backgroundImage: "url('/image/dasmas1.png')",
                            }}
                        ></div>

                        {/* BLUE + YELLOW GRADIENT OVERLAY */}
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/80 via-blue-500/75 to-yellow-300/60"></div>

                        {/* EXTRA SOFT GLOW */}
                        <div className="absolute -top-20 -left-20 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl"></div>

                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>

                        {/* CONTENT */}
                        <div className="relative z-10">

                            {/* LOGO */}
                            <div className="flex items-center gap-3 ">

                                <div className="w-12 h-12 rounded flex items-center justify-center text-2xl shadow-lg">
                                    <img src="image/dasmaa.png" alt="" className="w-12 h-12 object-contain" />
                                </div>

                                <div>
                                    <h2 className="font-bold text-xl">
                                        AISAT Scheduler
                                    </h2>


                                </div>
                            </div>
                        </div>

                        {/* BOTTOM TEXT */}
                        <div className="relative z-10">

                            <p className="uppercase tracking-[0.3em] text-xs text-yellow-100 mb-3">
                                Competency-Aware Automatic Class Scheduler
                            </p>

                            <h1 className="text-3xl font-extrabold leading-tight mb-6 drop-shadow-lg">
                                "Eliminating Conflicts, Empowering Education through Intelligent Automation."
                            </h1>



                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center justify-center p-8 md:p-14 bg-white">

                        <div className="w-full max-w-md">

                            {/* HEADER */}
                            <div className="mb-10">
                                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                                    Welcome Back!
                                </h2>

                                <p className="text-gray-500">
                                    Login to continue to your dashboard
                                </p>
                            </div>

                            {/* FORM */}
                            <form
                                onSubmit={submit}
                                className="space-y-5"
                            >

                                {/* EMAIL */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    />

                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* PASSWORD */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Password
                                    </label>

                                    <div className="relative mt-2">
                                        <input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Enter your password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-black"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={20} />
                                            ) : (
                                                <Eye size={20} />
                                            )}
                                        </button>
                                    </div>

                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* REMEMBER + FORGOT */}
                                <div className="flex items-center justify-between text-sm">

                                    <label className="flex items-center gap-2 text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    'remember',
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded border-gray-300"
                                        />

                                        Remember me
                                    </label>

                                    {/* <a
                                        href="/forgot-password"
                                        className="text-gray-900 font-medium hover:underline"
                                    >
                                        Forgot Password?
                                    </a> */}
                                </div>

                                {/* BUTTON */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-black hover:bg-gray-900 text-white rounded-xl py-3 font-medium transition flex items-center justify-center gap-2"
                                >
                                    {processing && (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    )}

                                    Login
                                </button>

                            </form>

                            {/* FOOTER */}
                            <p className="text-center text-sm text-gray-400 mt-10">
                                © 2026 AISAT College Dasma
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}