import { useEffect, useState } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import Footer from '../shared-components/Footer';

const ITEMS_PER_PAGE = 5;

export default function ReportsPage() {
    const [reportsData, setReportsData] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        const fetchReportsData = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

                const simulatedReports = Array.from({ length: 30 }, (_, index) => ({
                    reportId: `${index + 1}`,
                    date: new Date(Date.now() - index * 86400000).toISOString(),
                    title: `Report ${index + 1} Title`,
                    description: `This is a detailed description for Report ${index + 1}.`,
                    usersActive: Math.floor(Math.random() * 500 + 50),
                    sessionsBooked: Math.floor(Math.random() * 100 + 10),
                }));

                setReportsData(simulatedReports);
                setFilteredReports(simulatedReports);  // Initialize filtered data
            } catch (err) {
                console.error('Error fetching reports data:', err);
                setError('Failed to load reports data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchReportsData();
    }, []);

    const handleSearch = (term) => {
        const lowerTerm = term.toLowerCase();
        setFilteredReports(
            reportsData.filter(
                (report) =>
                    report.title.toLowerCase().includes(lowerTerm) ||
                    report.description.toLowerCase().includes(lowerTerm)
            )
        );
        setCurrentPage(1);  // Reset to the first page after a search
    };

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleReportClick = (report) => {
        setSelectedReport(report);
    };

    const handleBackToReports = () => {
        setSelectedReport(null);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header onSearch={handleSearch} />

            <div className="flex flex-1">
                <Sidebar />

                <main className="flex-1 px-6 py-6 bg-gray-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-gray-300"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-600 font-medium">{error}</div>
                    ) : selectedReport ? (
                        <div className="max-w-8xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                            <button
                                className="text-blue-500 font-semibold mb-4 hover:underline"
                                onClick={handleBackToReports}
                            >
                                &larr; Back to Reports
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedReport.title}</h2>
                            <p className="text-gray-500 mb-2">
                                <strong>Date:</strong> {new Date(selectedReport.date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-700 mb-4">{selectedReport.description}</p>
                            <div className="space-y-2">
                                <p className="text-gray-800">
                                    <strong>Users Active:</strong> {selectedReport.usersActive}
                                </p>
                                <p className="text-gray-800">
                                    <strong>Sessions Booked:</strong> {selectedReport.sessionsBooked}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-8xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                            <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Reports</h1>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Reports</h2>
                                {paginatedReports.length > 0 ? (
                                    <ul className="space-y-6">
                                        {paginatedReports.map((report) => (
                                            <li
                                                key={report.reportId}
                                                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                                onClick={() => handleReportClick(report)}
                                            >
                                                <h3 className="text-lg font-bold text-blue-700">{report.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(report.date).toLocaleDateString()}
                                                </p>
                                                <p className="text-gray-600 mt-2">{report.description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600">No reports available at this time.</p>
                                )}
                            </section>

                            {/* Pagination Controls */}
                          <div className="flex justify-center items-center space-x-4 mt-6">
                            <button
                                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                                    currentPage === 1
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg'
                                }`}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                            >
                                First
                            </button>

                            <button
                                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                                    currentPage === 1
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg'
                                }`}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            >
                                Previous
                            </button>

                            <span className="text-gray-700 font-semibold text-sm">
                                Page <span className="text-blue-600">{currentPage}</span> of <span className="text-blue-600">{totalPages}</span>
                            </span>

                            <button
                                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                                    currentPage === totalPages
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg'
                                }`}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            >
                                Next
                            </button>

                            <button
                                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                                    currentPage === totalPages
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg'
                                }`}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                            >
                                Last
                            </button>
                        </div>
                        </div>
                    )}
                </main>
            </div>

        </div>
    );
}