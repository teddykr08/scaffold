"use client";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white py-20 px-6">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                <h1 className="font-graffiti text-5xl mb-4 tracking-tight text-gray-900 uppercase">Contact Us</h1>
                <p className="text-gray-600 mb-16 text-center max-w-xl text-xl">
                    Have questions or feedback? Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>

                <div className="w-full flex justify-end mb-2">
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSe1onCdPafZiSgw2Gxp8IDDtMd_J22AKkbyd8CFeh_P48mljw/viewform"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
                    >
                        Open form in new tab
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                </div>
                <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSe1onCdPafZiSgw2Gxp8IDDtMd_J22AKkbyd8CFeh_P48mljw/viewform?embedded=true"
                        width="100%"
                        height="800"
                        frameBorder="0"
                        marginHeight={0}
                        marginWidth={0}
                        className="w-full"
                    >
                        Loading…
                    </iframe>
                </div>
            </div>
        </div>
    );
}

