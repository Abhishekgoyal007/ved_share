import { useEffect, useCallback, useState } from 'react';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Load reCAPTCHA script
export const useRecaptcha = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Skip if no site key configured
        if (!RECAPTCHA_SITE_KEY) {
            console.warn('reCAPTCHA not configured - VITE_RECAPTCHA_SITE_KEY missing');
            return;
        }

        // Check if already loaded
        if (window.grecaptcha) {
            setIsLoaded(true);
            return;
        }

        // Load the script
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            window.grecaptcha.ready(() => {
                setIsLoaded(true);
            });
        };

        script.onerror = () => {
            setError('Failed to load reCAPTCHA');
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup is handled by browser
        };
    }, []);

    // Execute reCAPTCHA and get token
    const executeRecaptcha = useCallback(async (action = 'submit') => {
        if (!RECAPTCHA_SITE_KEY) {
            return null; // Skip if not configured
        }

        if (!isLoaded || !window.grecaptcha) {
            console.warn('reCAPTCHA not loaded yet');
            return null;
        }

        try {
            const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
            return token;
        } catch (err) {
            console.error('reCAPTCHA execution error:', err);
            return null;
        }
    }, [isLoaded]);

    return {
        isLoaded,
        error,
        executeRecaptcha,
        isConfigured: !!RECAPTCHA_SITE_KEY,
    };
};

// Component to show reCAPTCHA badge info
export const RecaptchaBadge = ({ className = '' }) => {
    const { isConfigured } = useRecaptcha();

    if (!isConfigured) return null;

    return (
        <div className={`text-xs text-gray-500 text-center mt-4 ${className}`}>
            <p>
                This site is protected by reCAPTCHA and the Google{' '}
                <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-500 hover:text-cyan-400 underline"
                >
                    Privacy Policy
                </a>{' '}
                and{' '}
                <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-500 hover:text-cyan-400 underline"
                >
                    Terms of Service
                </a>{' '}
                apply.
            </p>
        </div>
    );
};

export default useRecaptcha;
