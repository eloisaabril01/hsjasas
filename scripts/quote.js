
// Quote form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Wait for page to fully load before initializing
    setTimeout(() => {
        const quoteForm = document.getElementById('quote-form');
        
        if (quoteForm) {
            // Initialize form with progressive validation
            initializeProgressiveForm();
            
            quoteForm.addEventListener('submit', function(e) {
                e.preventDefault();
                submitQuoteRequest();
            });

            // Add event listeners to remove error styling when user starts typing/selecting
            const inputFields = quoteForm.querySelectorAll('input, select, textarea');
            inputFields.forEach(field => {
                field.addEventListener('input', function() {
                    this.classList.remove('border-red-500', 'text-red-500');
                });
                field.addEventListener('change', function() {
                    this.classList.remove('border-red-500', 'text-red-500');
                });
            });

            console.log('Quote form initialized successfully');
        } else {
            console.warn('Quote form not found on this page');
        }
    }, 500);
});

function initializeProgressiveForm() {
    // Disable all form sections except service type initially
    disableFormSections(['contact-info', 'shipment-details', 'cargo-specs', 'additional-services']);
    
    // Add service type change listener
    const serviceTypeRadios = document.querySelectorAll('input[name="service-type"]');
    serviceTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                // Clear service type errors
                document.querySelectorAll('input[name="service-type"]').forEach(r => {
                    const label = r.closest('label');
                    if (label) {
                        label.classList.remove('border-red-500');
                        label.classList.add('border-primary', 'bg-primary/5');
                    }
                });
                
                // Enable contact information section
                enableFormSection('contact-info');
                
                // Scroll to next section smoothly
                setTimeout(() => {
                    const contactSection = document.querySelector('[data-section="contact-info"]');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
                
                // Show notification
                if (window.CargoExpress && window.CargoExpress.showNotification) {
                    window.CargoExpress.showNotification('✓ Service type selected! Please fill in your contact information to continue.', 'success');
                }
            }
        });
    });
    
    // Add progressive validation for contact info
    const contactInputs = ['contact-name', 'contact-email'];
    contactInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', function() {
                validateContactField(this);
            });
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    checkContactCompletion();
                }
            });
        }
    });
}

function disableFormSections(sections) {
    sections.forEach(sectionName => {
        const section = document.querySelector(`[data-section="${sectionName}"]`) || 
                       document.querySelector(`h3:contains("${getSectionTitle(sectionName)}")`);
        if (section) {
            const sectionElement = section.closest('div') || section.parentElement;
            sectionElement.style.opacity = '0.5';
            sectionElement.style.pointerEvents = 'none';
            
            // Disable all inputs in this section
            const inputs = sectionElement.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.disabled = true;
            });
        }
    });
}

function enableFormSection(sectionName) {
    const section = document.querySelector(`[data-section="${sectionName}"]`) || 
                   document.querySelector(`h3:contains("${getSectionTitle(sectionName)}")`);
    if (section) {
        const sectionElement = section.closest('div') || section.parentElement;
        sectionElement.style.opacity = '1';
        sectionElement.style.pointerEvents = 'auto';
        
        // Enable all inputs in this section
        const inputs = sectionElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = false;
        });
        
        // Add visual indicator
        const heading = sectionElement.querySelector('h3');
        if (heading) {
            heading.classList.add('text-primary');
        }
    }
}

function getSectionTitle(sectionName) {
    const titles = {
        'contact-info': 'Contact Information',
        'shipment-details': 'Shipment Details',
        'cargo-specs': 'Cargo Specifications',
        'additional-services': 'Additional Services'
    };
    return titles[sectionName] || sectionName;
}

function validateContactField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    if (field.id === 'contact-name') {
        if (!value) {
            isValid = false;
            errorMessage = 'Full name is required';
        } else if (value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters';
        }
    }
    
    if (field.id === 'contact-email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            isValid = false;
            errorMessage = 'Email address is required';
        } else if (!emailPattern.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Show/hide error styling
    if (!isValid) {
        field.classList.add('border-red-500');
        showFieldError(field, errorMessage);
    } else {
        field.classList.remove('border-red-500');
        field.classList.add('border-green-500');
        hideFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    // Remove existing error
    hideFieldError(field);
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
    errorDiv.textContent = message;
    
    // Insert after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

function hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function checkContactCompletion() {
    const nameField = document.getElementById('contact-name');
    const emailField = document.getElementById('contact-email');
    
    const nameValid = nameField && nameField.value.trim().length >= 2;
    const emailValid = emailField && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim());
    
    if (nameValid && emailValid) {
        // Enable shipment details section
        enableFormSection('shipment-details');
        
        // Add completion listeners for shipment details
        addShipmentValidation();
        
        if (window.CargoExpress && window.CargoExpress.showNotification) {
            window.CargoExpress.showNotification('✓ Contact details verified! Now select your shipment origin and destination.', 'success');
        }
    }
}

function addShipmentValidation() {
    const shipmentFields = ['origin', 'destination', 'cargo-type'];
    let completedFields = 0;
    
    shipmentFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.dataset.listenerAdded) {
            field.addEventListener('change', function() {
                if (this.value) {
                    completedFields++;
                    this.classList.add('border-green-500');
                    
                    if (completedFields >= 3) {
                        enableFormSection('cargo-specs');
                        addCargoValidation();
                        
                        if (window.CargoExpress && window.CargoExpress.showNotification) {
                            window.CargoExpress.showNotification('✓ Shipment route confirmed! Please provide your cargo specifications.', 'success');
                        }
                    }
                } else {
                    this.classList.remove('border-green-500');
                    completedFields = Math.max(0, completedFields - 1);
                }
            });
            field.dataset.listenerAdded = 'true';
        }
    });
}

function addCargoValidation() {
    const weightField = document.getElementById('weight');
    if (weightField && !weightField.dataset.listenerAdded) {
        weightField.addEventListener('blur', function() {
            const weight = parseFloat(this.value);
            if (weight && weight > 0) {
                this.classList.add('border-green-500');
                enableFormSection('additional-services');
                
                if (window.CargoExpress && window.CargoExpress.showNotification) {
                    window.CargoExpress.showNotification('✓ Cargo details added! You can now submit your quote request to receive pricing within 24 hours.', 'success');
                }
            } else {
                this.classList.remove('border-green-500');
            }
        });
        weightField.dataset.listenerAdded = 'true';
    }
}

async function submitQuoteRequest() {
    // Check if we're on the quote page
    const quoteForm = document.getElementById('quote-form');
    if (!quoteForm) {
        console.error('Quote form not found');
        return;
    }

    // Clear any previous error styling
    document.querySelectorAll('.border-red-500, .text-red-500').forEach(el => {
        el.classList.remove('border-red-500', 'text-red-500');
    });

    // Collect form data with null checks
    const serviceTypeElement = document.querySelector('input[name="service-type"]:checked');
    const formData = {
        // Service type
        serviceType: serviceTypeElement ? serviceTypeElement.value : '',
        
        // Contact information
        customerName: document.getElementById('contact-name')?.value.trim() || '',
        customerEmail: document.getElementById('contact-email')?.value.trim() || '',
        phone: document.getElementById('contact-phone')?.value.trim() || '',
        company: document.getElementById('contact-company')?.value.trim() || '',
        
        // Shipment details
        origin: document.getElementById('origin')?.value.trim() || '',
        destination: document.getElementById('destination')?.value.trim() || '',
        cargoType: document.getElementById('cargo-type')?.value || '',
        incoterms: document.getElementById('incoterms')?.value || '',
        
        // Cargo specifications
        weight: parseFloat(document.getElementById('weight')?.value || '0'),
        volume: parseFloat(document.getElementById('volume')?.value || '0') || 0,
        packages: parseInt(document.getElementById('packages')?.value || '0') || 0,
        length: parseFloat(document.getElementById('length')?.value || '0') || 0,
        width: parseFloat(document.getElementById('width')?.value || '0') || 0,
        height: parseFloat(document.getElementById('height')?.value || '0') || 0,
        
        // Additional services
        additionalServices: Array.from(document.querySelectorAll('input[name="additional-services"]:checked')).map(cb => cb.value),
        
        // Special requirements
        specialRequirements: document.getElementById('special-requirements')?.value.trim() || '',
        
        // Consent
        termsAccepted: document.getElementById('terms')?.checked || false,
        marketingConsent: document.getElementById('marketing')?.checked || false
    };

    // Enhanced validation with specific error highlighting
    let validationErrors = [];
    let firstErrorField = null;

    // Service type validation (must be first)
    if (!formData.serviceType) {
        validationErrors.push('Please select a service type');
        const serviceLabels = document.querySelectorAll('input[name="service-type"]');
        serviceLabels.forEach(radio => {
            const label = radio.closest('label');
            if (label) {
                label.classList.add('border-red-500');
                if (!firstErrorField) {
                    firstErrorField = label;
                }
            }
        });
    }

    // Name validation
    if (!formData.customerName) {
        validationErrors.push('Full name is required');
        const nameField = document.getElementById('contact-name');
        nameField?.classList.add('border-red-500');
        if (!firstErrorField) firstErrorField = nameField;
    }

    // Email validation
    if (!formData.customerEmail) {
        validationErrors.push('Email address is required');
        const emailField = document.getElementById('contact-email');
        emailField?.classList.add('border-red-500');
        if (!firstErrorField) firstErrorField = emailField;
    } else {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.customerEmail)) {
            validationErrors.push('Please enter a valid email address');
            const emailField = document.getElementById('contact-email');
            emailField?.classList.add('border-red-500');
            if (!firstErrorField) firstErrorField = emailField;
        }
    }

    // Origin validation with service type compatibility
    if (!formData.origin) {
        validationErrors.push('Please select an origin port');
        const originField = document.getElementById('origin');
        originField?.classList.add('border-red-500');
        if (!firstErrorField) firstErrorField = originField;
    } else {
        // Validate origin is compatible with service type
        const originCompatibility = validatePortCompatibility(formData.origin, formData.serviceType);
        if (!originCompatibility.isValid) {
            validationErrors.push(`Selected origin port may not be suitable for ${formData.serviceType.replace('-', ' ')}. ${originCompatibility.message}`);
            const originField = document.getElementById('origin');
            originField?.classList.add('border-red-500');
            if (!firstErrorField) firstErrorField = originField;
        }
    }

    // Destination validation with service type compatibility
    if (!formData.destination) {
        validationErrors.push('Please select a destination port');
        const destinationField = document.getElementById('destination');
        destinationField?.classList.add('border-red-500');
        if (!firstErrorField) firstErrorField = destinationField;
    } else {
        // Validate destination is compatible with service type
        const destCompatibility = validatePortCompatibility(formData.destination, formData.serviceType);
        if (!destCompatibility.isValid) {
            validationErrors.push(`Selected destination port may not be suitable for ${formData.serviceType.replace('-', ' ')}. ${destCompatibility.message}`);
            const destinationField = document.getElementById('destination');
            destinationField?.classList.add('border-red-500');
            if (!firstErrorField) firstErrorField = destinationField;
        }
    }

    // Check for same origin and destination
    if (formData.origin && formData.destination && formData.origin === formData.destination) {
        validationErrors.push('Origin and destination cannot be the same');
        const destinationField = document.getElementById('destination');
        destinationField?.classList.add('border-red-500');
        if (!firstErrorField) firstErrorField = destinationField;
    }

    // Cargo type validation
    if (!formData.cargoType) {
        validationErrors.push('Cargo type is required');
        const cargoField = document.getElementById('cargo-type');
        cargoField?.classList.add('border-red-500');
        if (!firstErrorField) firstErrorField = cargoField;
    }

    // Weight validation
    if (!formData.weight || formData.weight <= 0) {
        validationErrors.push('Valid weight is required');
        const weightField = document.getElementById('weight');
        weightField?.classList.add('border-red-500');
        if (!firstErrorField) firstErrorField = weightField;
    }

    // Terms validation
    if (!formData.termsAccepted) {
        validationErrors.push('Please accept the terms and conditions');
        const termsField = document.getElementById('terms');
        termsField?.classList.add('border-red-500');
        if (!firstErrorField) firstErrorField = termsField;
    }

    // If there are validation errors, show them and stop
    if (validationErrors.length > 0) {
        // Show specific error message
        if (window.CargoExpress && window.CargoExpress.showNotification) {
            window.CargoExpress.showNotification(validationErrors[0], 'error');
        } else {
            alert(validationErrors[0]);
        }
        
        // Scroll to first error field
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Focus on the field if it's an input
            if (firstErrorField.tagName === 'INPUT' || firstErrorField.tagName === 'SELECT' || firstErrorField.tagName === 'TEXTAREA') {
                setTimeout(() => firstErrorField.focus(), 100);
            }
        }
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    if (!submitBtn) {
        console.error('Submit button not found');
        return;
    }
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading mr-2"></div>Processing...';
    submitBtn.disabled = true;

    // Calculate volume if dimensions are provided
    if (formData.length && formData.width && formData.height && !formData.volume) {
        formData.volume = (formData.length * formData.width * formData.height) / 1000000; // Convert cm³ to m³
    }

    // Generate quote ID
    const quoteId = 'QR' + new Date().getFullYear() + String(Date.now()).slice(-6);
    formData.id = quoteId;
    formData.date = new Date().toISOString().split('T')[0];
    formData.status = 'pending';
    formData.submittedAt = new Date().toISOString();

    // Send email notification
    try {
        let emailSent = false;
        
        // Check if email service is available
        if (window.emailNotificationService && typeof window.emailNotificationService.sendQuoteNotification === 'function') {
            try {
                emailSent = await window.emailNotificationService.sendQuoteNotification(formData);
            } catch (emailError) {
                console.warn('Email service failed:', emailError);
                emailSent = false;
            }
        }
        
        // Store in localStorage regardless of email status
        const existingQuotes = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
        existingQuotes.push(formData);
        localStorage.setItem('quoteRequests', JSON.stringify(existingQuotes));
        
        // Debug logging
        console.log('Quote saved to localStorage:', formData);
        console.log('Total quotes in storage:', existingQuotes.length);

        // Track quote request in visitor analytics
        let visitorData = JSON.parse(localStorage.getItem('visitorData')) || {
            totalVisits: 0,
            uniqueVisitors: new Set(),
            dailyVisits: {},
            sessionData: [],
            quoteRequests: 0
        };
        
        visitorData.quoteRequests++;
        localStorage.setItem('visitorData', JSON.stringify(visitorData));

        // Show appropriate success message
        const message = emailSent 
            ? 'Quote request submitted successfully! You will receive a confirmation email shortly and our team will provide your detailed quote within 24 hours.'
            : 'Quote request submitted successfully! Our logistics experts will review your request and provide you with a detailed quote within 24 hours via email.';
            
        if (window.CargoExpress && window.CargoExpress.showNotification) {
            window.CargoExpress.showNotification(message, 'success');
        }
        
        // Show quote ID first, then reset form after user acknowledges
        console.log('Showing confirmation modal for quote:', quoteId);
        showQuoteConfirmation(quoteId, () => {
            // Only reset form if user wants to (we'll add a button for this)
            // For now, just clear any error styling
            document.querySelectorAll('.border-red-500').forEach(el => {
                el.classList.remove('border-red-500');
            });
        });
        
        // Debug: Log the stored data
        const allQuotes = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
        console.log('All quotes in storage after submission:', allQuotes);
        
    } catch (error) {
        console.error('Quote submission error:', error);
        if (window.CargoExpress && window.CargoExpress.showNotification) {
            window.CargoExpress.showNotification('An error occurred. Please try again.', 'error');
        }
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function sendConfirmationEmail(quoteData) {
    // Simulate sending confirmation email to customer
    console.log('Sending confirmation email to:', quoteData.customerEmail);
    
    const emailContent = `
        Dear ${quoteData.customerName},
        
        Thank you for your quote request with Cargo Express Logistics.
        
        Your Quote Reference: ${quoteData.id}
        
        Request Details:
        - Service Type: ${quoteData.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        - Route: ${quoteData.origin} → ${quoteData.destination}
        - Cargo Type: ${quoteData.cargoType}
        - Weight: ${quoteData.weight} kg
        - Ready Date: ${quoteData.readyDate}
        
        Our team will review your request and provide you with a detailed quote within 24 hours.
        
        If you have any questions, please don't hesitate to contact us at:
        Phone: +91 79 2658 7890
        Email: info@cargoexpress.com
        
        Best regards,
        Cargo Express Logistics Team
    `;
    
    // In a real application, you would use an email service
    console.log('Customer confirmation email content:', emailContent);
}

function sendAdminNotification(quoteData) {
    // Simulate sending notification email to admin
    console.log('Sending admin notification for new quote request');
    
    const adminEmailContent = `
        New Quote Request Received
        
        Quote ID: ${quoteData.id}
        Customer: ${quoteData.customerName} (${quoteData.customerEmail})
        Company: ${quoteData.company || 'Not provided'}
        
        Service Details:
        - Type: ${quoteData.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        - Route: ${quoteData.origin} → ${quoteData.destination}
        - Cargo: ${quoteData.cargoType}
        - Weight: ${quoteData.weight} kg
        - Volume: ${quoteData.volume} CBM
        - Ready Date: ${quoteData.readyDate}
        
        ${quoteData.specialRequirements ? 'Special Requirements: ' + quoteData.specialRequirements : ''}
        
        Please review and respond via the admin panel.
    `;
    
    // In a real application, this would be sent to admin email addresses
    console.log('Admin notification email content:', adminEmailContent);
}

function showQuoteConfirmation(quoteId, onClose) {
    // Remove any existing modals first
    const existingModal = document.querySelector('.quote-confirmation-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create and show confirmation modal
    const modal = document.createElement('div');
    modal.className = 'quote-confirmation-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full p-6 text-center animate-fade-in">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="ri-check-line text-green-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-heading font-bold text-dark mb-2">Quote Request Submitted!</h3>
            <p class="text-gray-600 mb-4">Your quote reference number is:</p>
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <span class="text-lg font-mono font-bold text-primary">${quoteId}</span>
            </div>
            <p class="text-sm text-gray-600 mb-6">Please save this reference number for your records. Our logistics experts will review your requirements and send you a detailed, competitive quote via email within 24 hours.</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button id="close-confirmation" class="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                    Keep Form Data
                </button>
                <button id="reset-form" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                    Submit Another Quote
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Force modal to be visible
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 10);
    
    // Handle close button click (keep form data)
    document.getElementById('close-confirmation').addEventListener('click', () => {
        modal.remove();
        if (onClose && typeof onClose === 'function') {
            onClose();
        }
    });
    
    // Handle reset form button click
    document.getElementById('reset-form').addEventListener('click', () => {
        modal.remove();
        // Reset the form completely
        const form = document.getElementById('quote-form');
        if (form) {
            form.reset();
        }
        if (onClose && typeof onClose === 'function') {
            onClose();
        }
    });
    
    // Auto-remove after 15 seconds and trigger callback
    setTimeout(() => {
        if (modal.parentElement) {
            modal.remove();
            if (onClose && typeof onClose === 'function') {
                onClose();
            }
        }
    }, 15000);
}

function validatePortCompatibility(portName, serviceType) {
    const airportKeywords = ['AIRPORT', 'Airport', 'airport'];
    const seaportKeywords = ['PORT', 'Port', 'port', 'SHEVA', 'MUNDRA', 'KANDLA', 'HAZIRA'];
    
    const isAirport = airportKeywords.some(keyword => portName.includes(keyword));
    const isSeaport = seaportKeywords.some(keyword => portName.includes(keyword));
    
    switch (serviceType) {
        case 'air-freight':
            if (isSeaport && !isAirport) {
                return {
                    isValid: false,
                    message: 'This appears to be a sea port. Please select an airport for air freight.'
                };
            }
            break;
        case 'sea-freight':
            if (isAirport && !isSeaport) {
                return {
                    isValid: false,
                    message: 'This appears to be an airport. Please select a sea port for sea freight.'
                };
            }
            break;
        case 'road-transport':
            // Road transport can use various types of locations
            break;
    }
    
    return { isValid: true, message: '' };
}

function addSmartPortFiltering() {
    const serviceTypeRadios = document.querySelectorAll('input[name="service-type"]');
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');
    
    serviceTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                filterPortOptions(originSelect, this.value);
                filterPortOptions(destinationSelect, this.value);
                
                // Add helpful text
                updatePortSelectLabels(this.value);
            }
        });
    });
}

function filterPortOptions(selectElement, serviceType) {
    if (!selectElement) return;
    
    const allOptions = Array.from(selectElement.options);
    const filteredOptions = allOptions.filter(option => {
        if (option.value === '') return true; // Keep empty option
        
        const compatibility = validatePortCompatibility(option.value, serviceType);
        return compatibility.isValid;
    });
    
    // Clear and repopulate select
    selectElement.innerHTML = '';
    filteredOptions.forEach(option => {
        selectElement.appendChild(option.cloneNode(true));
    });
}

function updatePortSelectLabels(serviceType) {
    const originLabel = document.querySelector('label[for="origin"]');
    const destinationLabel = document.querySelector('label[for="destination"]');
    
    let labelSuffix = '';
    switch (serviceType) {
        case 'air-freight':
            labelSuffix = ' (Airports) *';
            break;
        case 'sea-freight':
            labelSuffix = ' (Sea Ports) *';
            break;
        case 'road-transport':
            labelSuffix = ' (Cities/Locations) *';
            break;
        default:
            labelSuffix = ' *';
    }
    
    if (originLabel) {
        originLabel.textContent = 'Origin (From)' + labelSuffix;
    }
    if (destinationLabel) {
        destinationLabel.textContent = 'Destination (To)' + labelSuffix;
    }
}

// Initialize smart port filtering when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addSmartPortFiltering();
    }, 600);
});

console.log('Quote form functionality initialized');
