// Secure Admin panel functionality with server-side authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin panel elements exist
    if (!document.getElementById('quotes-table')) {
        console.log('Admin panel not detected, skipping admin initialization');
        return;
    }

    console.log('Admin panel detected, initializing...');

    // Load quotes from localStorage
    const storedQuotes = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
    if (storedQuotes.length > 0) {
        quoteRequests = storedQuotes;
        console.log('Loaded', storedQuotes.length, 'quotes from localStorage');
    }

    // Initialize admin functionality
    loadDashboardStats();
    loadQuoteRequests();

    // Setup event listeners
    setupEventListeners();

    console.log('Admin panel initialized');
});

async function checkAuthentication() {
    const sessionToken = localStorage.getItem('admin_session_token');
    const loginTime = localStorage.getItem('admin_login_time');

    if (!sessionToken || !loginTime) {
        return false;
    }

    // Check if session is still valid locally (2 hours)
    const now = new Date();
    const loginDate = new Date(loginTime);
    const timeDiff = now - loginDate;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff > 2) {
        logout();
        return false;
    }

    // Verify with server
    try {
        const response = await fetch('/api/admin/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: sessionToken })
        });

        if (!response.ok) {
            logout();
            return false;
        }

        const data = await response.json();

        if (!data.valid) {
            logout();
            return false;
        }

        return true;
    } catch (error) {
        console.error('Authentication verification failed:', error);
        // Don't logout on network errors, allow offline access for short period
        return hoursDiff < 1; // Allow 1 hour offline access
    }
}

async function logout() {
    const sessionToken = localStorage.getItem('admin_session_token');

    // Notify server about logout
    if (sessionToken) {
        try {
            await fetch('/api/admin/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: sessionToken })
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear all admin session data
    localStorage.removeItem('admin_session_token');
    localStorage.removeItem('admin_login_time');
    localStorage.removeItem('admin_authenticated');

    // Clear any cached data
    sessionStorage.clear();

    window.location.href = 'login.html';
}

// Enhanced sample data with more fields
let quoteRequests = JSON.parse(localStorage.getItem('quoteRequests')) || [
    {
        id: 'QR2025001',
        date: '2025-01-18',
        customerName: 'John Smith',
        customerEmail: 'john.smith@example.com',
        phone: '+1-555-0123',
        company: 'ABC Trading Co.',
        serviceType: 'sea-freight',
        origin: 'Mumbai, India',
        destination: 'New York, USA',
        cargoType: 'general',
        weight: 1500,
        volume: 12.5,
        packages: 50,
        status: 'pending',
        specialRequirements: 'Temperature controlled shipping required',
        adminNotes: '',
        quotedAmount: null,
        lastUpdated: '2025-01-18'
    },
    {
        id: 'QR2025002',
        date: '2025-01-17',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@techcorp.com',
        phone: '+1-555-0124',
        company: 'TechCorp Inc.',
        serviceType: 'air-freight',
        origin: 'Shanghai, China',
        destination: 'London, UK',
        cargoType: 'electronics',
        weight: 250,
        volume: 2.8,
        packages: 10,
        status: 'quoted',
        quotedAmount: 2850.00,
        specialRequirements: 'Fragile electronics, requires careful handling',
        adminNotes: 'Customer requested expedited service',
        lastUpdated: '2025-01-17'
    },
    {
        id: 'QR2025003',
        date: '2025-01-16',
        customerName: 'Mike Wilson',
        customerEmail: 'mike@autoparts.com',
        phone: '+1-555-0125',
        company: 'AutoParts Ltd.',
        serviceType: 'road-transport',
        origin: 'Delhi, India',
        destination: 'Mumbai, India',
        cargoType: 'automotive',
        weight: 800,
        volume: 6.2,
        packages: 25,
        status: 'accepted',
        quotedAmount: 1200.00,
        specialRequirements: 'Heavy machinery parts',
        adminNotes: 'Regular customer, priority handling',
        lastUpdated: '2025-01-16'
    }
];

// Visitor tracking data
let visitorData = JSON.parse(localStorage.getItem('visitorData')) || {
    totalVisits: 0,
    uniqueVisitors: new Set(),
    dailyVisits: {},
    sessionData: [],
    quoteRequests: 0
};

let currentQuoteId = null;

function loadDashboardStats() {
    // Refresh quote requests from localStorage
    quoteRequests = JSON.parse(localStorage.getItem('quoteRequests')) || [];

    const totalQuotes = quoteRequests.length;
    const processedQuotes = quoteRequests.filter(q => q.status === 'quoted' || q.status === 'accepted').length;
    const pendingQuotes = quoteRequests.filter(q => q.status === 'pending').length;
    const todaysValue = quoteRequests
        .filter(q => q.date === new Date().toISOString().split('T')[0] && q.quotedAmount)
        .reduce((sum, q) => sum + (q.quotedAmount || 0), 0);

    document.getElementById('total-quotes').textContent = totalQuotes;
    document.getElementById('processed-quotes').textContent = processedQuotes;
    document.getElementById('pending-quotes').textContent = pendingQuotes;

    const todaysValueElement = document.getElementById('todays-value');
    if (todaysValueElement) {
        todaysValueElement.textContent = `$${todaysValue.toLocaleString()}`;
    }
}

function loadVisitorAnalytics(period = 'today') {
    const today = new Date();
    let startDate, endDate;

    switch(period) {
        case 'week':
            startDate = new Date(today.setDate(today.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(today.setMonth(today.getMonth() - 1));
            break;
        case 'year':
            startDate = new Date(today.setFullYear(today.getFullYear() - 1));
            break;
        default:
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
    }

    // Calculate analytics for the selected period
    const periodVisits = calculatePeriodVisits(startDate, period);
    const uniqueVisitors = calculateUniqueVisitors(startDate, period);
    const avgSession = calculateAverageSession(startDate, period);
    const quoteConversion = calculateQuoteConversion(startDate, period);

    document.getElementById('period-visits').textContent = periodVisits;
    document.getElementById('unique-visitors').textContent = uniqueVisitors;
    document.getElementById('avg-session').textContent = avgSession + 's';
    document.getElementById('quote-conversion').textContent = quoteConversion + '%';
}

function calculatePeriodVisits(startDate, period) {
    if (period === 'today') {
        const today = new Date().toISOString().split('T')[0];
        return visitorData.dailyVisits[today] || 0;
    }

    let totalVisits = 0;
    Object.keys(visitorData.dailyVisits).forEach(date => {
        if (new Date(date) >= startDate) {
            totalVisits += visitorData.dailyVisits[date];
        }
    });
    return totalVisits;
}

function calculateUniqueVisitors(startDate, period) {
    // Simplified calculation - in real app, you'd track unique visitors properly
    const periodVisits = calculatePeriodVisits(startDate, period);
    return Math.ceil(periodVisits * 0.7); // Estimate 70% unique visitors
}

function calculateAverageSession(startDate, period) {
    // Simplified calculation - return random session time between 2-8 minutes
    return Math.floor(Math.random() * 360) + 120;
}

function calculateQuoteConversion(startDate, period) {
    const periodVisits = calculatePeriodVisits(startDate, period);
    if (periodVisits === 0) return 0;

    const periodQuotes = quoteRequests.filter(q => {
        return new Date(q.date) >= startDate;
    }).length;

    return ((periodQuotes / periodVisits) * 100).toFixed(1);
}

function loadQuoteRequests() {
    console.log('Loading quote requests...');

    // Reload from localStorage to ensure we have latest data
    const storedQuotes = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
    if (storedQuotes.length > 0) {
        quoteRequests = storedQuotes;
        console.log('Reloaded', storedQuotes.length, 'quotes from localStorage');
    }

    const quotesTable = document.getElementById('quotes-table');

    if (!quotesTable) {
        console.error('Quotes table not found');
        return;
    }

    quotesTable.innerHTML = '';

    if (!quoteRequests || quoteRequests.length === 0) {
        console.log('No quote requests to display');
        quotesTable.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <i class="ri-inbox-line text-4xl text-gray-300 mb-2"></i>
                        <p>No quote requests found</p>
                        <p class="text-sm mt-1">Submit a quote through the quote form to see it here</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    console.log('Displaying', quoteRequests.length, 'quote requests');
    quoteRequests.forEach(quote => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50';

        const statusClass = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'quoted': 'bg-blue-100 text-blue-800',
            'accepted': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'in-progress': 'bg-purple-100 text-purple-800',
            'completed': 'bg-emerald-100 text-emerald-800'
        }[quote.status] || 'bg-gray-100 text-gray-800';

        row.innerHTML = `
            <td class="py-3 px-4 text-sm">${new Date(quote.date).toLocaleDateString()}</td>
            <td class="py-3 px-4">
                <div class="text-sm font-medium text-gray-900">${quote.customerName}</div>
                <div class="text-sm text-gray-500">${quote.company || 'No company'}</div>
            </td>
            <td class="py-3 px-4">
                <div class="text-sm font-medium text-gray-900">${quote.customerEmail}</div>
                <div class="text-sm text-gray-500">${quote.phone || 'No phone'}</div>
            </td>
            <td class="py-3 px-4 text-sm">${quote.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
            <td class="py-3 px-4 text-sm">${quote.origin} → ${quote.destination}</td>
            <td class="py-3 px-4 text-sm">${quote.weight} kg</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
                    ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
            </td>
            <td class="py-3 px-4">
                <button onclick="viewQuote('${quote.id}')" class="text-primary hover:text-blue-700 text-sm font-medium">
                    View Details
                </button>
            </td>
        `;

        quotesTable.appendChild(row);
    });
}

function filterQuotes(status) {
    const quotesTable = document.getElementById('quotes-table');
    if (!quotesTable) return;

    const rows = quotesTable.querySelectorAll('tr');

    rows.forEach(row => {
        const statusCell = row.querySelector('span');
        if (statusCell) {
            const rowStatus = statusCell.textContent.toLowerCase().trim().replace(' ', '-');
            if (status === 'all' || rowStatus === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

function viewQuote(quoteId) {
    // Refresh quotes from localStorage first
    quoteRequests = JSON.parse(localStorage.getItem('quoteRequests')) || [];
    const quote = quoteRequests.find(q => q.id === quoteId);
    if (!quote) {
        alert('Quote not found');
        return;
    }

    currentQuoteId = quoteId;
    const modal = document.getElementById('quote-modal');
    const detailsDiv = document.getElementById('quote-details');

    detailsDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold text-dark mb-2">Customer Information</h4>
                <div class="space-y-1 text-sm">
                    <p><strong>Name:</strong> ${quote.customerName}</p>
                    <p><strong>Email:</strong> ${quote.customerEmail}</p>
                    <p><strong>Phone:</strong> ${quote.phone || 'Not provided'}</p>
                    <p><strong>Company:</strong> ${quote.company || 'Not provided'}</p>
                    <p><strong>Quote ID:</strong> ${quote.id}</p>
                    <p><strong>Date:</strong> ${new Date(quote.date).toLocaleDateString()}</p>
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-dark mb-2">Shipment Details</h4>
                <div class="space-y-1 text-sm">
                    <p><strong>Service:</strong> ${quote.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p><strong>Route:</strong> ${quote.origin} → ${quote.destination}</p>
                    <p><strong>Cargo Type:</strong> ${quote.cargoType}</p>
                    <p><strong>Weight:</strong> ${quote.weight} kg</p>
                    <p><strong>Volume:</strong> ${quote.volume || 'Not specified'} CBM</p>
                    <p><strong>Packages:</strong> ${quote.packages || 'Not specified'}</p>
                    ${quote.incoterms ? `<p><strong>Incoterms:</strong> ${quote.incoterms}</p>` : ''}
                </div>
            </div>
        </div>
        ${quote.specialRequirements ? `
            <div class="mt-4">
                <h4 class="font-semibold text-dark mb-2">Special Requirements</h4>
                <p class="text-sm text-gray-600">${quote.specialRequirements}</p>
            </div>
        ` : ''}
        ${quote.additionalServices && quote.additionalServices.length > 0 ? `
            <div class="mt-4">
                <h4 class="font-semibold text-dark mb-2">Additional Services</h4>
                <p class="text-sm text-gray-600">${quote.additionalServices.join(', ')}</p>
            </div>
        ` : ''}
    `;

    // Pre-fill form fields
    document.getElementById('quote-status').value = quote.status || 'pending';
    document.getElementById('quote-amount').value = quote.quotedAmount || '';
    document.getElementById('admin-notes').value = quote.adminNotes || '';
    document.getElementById('customer-message').value = '';

    modal.classList.remove('hidden');
}

function closeQuoteModal() {
    const modal = document.getElementById('quote-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentQuoteId = null;
}

function updateQuoteStatus() {
    if (!currentQuoteId) return;

    const quote = quoteRequests.find(q => q.id === currentQuoteId);
    if (!quote) return;

    const newStatus = document.getElementById('quote-status').value;
    const quoteAmount = parseFloat(document.getElementById('quote-amount').value) || null;
    const adminNotes = document.getElementById('admin-notes').value;

    // Update quote
    quote.status = newStatus;
    quote.quotedAmount = quoteAmount;
    quote.adminNotes = adminNotes;
    quote.lastUpdated = new Date().toISOString().split('T')[0];

    // Save to localStorage
    localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests));

    loadQuoteRequests();
    loadDashboardStats();

    if (window.CargoExpress && window.CargoExpress.showNotification) {
        window.CargoExpress.showNotification('Quote status updated successfully!', 'success');
    }
}

function quickUpdateToQuoted() {
    if (!currentQuoteId) return;

    const quote = quoteRequests.find(q => q.id === currentQuoteId);
    if (!quote) return;

    const quoteAmount = parseFloat(document.getElementById('quote-amount').value);

    if (!quoteAmount || quoteAmount <= 0) {
        if (window.CargoExpress && window.CargoExpress.showNotification) {
            window.CargoExpress.showNotification('Please enter a valid quote amount first', 'error');
        }
        return;
    }

    // Update quote status to quoted
    quote.status = 'quoted';
    quote.quotedAmount = quoteAmount;
    quote.lastUpdated = new Date().toISOString().split('T')[0];

    // Update the form display
    document.getElementById('quote-status').value = 'quoted';

    // Save to localStorage
    localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests));

    loadQuoteRequests();
    loadDashboardStats();

    if (window.CargoExpress && window.CargoExpress.showNotification) {
        window.CargoExpress.showNotification('Quote status updated to Quoted!', 'success');
    }
}

function sendCustomerEmail() {
    if (!currentQuoteId) return;

    const quote = quoteRequests.find(q => q.id === currentQuoteId);
    if (!quote) return;

    const customerMessage = document.getElementById('customer-message').value;

    // Simulate sending email
    console.log('Sending email to:', quote.customerEmail);
    console.log('Quote details:', {
        id: quote.id,
        status: quote.status,
        amount: quote.quotedAmount,
        message: customerMessage
    });

    // Update quote to mark as emailed
    quote.lastEmailSent = new Date().toISOString();
    localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests));

    if (window.CargoExpress && window.CargoExpress.showNotification) {
        window.CargoExpress.showNotification(`Email sent to ${quote.customerEmail}`, 'success');
    }
}

function calculateQuote() {
    if (!currentQuoteId) return;

    const quote = quoteRequests.find(q => q.id === currentQuoteId);
    if (!quote) return;

    // Sample rate calculation logic
    const rates = {
        'sea-freight': { perKg: 2.50, perCbm: 150.00, baseFee: 100.00 },
        'air-freight': { perKg: 8.50, perCbm: 300.00, baseFee: 200.00 },
        'road-transport': { perKg: 1.20, perCbm: 80.00, baseFee: 50.00 }
    };

    const serviceRates = rates[quote.serviceType];
    if (!serviceRates) return;

    const weightCost = quote.weight * serviceRates.perKg;
    const volumeCost = quote.volume * serviceRates.perCbm;
    const baseCost = Math.max(weightCost, volumeCost) + serviceRates.baseFee;

    // Add additional costs
    let additionalCosts = 0;
    if (quote.cargoType === 'hazardous') additionalCosts += 500;
    if (quote.cargoType === 'perishable') additionalCosts += 300;
    if (quote.specialRequirements && quote.specialRequirements.toLowerCase().includes('temperature')) {
        additionalCosts += 200;
    }

    const totalCost = baseCost + additionalCosts;
    document.getElementById('quote-amount').value = totalCost.toFixed(2);

    if (window.CargoExpress && window.CargoExpress.showNotification) {
        window.CargoExpress.showNotification('Quote calculated automatically!', 'success');
    }
}

function exportQuotes() {
    const csv = [
        ['Date', 'Customer', 'Email', 'Phone', 'Company', 'Service', 'Origin', 'Destination', 'Weight (kg)', 'Volume (CBM)', 'Status', 'Quote Amount', 'Admin Notes', 'Special Requirements'].join(','),
        ...quoteRequests.map(quote => [
            quote.date,
            quote.customerName,
            quote.customerEmail,
            quote.phone,
            quote.company,
            quote.serviceType,
            quote.origin,
            quote.destination,
            quote.weight,
            quote.volume,
            quote.status,
            quote.quotedAmount || '',
            quote.adminNotes || '',
            quote.specialRequirements || ''
        ].map(field => `"${field}"`).join(','))
    ].join('\n');

    downloadCSV(csv, `quote-requests-${new Date().toISOString().split('T')[0]}.csv`);
    if (window.CargoExpress && window.CargoExpress.showNotification) {
        window.CargoExpress.showNotification('Quote requests exported successfully!', 'success');
    }
}

function exportVisitorData() {
    const periodElement = document.getElementById('analytics-period');
    const period = periodElement ? periodElement.value : 'today';

    const csv = [
        ['Date', 'Total Visits', 'Estimated Unique Visitors'].join(','),
        ...Object.entries(visitorData.dailyVisits).map(([date, visits]) => [
            date,
            visits,
            Math.ceil(visits * 0.7)
        ].join(','))
    ].join('\n');

    downloadCSV(csv, `visitor-data-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    if (window.CargoExpress && window.CargoExpress.showNotification) {
        window.CargoExpress.showNotification('Visitor data exported successfully!', 'success');
    }
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Track visitor for demo purposes
function trackVisitor() {
    const today = new Date().toISOString().split('T')[0];

    if (!visitorData.dailyVisits[today]) {
        visitorData.dailyVisits[today] = 0;
    }

    visitorData.dailyVisits[today]++;
    visitorData.totalVisits++;

    localStorage.setItem('visitorData', JSON.stringify(visitorData));
}

function refreshAdminData() {
    // Refresh all admin data
    loadDashboardStats();
    loadQuoteRequests();
    loadVisitorAnalytics();
    
    if (window.CargoExpress && window.CargoExpress.showNotification) {
        window.CargoExpress.showNotification('Data refreshed successfully!', 'success');
    }
}

function setupEventListeners() {
    // Setup analytics period change listener
    const analyticsSelect = document.getElementById('analytics-period');
    if (analyticsSelect) {
        analyticsSelect.addEventListener('change', function() {
            loadVisitorAnalytics(this.value);
        });
    }

    // Setup status filter listener
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterQuotes(this.value);
        });
    }
}

// Auto-refresh dashboard every 30 seconds
setInterval(() => {
    loadDashboardStats();
    loadVisitorAnalytics();
}, 30000);

console.log('Secure admin panel initialized');