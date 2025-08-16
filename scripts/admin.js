// Admin panel functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin panel
    loadDashboardStats();
    loadCurrentRates();
    loadQuoteRequests();

    // Rate form submission
    const rateForm = document.getElementById('rate-form');
    if (rateForm) {
        rateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateRates();
        });
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterQuotes(this.value);
        });
    }
});

// Sample data - In a real application, this would come from a database
let rates = {
    'sea-freight': { perKg: 2.50, perCbm: 150.00, baseFee: 100.00 },
    'air-freight': { perKg: 8.50, perCbm: 300.00, baseFee: 200.00 },
    'road-transport': { perKg: 1.20, perCbm: 80.00, baseFee: 50.00 }
};

let quoteRequests = [
    {
        id: 'QR2025001',
        date: '2025-01-18',
        customerName: 'John Smith',
        customerEmail: 'john.smith@example.com',
        company: 'ABC Trading Co.',
        serviceType: 'sea-freight',
        origin: 'Mumbai, India',
        destination: 'New York, USA',
        cargoType: 'general',
        weight: 1500,
        volume: 12.5,
        packages: 50,
        status: 'pending',
        specialRequirements: 'Temperature controlled shipping required'
    },
    {
        id: 'QR2025002',
        date: '2025-01-17',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@techcorp.com',
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
        specialRequirements: 'Fragile electronics, requires careful handling'
    },
    {
        id: 'QR2025003',
        date: '2025-01-16',
        customerName: 'Mike Wilson',
        customerEmail: 'mike@autoparts.com',
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
        specialRequirements: 'Heavy machinery parts'
    }
];

let currentQuoteId = null;

function loadDashboardStats() {
    const totalQuotes = quoteRequests.length;
    const processedQuotes = quoteRequests.filter(q => q.status === 'quoted' || q.status === 'accepted').length;
    const pendingQuotes = quoteRequests.filter(q => q.status === 'pending').length;
    const todaysValue = quoteRequests
        .filter(q => q.date === new Date().toISOString().split('T')[0] && q.quotedAmount)
        .reduce((sum, q) => sum + (q.quotedAmount || 0), 0);

    document.getElementById('total-quotes').textContent = totalQuotes;
    document.getElementById('processed-quotes').textContent = processedQuotes;
    document.getElementById('pending-quotes').textContent = pendingQuotes;
    document.getElementById('todays-value').textContent = `$${todaysValue.toLocaleString()}`;
}

function loadCurrentRates() {
    const currentRatesDiv = document.getElementById('current-rates');
    currentRatesDiv.innerHTML = '';

    Object.entries(rates).forEach(([service, rate]) => {
        const serviceName = service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const rateDiv = document.createElement('div');
        rateDiv.className = 'p-3 bg-gray-50 rounded-lg';
        rateDiv.innerHTML = `
            <h4 class="font-semibold text-dark">${serviceName}</h4>
            <p class="text-sm text-gray-600">Per KG: $${rate.perKg}</p>
            <p class="text-sm text-gray-600">Per CBM: $${rate.perCbm}</p>
            <p class="text-sm text-gray-600">Base Fee: $${rate.baseFee}</p>
        `;
        currentRatesDiv.appendChild(rateDiv);
    });
}

function updateRates() {
    const serviceType = document.getElementById('service-type').value;
    const perKg = parseFloat(document.getElementById('rate-per-kg').value);
    const perCbm = parseFloat(document.getElementById('rate-per-cbm').value);
    const baseFee = parseFloat(document.getElementById('base-fee').value);

    if (isNaN(perKg) || isNaN(perCbm) || isNaN(baseFee)) {
        window.CargoExpress.showNotification('Please enter valid numeric values', 'error');
        return;
    }

    rates[serviceType] = { perKg, perCbm, baseFee };
    loadCurrentRates();
    window.CargoExpress.showNotification('Rates updated successfully!', 'success');

    // Clear form
    document.getElementById('rate-form').reset();
}

function loadQuoteRequests() {
    const quotesTable = document.getElementById('quotes-table');
    quotesTable.innerHTML = '';

    quoteRequests.forEach(quote => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50';

        const statusClass = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'quoted': 'bg-blue-100 text-blue-800',
            'accepted': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800'
        }[quote.status] || 'bg-gray-100 text-gray-800';

        row.innerHTML = `
            <td class="py-3 px-4 text-sm">${new Date(quote.date).toLocaleDateString()}</td>
            <td class="py-3 px-4">
                <div class="text-sm font-medium text-gray-900">${quote.customerName}</div>
                <div class="text-sm text-gray-500">${quote.company}</div>
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
    const rows = quotesTable.querySelectorAll('tr');

    rows.forEach(row => {
        const statusCell = row.querySelector('span');
        if (statusCell) {
            const rowStatus = statusCell.textContent.toLowerCase().trim();
            if (status === 'all' || rowStatus === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

function viewQuote(quoteId) {
    const quote = quoteRequests.find(q => q.id === quoteId);
    if (!quote) return;

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
                    <p><strong>Company:</strong> ${quote.company}</p>
                    <p><strong>Quote ID:</strong> ${quote.id}</p>
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-dark mb-2">Shipment Details</h4>
                <div class="space-y-1 text-sm">
                    <p><strong>Service:</strong> ${quote.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p><strong>Route:</strong> ${quote.origin} → ${quote.destination}</p>
                    <p><strong>Cargo Type:</strong> ${quote.cargoType}</p>
                    <p><strong>Weight:</strong> ${quote.weight} kg</p>
                    <p><strong>Volume:</strong> ${quote.volume} CBM</p>
                    <p><strong>Packages:</strong> ${quote.packages}</p>
                </div>
            </div>
        </div>
        ${quote.specialRequirements ? `
            <div class="mt-4">
                <h4 class="font-semibold text-dark mb-2">Special Requirements</h4>
                <p class="text-sm text-gray-600">${quote.specialRequirements}</p>
            </div>
        ` : ''}
    `;

    // Pre-fill quote amount if already quoted
    document.getElementById('quote-amount').value = quote.quotedAmount || '';
    document.getElementById('quote-notes').value = quote.notes || '';

    modal.classList.remove('hidden');
}

function closeQuoteModal() {
    document.getElementById('quote-modal').classList.add('hidden');
    currentQuoteId = null;
}

function calculateQuote() {
    if (!currentQuoteId) return;

    const quote = quoteRequests.find(q => q.id === currentQuoteId);
    if (!quote) return;

    const serviceRates = rates[quote.serviceType];
    if (!serviceRates) return;

    // Calculate based on weight and volume (use higher value)
    const weightCost = quote.weight * serviceRates.perKg;
    const volumeCost = quote.volume * serviceRates.perCbm;
    const baseCost = Math.max(weightCost, volumeCost) + serviceRates.baseFee;

    // Add additional services costs (simplified)
    let additionalCosts = 0;
    if (quote.cargoType === 'hazardous') additionalCosts += 500;
    if (quote.cargoType === 'perishable') additionalCosts += 300;
    if (quote.specialRequirements && quote.specialRequirements.toLowerCase().includes('temperature')) {
        additionalCosts += 200;
    }

    const totalCost = baseCost + additionalCosts;
    document.getElementById('quote-amount').value = totalCost.toFixed(2);

    window.CargoExpress.showNotification('Quote calculated automatically!', 'success');
}

function sendQuote() {
    if (!currentQuoteId) return;

    const quoteAmount = parseFloat(document.getElementById('quote-amount').value);
    const notes = document.getElementById('quote-notes').value;

    if (isNaN(quoteAmount) || quoteAmount <= 0) {
        window.CargoExpress.showNotification('Please enter a valid quote amount', 'error');
        return;
    }

    const quote = quoteRequests.find(q => q.id === currentQuoteId);
    if (quote) {
        quote.status = 'quoted';
        quote.quotedAmount = quoteAmount;
        quote.notes = notes;
        quote.quotedDate = new Date().toISOString();

        // Simulate sending email
        sendQuoteEmail(quote);

        loadQuoteRequests();
        loadDashboardStats();
        closeQuoteModal();

        window.CargoExpress.showNotification('Quote sent successfully!', 'success');
    }
}

function rejectQuote() {
    if (!currentQuoteId) return;

    const quote = quoteRequests.find(q => q.id === currentQuoteId);
    if (quote) {
        quote.status = 'rejected';
        quote.rejectedDate = new Date().toISOString();

        loadQuoteRequests();
        loadDashboardStats();
        closeQuoteModal();

        window.CargoExpress.showNotification('Quote rejected', 'success');
    }
}

function sendQuoteEmail(quote) {
    // Simulate email sending - In a real application, this would make an API call to send email
    console.log('Sending quote email to:', quote.customerEmail);
    console.log('Quote details:', {
        id: quote.id,
        amount: quote.quotedAmount,
        customerName: quote.customerName,
        serviceType: quote.serviceType,
        route: `${quote.origin} → ${quote.destination}`
    });

    // Email template would be something like:
    const emailTemplate = `
        Dear ${quote.customerName},

        Thank you for your interest in Cargo Express Logistics.

        We are pleased to provide you with a quote for your shipment:

        Quote ID: ${quote.id}
        Service: ${quote.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        Route: ${quote.origin} → ${quote.destination}
        Quote Amount: $${quote.quotedAmount}

        ${quote.notes ? 'Additional Notes: ' + quote.notes : ''}

        This quote is valid for 30 days from the date of issue.

        Best regards,
        Cargo Express Logistics Team
    `;

    // In a real application, you would use a service like SendGrid, Mailgun, or AWS SES
    window.CargoExpress.showNotification(`Email sent to ${quote.customerEmail}`, 'success');
}

function exportQuotes() {
    const csv = [
        ['Date', 'Customer', 'Email', 'Company', 'Service', 'Origin', 'Destination', 'Weight (kg)', 'Volume (CBM)', 'Status', 'Quote Amount', 'Special Requirements'].join(','),
        ...quoteRequests.map(quote => [
            quote.date,
            quote.customerName,
            quote.customerEmail,
            quote.company,
            quote.serviceType,
            quote.origin,
            quote.destination,
            quote.weight,
            quote.volume,
            quote.status,
            quote.quotedAmount || '',
            quote.specialRequirements || ''
        ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-requests-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.CargoExpress.showNotification('Quote requests exported successfully!', 'success');
}

// Auto-refresh dashboard every 30 seconds
setInterval(() => {
    loadDashboardStats();
}, 30000);

console.log('Admin panel initialized');