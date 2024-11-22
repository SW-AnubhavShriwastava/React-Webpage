import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TokenManagement = () => {
    const [socket, setSocket] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:5000',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/auth/transactions', {
                params: {
                    page,
                    limit: rowsPerPage,
                    type: filterType,
                    sortBy,
                    sortOrder,
                    startDate,
                    endDate
                }
            });
            setTransactions(response.data.transactions);
            setTotalTransactions(response.data.total);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setLoading(false);
            showMessage('Error fetching transactions', 'error');
        }
    }, [page, rowsPerPage, filterType, sortBy, sortOrder, startDate, endDate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Create WebSocket connection
        const ws = new WebSocket(`ws://localhost:5000/ws?token=${token}`);

        ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'TRANSACTION_UPDATE') {
                // Automatically refresh transactions when new one is received
                fetchTransactions();
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                console.log('Attempting to reconnect...');
                setSocket(null);
            }, 3000);
        };

        setSocket(ws);

        // Cleanup on component unmount
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);  // Empty dependency array means this runs once on mount

    return (
        <div>
            {/* Your component JSX */}
        </div>
    );
};

export default TokenManagement; 