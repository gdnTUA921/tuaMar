import React, { useEffect, useState } from 'react';
import { FaStar, FaFilter, FaDownload } from 'react-icons/fa6';
import { exportToCSV, exportToPDF, formatDateForExport } from '../../utils/exportHelpers';

export default function UserRatings({ ip }) {
    const [ratings, setRatings] = useState([]);
    const [totalRatings, setTotalRatings] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRating, setSelectedRating] = useState('all');
    const [loading, setLoading] = useState(false);
    const ratingsPerPage = 20;

    const fetchRatings = () => {
        setLoading(true);
        const offset = (currentPage - 1) * ratingsPerPage;

        let url = `${ip}/fetchUserRatings.php?limit=${ratingsPerPage}&offset=${offset}`;
        if (selectedRating !== 'all') {
            url += `&rating=${selectedRating}`;
        }

        fetch(url, {
            method: 'GET',
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.ratings) {
                    setRatings(data.ratings);
                    setTotalRatings(data.total);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching ratings:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRatings();
    }, [ip, currentPage, selectedRating]);

    const totalPages = Math.ceil(totalRatings / ratingsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRatingFilter = (rating) => {
        setSelectedRating(rating);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                className={index < rating ? 'star-filled' : 'star-empty'}
            />
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleExportCSV = () => {
        if (ratings.length === 0) {
            alert('No data to export');
            return;
        }

        const exportData = ratings.map(rating => ({
            'Rating ID': rating.rating_id,
            'User ID': rating.user_id,
            'Name': `${rating.first_name} ${rating.last_name}`,
            'Email': rating.email,
            'College': rating.department || 'N/A',
            'Rating': rating.rating,
            'Feedback': rating.feedback || 'No feedback provided',
            'Date': formatDateForExport(rating.created_at)
        }));

        const timestamp = new Date().toISOString().split('T')[0];
        const filterSuffix = selectedRating !== 'all' ? `-${selectedRating}star` : '';
        exportToCSV(exportData, `user-ratings${filterSuffix}-${timestamp}.csv`);
    };

    const handleExportPDF = () => {
        if (ratings.length === 0) {
            alert('No data to export');
            return;
        }

        const exportData = ratings.map(rating => ({
            'Name': `${rating.first_name} ${rating.last_name}`,
            'Email': rating.email,
            'College': rating.department || 'N/A',
            'Rating': `${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}`,
            'Feedback': rating.feedback || 'No feedback',
            'Date': formatDateForExport(rating.created_at)
        }));

        const filterTitle = selectedRating !== 'all' ? ` (${selectedRating} Star)` : '';
        exportToPDF(
            `User Ratings & Feedback${filterTitle}`,
            ['Name', 'Email', 'College', 'Rating', 'Feedback', 'Date'],
            exportData,
            'user-ratings.pdf'
        );
    };

    return (
        <div className="user-ratings-container">
            <div className="ratings-header">
                <h2>User Ratings & Feedback</h2>
                <p className="ratings-subtitle">View all app ratings submitted by users</p>
            </div>

            <div className="ratings-controls">
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${selectedRating === 'all' ? 'active' : ''}`}
                        onClick={() => handleRatingFilter('all')}
                    >
                        <FaFilter /> All Ratings
                    </button>
                    <button
                        className={`filter-btn ${selectedRating === '5' ? 'active' : ''}`}
                        onClick={() => handleRatingFilter('5')}
                    >
                        5 Stars
                    </button>
                    <button
                        className={`filter-btn ${selectedRating === '4' ? 'active' : ''}`}
                        onClick={() => handleRatingFilter('4')}
                    >
                        4 Stars
                    </button>
                    <button
                        className={`filter-btn ${selectedRating === '3' ? 'active' : ''}`}
                        onClick={() => handleRatingFilter('3')}
                    >
                        3 Stars
                    </button>
                    <button
                        className={`filter-btn ${selectedRating === '2' ? 'active' : ''}`}
                        onClick={() => handleRatingFilter('2')}
                    >
                        2 Stars
                    </button>
                    <button
                        className={`filter-btn ${selectedRating === '1' ? 'active' : ''}`}
                        onClick={() => handleRatingFilter('1')}
                    >
                        1 Star
                    </button>
                </div>
                <div className="ratings-actions">
                    <div className="ratings-count">
                        Showing {ratings.length} of {totalRatings} ratings
                    </div>
                    <div className="export-buttons">
                        <button className="export-btn" onClick={handleExportCSV}>
                            <FaDownload /> CSV
                        </button>
                        <button className="export-btn" onClick={handleExportPDF}>
                            <FaDownload /> PDF
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-message">Loading ratings...</div>
            ) : ratings.length === 0 ? (
                <div className="no-ratings-message">
                    No ratings found {selectedRating !== 'all' && `with ${selectedRating} star(s)`}
                </div>
            ) : (
                <>
                    <div className="ratings-grid">
                        {ratings.map((rating) => (
                            <div key={rating.rating_id} className="rating-card">
                                <div className="rating-card-header">
                                    <div className="rating-stars">{renderStars(rating.rating)}</div>
                                    <div className="rating-date">{formatDate(rating.created_at)}</div>
                                </div>
                                <div className="rating-user-info">
                                    <strong>{rating.first_name} {rating.last_name}</strong>
                                    <span className="user-email">{rating.email}</span>
                                    {rating.department && (
                                        <span className="user-college">{rating.department}</span>
                                    )}
                                </div>
                                {rating.feedback && (
                                    <div className="rating-feedback">
                                        <p className="feedback-label">Feedback:</p>
                                        <p className="feedback-text">{rating.feedback}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}