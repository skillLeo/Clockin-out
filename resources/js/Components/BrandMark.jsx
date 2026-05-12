export default function BrandMark({ color = '#1e293b', className = 'h-10 w-10', logoUrl = null }) {
    if (logoUrl) {
        return (
            <img
                src={logoUrl}
                alt="Logo"
                className={className}
                style={{ objectFit: 'contain', display: 'block', width: '100%', height: '100%' }}
            />
        );
    }

    return (
        <svg className={className} viewBox="0 0 48 48" role="img" aria-label="Application logo">
            <rect width="48" height="48" rx="14" fill={color} />
            <path
                d="M24 12.5c5.8 0 10.5 4.7 10.5 10.5S29.8 33.5 24 33.5 13.5 28.8 13.5 23 18.2 12.5 24 12.5Z"
                fill="none"
                stroke="white"
                strokeWidth="3"
            />
            <path
                d="M24 17.5V24l4.5 2.8"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15 36h18"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}
