// Email notification service using EmailJS
class EmailNotificationService {
    constructor() {
        this.serviceId = "service_od4g4sj"; // Replace with your EmailJS service ID
        this.templateId = "template_aff5foc"; // Replace with your EmailJS template ID
        this.publicKey = "Iyvq2x6DFpVbQ0KyF"; // Replace with your EmailJS public key
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Check if EmailJS is already loaded
            if (typeof emailjs !== 'undefined') {
                emailjs.init(this.publicKey);
                this.isInitialized = true;
                console.log("EmailJS initialized successfully");
                return;
            }
            
            // Load EmailJS library
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
            script.onload = () => {
                if (typeof emailjs !== 'undefined') {
                    emailjs.init(this.publicKey);
                    this.isInitialized = true;
                    console.log("EmailJS initialized successfully");
                } else {
                    console.error("EmailJS failed to load");
                }
            };
            script.onerror = () => {
                console.error("Failed to load EmailJS script");
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error("Failed to initialize EmailJS:", error);
        }
    }

    async sendContactNotification(formData) {
        if (!this.isInitialized) {
            console.error("EmailJS not initialized");
            return false;
        }

        const templateParams = {
            to_email: "ffnav26@gmail.com", // Replace with your email
            from_name: `${formData.firstName} ${formData.lastName}`,
            from_email: formData.email,
            phone: formData.phone || "Not provided",
            company: formData.company || "Not provided",
            service: formData.service || "Not specified",
            subject: formData.subject,
            message: formData.message,
            submission_type: "Contact Form",
            submission_date: new Date().toLocaleString(),
        };

        try {
            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams,
            );
            console.log("Contact notification sent successfully:", response);
            return true;
        } catch (error) {
            console.error("Failed to send contact notification:", error);
            return false;
        }
    }

    async sendQuoteNotification(quoteData) {
        if (!this.isInitialized) {
            console.error("EmailJS not initialized");
            return false;
        }

        if (typeof emailjs === 'undefined') {
            console.error("EmailJS library not available");
            return false;
        }

        const templateParams = {
            to_email: "ffnav26@gmail.com", // Using the same email as contact notifications
            from_name: quoteData.customerName,
            from_email: quoteData.customerEmail,
            phone: quoteData.phone || "Not provided",
            company: quoteData.company || "Not provided",
            quote_id: quoteData.id,
            service_type: quoteData.serviceType,
            origin: quoteData.origin,
            destination: quoteData.destination,
            cargo_type: quoteData.cargoType,
            weight: quoteData.weight,
            volume: quoteData.volume || "Not specified",
            packages: quoteData.packages || "Not specified",
            ready_date: quoteData.readyDate,
            delivery_date: quoteData.deliveryDate || "Not specified",
            special_requirements: quoteData.specialRequirements || "None",
            submission_type: "Quote Request",
            submission_date: new Date().toLocaleString(),
        };

        try {
            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams,
            );
            console.log("Quote notification sent successfully:", response);
            return true;
        } catch (error) {
            console.error("Failed to send quote notification:", error);
            return false;
        }
    }
}

// Create global instance with retry mechanism
try {
    window.emailNotificationService = new EmailNotificationService();
} catch (error) {
    console.error('Failed to initialize email notification service:', error);
    // Create a fallback service that logs but doesn't crash
    window.emailNotificationService = {
        isInitialized: false,
        sendContactNotification: () => Promise.resolve(false),
        sendQuoteNotification: () => Promise.resolve(false)
    };
}
