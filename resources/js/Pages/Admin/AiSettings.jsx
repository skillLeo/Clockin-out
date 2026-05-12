import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, XMarkIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function AiSettings({ settings }) {
    const [sections, setSections] = useState([...settings.section_order]);
    const [newSection, setNewSection] = useState('');
    const [length, setLength]   = useState(settings.summary_length);
    const [tone, setTone]       = useState(settings.tone);
    const [rules, setRules]     = useState(settings.cleaning_rules ?? '');
    const [saving, setSaving]   = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState(null);

    const add = () => {
        const n = newSection.trim();
        if (!n || sections.includes(n)) return;
        setSections([...sections, n]); setNewSection('');
    };
    const remove = i => setSections(sections.filter((_, idx) => idx !== i));
    const moveUp = i => { if (i === 0) return; const s = [...sections]; [s[i-1], s[i]] = [s[i], s[i-1]]; setSections(s); };
    const moveDown = i => { if (i === sections.length - 1) return; const s = [...sections]; [s[i], s[i+1]] = [s[i+1], s[i]]; setSections(s); };

    const save = async () => {
        setSaving(true); setError(null); setSuccess(false);
        try {
            await axios.post('/api/admin/ai-settings', { sections, section_order: sections, summary_length: length, tone, cleaning_rules: rules || null });
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

                {/* Sections */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5">
                    <p className="text-sm font-semibold text-slate-800 mb-1">Summary Sections</p>
                    <p className="text-xs text-slate-500 mb-4">Sections that appear in the AI-generated structured summary. Drag to reorder.</p>

                    {sections.length === 0 && <p className="text-sm text-slate-400 italic mb-3">No sections configured.</p>}

                    <ul className="space-y-1.5 mb-4">
                        {sections.map((s, i) => (
                            <li key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                                <span className="flex-1 text-sm font-medium text-slate-700">{s}</span>
                                <div className="flex items-center gap-0.5">
                                    <button onClick={() => moveUp(i)} disabled={i === 0}
                                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-25 transition-colors">
                                        <ChevronUpIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => moveDown(i)} disabled={i === sections.length - 1}
                                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-25 transition-colors">
                                        <ChevronDownIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => remove(i)}
                                        className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors">
                                        <XMarkIcon className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="flex gap-2">
                        <input type="text" value={newSection}
                            onChange={e => setNewSection(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && add()}
                            placeholder="New section name…"
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        <button onClick={add}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <PlusIcon className="h-4 w-4" /> Add
                        </button>
                    </div>
                </div>

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
                    <button onClick={save} disabled={saving || sections.length === 0}
                        className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {saving ? 'Saving…' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
