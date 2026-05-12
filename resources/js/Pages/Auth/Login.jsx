import { Head, useForm } from '@inertiajs/react';
import BrandMark from '@/Components/BrandMark';
import useBranding from '@/Components/useBranding';

export default function Login({ status }) {
    const brand = useBranding();

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <Head title={`Sign in - ${brand.app_name}`} />

            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
                    <section className="hidden border-r border-slate-200 bg-slate-100/70 p-10 lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <div className="mb-8 flex items-center gap-3">
                                <BrandMark color={brand.primary_color} className="h-10 w-10 flex-shrink-0" />
                                <div>
                                    <p className="text-base font-semibold text-slate-950">{brand.app_name}</p>
                                    <p className="text-sm text-slate-500">{brand.app_tagline}</p>
                                </div>
                            </div>

                            <h1 className="max-w-sm text-2xl font-semibold tracking-tight text-slate-950">{brand.login_intro_heading}</h1>
                            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
                                {brand.login_intro_body}
                            </p>
                        </div>

                        <div className="text-sm leading-6 text-slate-500">
                            {brand.login_intro_note}
                        </div>
                    </section>

                    <section className="px-6 py-8 sm:px-10 lg:px-12 lg:py-14">
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <BrandMark color={brand.primary_color} className="h-10 w-10 flex-shrink-0" />
                            <div>
                                <p className="text-base font-semibold text-slate-950">{brand.app_name}</p>
                                <p className="text-sm text-slate-500">{brand.app_tagline}</p>
                            </div>
                        </div>

                        <div className="mx-auto max-w-sm">
                            <div className="mb-7">
                                <h2 className="text-xl font-semibold tracking-tight text-slate-950">{brand.login_heading}</h2>
                                <p className="mt-2 text-sm text-slate-500">{brand.login_sub}</p>
                            </div>

                            {status && (
                                <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                                        {brand.email_label}
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        autoFocus
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={brand.email_placeholder}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder-slate-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                    {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                                        {brand.password_label}
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder={brand.password_placeholder}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder-slate-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                    {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                    />
                                    <label htmlFor="remember" className="select-none text-sm text-slate-600">
                                        {brand.remember_label}
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={{ backgroundColor: brand.primary_color }}
                                    className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Signing in...' : brand.login_button_text}
                                </button>
                            </form>

                            {brand.support_email && (
                                <p className="mt-6 text-center text-xs text-slate-500">
                                    Need help?{' '}
                                    <a href={`mailto:${brand.support_email}`} className="font-medium text-slate-800 underline underline-offset-2">
                                        {brand.support_email}
                                    </a>
                                </p>
                            )}

                            {brand.footer_note && (
                                <p className="mt-6 text-center text-xs text-slate-400">{brand.footer_note}</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
