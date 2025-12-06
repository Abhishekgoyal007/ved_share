import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader, FileText } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SecurePDFViewer = ({ url, limitPages = null }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [pdfData, setPdfData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
                }
                const blob = await response.blob();
                setPdfData(blob);
            } catch (err) {
                console.error("Error loading PDF:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (url) {
            fetchPdf();
        }
    }, [url]);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(limitPages ? Math.min(numPages, limitPages) : numPages);
    }

    const changePage = (offset) => {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg border border-red-500/50 text-red-400">
                <p>Error loading document: {error}</p>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col items-center select-none"
            onContextMenu={(e) => e.preventDefault()} // Disable right click
        >
            <div className="relative border border-gray-700 rounded-lg overflow-hidden shadow-2xl bg-gray-800">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
                        <Loader className="w-8 h-8 animate-spin text-cyan-400" />
                    </div>
                )}

                {pdfData && (
                    <Document
                        file={pdfData}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="h-[600px] w-[400px] flex items-center justify-center">
                                <Loader className="w-8 h-8 animate-spin text-cyan-400" />
                            </div>
                        }
                        error={
                            <div className="h-[600px] w-[400px] flex items-center justify-center text-red-400">
                                Failed to render PDF
                            </div>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={Math.min(window.innerWidth * 0.9, 800)} // Responsive width
                            className="shadow-lg"
                        />
                    </Document>
                )}

                {/* Overlay to prevent drag/drop and further interactions */}
                <div className="absolute inset-0 z-20 bg-transparent" onContextMenu={(e) => e.preventDefault()} />
            </div>

            <div className="flex items-center gap-4 mt-4">
                <button
                    type="button"
                    disabled={pageNumber <= 1}
                    onClick={previousPage}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <p className="text-gray-300">
                    Page {pageNumber} of {numPages}
                </p>

                <button
                    type="button"
                    disabled={pageNumber >= numPages}
                    onClick={nextPage}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
};

export default SecurePDFViewer;
