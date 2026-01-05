/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // Apply to embed forms
                source: '/embed/form',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: https:",
                            "connect-src 'self' https://api.anthropic.com",
                            "frame-ancestors *", // Allow embedding on any site
                        ].join('; ')
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'ALLOWALL' // Allow iframe embedding
                    }
                ]
            }
        ]
    }
}

module.exports = nextConfig





