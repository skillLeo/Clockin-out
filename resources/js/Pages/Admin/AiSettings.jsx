import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function AiSettings({ settings }) {
    const [length, setLength]   = useState(settings.summary_length);
    const [tone, setTone]       = useState(settings.tone);
    const [rules, setRules]     = useState(settings.cleaning_rules ?? '');
    const [saving, setSaving]   = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState(null);

    const save = async () => {
        setSaving(true); setError(null); setSuccess(false);
        try {
            await axios.post('/api/admin/ai-settings', { summary_length: length, tone, cleaning_rules: rules || null });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            setError(e.response?.data?.message ?? 'Failed to save.');
        } finally { setSaving(false); }
    };

    const inp = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

    return (
        <AdminLayout title="AI Settings">
            <Head title="AI Settings" />

            <div className="max-w-2xl space-y-4">
                {success && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                        <CheckIcon className="h-4 w-4 flex-shrink-0" /> Settings saved.
                    </div>
                )}
                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                {/* Length + Tone */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm font-semibold text-slate-800 mb-3">Summary Length</p>
                        <div className="space-y-2">
                            {['short', 'medium'].map(v => (
                                <label key={v} className="flex items-center gap-2.5 cursor-pointer group">
                                    <input type="radio" value={v} checked={length === v}
                                        onChange={() => setLength(v)}
                                        className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                                    <span className="text-sm capitalize text-slate-700 group-hover:text-slate-900">{v}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-3">Tone</label>
                        <input type="text" value={tone} onChange={e => setTone(e.target.value)}
                            placeholder="e.g. neutral, professional, warm" className={inp} />
                    </div>
                </div>

                {/* Cleaning rules */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5">
                    <label className="block text-sm font-semibold text-slate-800 mb-1">
                        Cleaning Rules <span className="font-normal text-slate-400 text-xs">— optional</span>
                    </label>
                    <p className="text-xs text-slate-500 mb-3">Extra instructions sent to the AI when cleaning notes.</p>
                    <textarea rows={4} value={rules} onChange={e => setRules(e.target.value)}
                        placeholder="e.g. Remove filler words. Fix grammar. Keep medical terminology intact."
                        className={`${inp} resize-none`} />
                </div>

                <div className="flex justify-end">
                    <button onClick={save} disabled={saving}
                        className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {saving ? 'Saving…' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
