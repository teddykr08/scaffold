"use client";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white py-20 px-6">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-4 tracking-tight text-gray-900">Contact Us</h1>
                <p className="text-gray-600 mb-16 text-center max-w-xl text-xl">
                    Have questions or feedback? Fill out the form below and we'll get back to you as soon as possible.
                </p>

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

                <div className="mt-16 text-center text-gray-500">
                    <p>Or email us directly at <a href="mailto:support@scaffold.com" className="text-black font-semibold hover:underline">support@scaffold.com</a></p>
                </div>
            </div>
        </div>
    );
}
