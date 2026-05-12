import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export const defaultBranding = {
    app_name: 'EVV System',
    app_tagline: 'Electronic Visit Verification',
    login_intro_heading: 'Manage EVV visits with a clear, controlled workflow.',
    login_intro_body: 'Staff clock visits in and out, submit notes, and admins review records for payroll from one secure workspace.',
    login_intro_note: 'Secure staff access and administrator review in one clean workspace.',
    login_heading: 'Sign in to your account',
    login_sub: 'Enter your credentials to continue',
    email_label: 'Email address',
    email_placeholder: 'you@example.com',
    password_label: 'Password',
    password_placeholder: 'Password',
    remember_label: 'Keep me signed in',
    login_button_text: 'Sign in',
    support_email: null,
    footer_note: null,
    primary_color: '#1e293b',
    sidebar_bg: '#0f172a',
    logo_url: null,
    logo_size: 40,
};

const storageKey = 'evv.branding';

export function persistBranding(branding) {
    const merged = { ...defaultBranding, ...branding };
    localStorage.setItem(storageKey, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('branding-updated', { detail: merged }));
}

export default function useBranding() {
    const { branding } = usePage().props;
    const [localBranding, setLocalBranding] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || 'null');
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const onUpdate = (event) => setLocalBranding(event.detail);
        window.addEventListener('branding-updated', onUpdate);
        return () => window.removeEventListener('branding-updated', onUpdate);
    }, []);

    return {
        ...defaultBranding,
        ...(branding ?? {}),
        ...(localBranding ?? {}),
    };
}
