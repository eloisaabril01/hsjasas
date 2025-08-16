
// Contact form functionality with email notifications
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitContactForm();
        });
    }
});

async function submitContactForm() {
    // Collect form data
    const formData = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        company: document.getElementById('company').value,
        service: document.getElementById('service').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        privacyAccepted: document.getElementById('privacy').checked,
        newsletterSubscription: document.getElementById('newsletter').checked
    };

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
        window.CargoExpress.showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (!formData.privacyAccepted) {
        window.CargoExpress.showNotification('Please accept the privacy policy', 'error');
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
        window.CargoExpress.showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading mr-2"></div>Processing...';
    submitBtn.disabled = true;

    try {
        // Send email notification to admin
        const emailSent = await window.emailNotificationService.sendContactNotification(formData);
        
        if (emailSent) {
            // Store in localStorage for admin panel
            const existingContacts = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            const contactSubmission = {
                ...formData,
                id: 'CT' + new Date().getFullYear() + String(Date.now()).slice(-6),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                status: 'new'
            };
            existingContacts.push(contactSubmission);
            localStorage.setItem('contactSubmissions', JSON.stringify(existingContacts));

            // Show success message
            window.CargoExpress.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form
            document.getElementById('contact-form').reset();
        } else {
            window.CargoExpress.showNotification('Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Contact form submission error:', error);
        window.CargoExpress.showNotification('An error occurred. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

console.log('Contact form functionality initialized');
