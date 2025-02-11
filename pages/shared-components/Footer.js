import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white shadow-inner mt-8">
            <div className="max-w-7xl mx-auto px-6 py-8 lg:flex lg:justify-between lg:items-center">
                <div className="text-center lg:text-left">
                    <img src="/images/masai-logo.svg" alt="Masai Logo" className="h-10 mx-auto lg:mx-0" />
                    <p className="mt-4 text-gray-600">
                        Empowering education and learning with a focus on skill-building and job readiness.
                    </p>
                </div>

                <div className="mt-6 lg:mt-0 lg:flex lg:space-x-12">
                    <div>
                        <h3 className="text-gray-800 font-semibold">Quick Links</h3>
                        <ul className="mt-2 space-y-2">
                            <li>
                                <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-600 hover:text-blue-600">About Us</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact Us</Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-gray-800 font-semibold">Resources</h3>
                        <ul className="mt-2 space-y-2">
                            <li>
                                <Link href="/privacy-policy" className="text-gray-600 hover:text-blue-600">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-of-service" className="text-gray-600 hover:text-blue-600">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/help" className="text-gray-600 hover:text-blue-600">Help Center</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 lg:mt-0 text-center lg:text-left">
                    <h3 className="text-gray-800 font-semibold">Follow Us</h3>
                    <div className="flex justify-center lg:justify-start space-x-4 mt-2">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                            {/* SVG for Facebook */}
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                            {/* SVG for Twitter */}
                        </a>
                        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                            {/* SVG for LinkedIn */}
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t py-4 mt-6 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Masai Connect. All rights reserved.
            </div>
        </footer>
    );
}