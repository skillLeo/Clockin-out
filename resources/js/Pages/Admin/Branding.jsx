import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { defaultBranding, persistBranding } from '@/Components/useBranding';
import axios from 'axios';
import { useRef, useState } from 'react';
import { CheckIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

const TABS = ['Logo', 'Colors', 'Login Page'];

export default function Branding({ settings }) {
    const { branding } = usePage().props;
    const initial = { ...defaultBranding, ...(branding ?? {}), ...(settings ?? {}) };

    const [form, setForm] = useState({
        ...initial,
        app_tagline: initial.app_tagline ?? '',
        login_intro_body: initial.login_intro_body ?? '',
        login_intro_note: initial.login_intro_note ?? '',
        login_sub: initial.login_sub ?? '',
        support_email: initial.support_email ?? '',
        footer_note: initial.footer_note ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    const [logoUrl, setLogoUrl]             = useState(settings?.logo_url ?? null);
    const [logoSize, setLogoSize]           = useState(settings?.logo_size ?? 40);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoError, setLogoError]         = useState(null);
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('Logo');

    const uploadLogo = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoUploading(true); setLogoError(null);
        const fd = new FormData();
        fd.append('logo', file);
        try {
            const { data } = await axios.post('/api/admin/branding/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setLogoUrl(data.logo_url);
            persistBranding({ ...form, logo_url: data.logo_url, logo_size: logoSize });
            router.reload({ only: ['branding'], preserveScroll: true, preserveState: true });
        } catch (e) { setLogoError(e.response?.data?.message ?? 'Upload failed.'); }
        finally { setLogoUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const removeLogo = async () => {
        setLogoUploading(true); setLogoError(null);
        try {
            await axios.delete('/api/admin/branding/logo');
            setLogoUrl(null);
            persistBranding({ ...form, logo_url: null, logo_size: logoSize });
            router.reload({ only: ['branding'], preserveScroll: true, preserveState: true });
        } catch { setLogoError('Failed to remove logo.'); }
        finally { setLogoUploading(false); }
    };

    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        setSaved(false);
        setError(null);

        const payload = {
            ...form,
            app_tagline: form.app_tagline || null,
            login_intro_body: form.login_intro_body || null,
            login_intro_note: form.login_intro_note || null,
            login_sub: form.login_sub || null,
            support_email: form.support_email || null,
            footer_note: form.footer_note || null,
            logo_size: logoSize,
            logo_url: logoUrl,
        };

        try {
            await axios.post('/api/admin/branding', payload);
            persistBranding(payload);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            setError(e.response?.data?.message ?? 'Branding could not be saved.');
        } finally {
            setSaving(false);
        }
    };

    const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900';
    const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';

    return (
        <AdminLayout title="Branding">
            <Head title="Branding" />

            <form onSubmit={save} className="space-y-5">
                {saved && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        <CheckIcon className="h-4 w-4" />
                        Branding saved successfully.
                    </div>
                )}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Tab bar */}
                <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                                activeTab === tab
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Logo tab */}
                {activeTab === 'Logo' && (
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-sm font-semibold text-slate-900">Logo</h2>
                            <p className="mt-1 text-sm text-slate-500">Upload a custom logo (PNG, JPG, SVG — max 2 MB). Shown in the sidebar and login page.</p>
                        </div>

                        {logoError && <p className="mb-3 text-sm text-red-600">{logoError}</p>}

                        <div className="flex items-start gap-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                                {logoUrl
                                    ? <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                                    : <PhotoIcon className="h-8 w-8 text-slate-300" />
                                }
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="flex gap-2">
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={logoUploading}
                                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                        {logoUploading ? 'Uploading…' : logoUrl ? 'Change Logo' : 'Upload Logo'}
                                    </button>
                                    {logoUrl && (
                                        <button type="button" onClick={removeLogo} disabled={logoUploading}
                                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">
                                            <TrashIcon className="h-4 w-4" /> Remove
                                        </button>
                                    )}
                                </div>
                                {logoUrl && (
                                    <div>
                                        <label className={labelClass}>Logo Size — {logoSize}px</label>
                                        <input type="range" min={24} max={120} step={4}
                                            value={logoSize}
                                            onChange={e => setLogoSize(Number(e.target.value))}
                                            className="w-full max-w-sm accent-slate-900 mt-1" />
                                        <div className="flex justify-between text-xs text-slate-400 mt-0.5 max-w-sm">
                                            <span>Small (24px)</span><span>Large (120px)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Colors tab */}
                {activeTab === 'Colors' && (
                    <div className="space-y-5">
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-sm font-semibold text-slate-900">App Identity</h2>
                                <p className="mt-1 text-sm text-slate-500">Application name and tagline shown in the sidebar and login page.</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>App Name</label>
                                    <input className={inputClass} value={form.app_name} onChange={(e) => set('app_name', e.target.value)} maxLength={80} />
                                </div>
                                <div>
                                    <label className={labelClass}>Tagline</label>
                                    <input className={inputClass} value={form.app_tagline} onChange={(e) => set('app_tagline', e.target.value)} maxLength={150} />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-sm font-semibold text-slate-900">Colors</h2>
                                <p className="mt-1 text-sm text-slate-500">Primary color controls buttons and active sidebar accents. Sidebar color sets the sidebar background.</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Primary Color</label>
                                    <div className="flex gap-2">
                                        <input type="color" className="h-10 w-12 rounded-lg border border-slate-300 bg-white p-1" value={form.primary_color} onChange={(e) => set('primary_color', e.target.value)} />
                                        <input className={inputClass} value={form.primary_color} onChange={(e) => set('primary_color', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Sidebar Color</label>
                                    <div className="flex gap-2">
                                        <input type="color" className="h-10 w-12 rounded-lg border border-slate-300 bg-white p-1" value={form.sidebar_bg} onChange={(e) => set('sidebar_bg', e.target.value)} />
                                        <input className={inputClass} value={form.sidebar_bg} onChange={(e) => set('sidebar_bg', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Login Page tab */}
                {activeTab === 'Login Page' && (
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-sm font-semibold text-slate-900">Login Page Content</h2>
                            <p className="mt-1 text-sm text-slate-500">Every visible text block on the login page is controlled here.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Left Panel Heading</label>
                                <input className={inputClass} value={form.login_intro_heading} onChange={(e) => set('login_intro_heading', e.target.value)} maxLength={160} />
                            </div>
                            <div>
                                <label className={labelClass}>Left Panel Body</label>
                                <textarea className={`${inputClass} resize-none`} rows={3} value={form.login_intro_body} onChange={(e) => set('login_intro_body', e.target.value)} maxLength={500} />
                            </div>
                            <div>
                                <label className={labelClass}>Left Panel Footer Text</label>
                                <input className={inputClass} value={form.login_intro_note} onChange={(e) => set('login_intro_note', e.target.value)} maxLength={200} />
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Login Form</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Form Heading</label>
                                        <input className={inputClass} value={form.login_heading} onChange={(e) => set('login_heading', e.target.value)} maxLength={100} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Form Subtext</label>
                                        <input className={inputClass} value={form.login_sub} onChange={(e) => set('login_sub', e.target.value)} maxLength={200} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Email Label</label>
                                        <input className={inputClass} value={form.email_label} onChange={(e) => set('email_label', e.target.value)} maxLength={80} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Email Placeholder</label>
                                        <input className={inputClass} value={form.email_placeholder} onChange={(e) => set('email_placeholder', e.target.value)} maxLength={120} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Password Label</label>
                                        <input className={inputClass} value={form.password_label} onChange={(e) => set('password_label', e.target.value)} maxLength={80} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Password Placeholder</label>
                                        <input className={inputClass} value={form.password_placeholder} onChange={(e) => set('password_placeholder', e.target.value)} maxLength={120} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Remember Label</label>
                                        <input className={inputClass} value={form.remember_label} onChange={(e) => set('remember_label', e.target.value)} maxLength={120} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Button Text</label>
                                        <input className={inputClass} value={form.login_button_text} onChange={(e) => set('login_button_text', e.target.value)} maxLength={80} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Support Email</label>
                                        <input className={inputClass} type="email" value={form.support_email} onChange={(e) => set('support_email', e.target.value)} maxLength={150} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Footer Note</label>
                                        <input className={inputClass} value={form.footer_note} onChange={(e) => set('footer_note', e.target.value)} maxLength={200} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: form.primary_color }}
                    >
                        {saving ? 'Saving...' : 'Save Branding'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
