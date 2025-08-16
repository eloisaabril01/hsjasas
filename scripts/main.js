// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('-translate-x-full');
        });
    }

    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', function() {
            mobileMenu.classList.add('-translate-x-full');
        });
    }

    // Close mobile menu when clicking outside
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                mobileMenu.classList.add('-translate-x-full');
            }
        });
    }

    // Header scroll effect
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('bg-dark/95', 'backdrop-blur-sm');
            } else {
                // Only remove background classes if not on a subpage
                if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
                    header.classList.remove('bg-dark/95', 'backdrop-blur-sm');
                }
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (mobileMenu) {
                    mobileMenu.classList.add('-translate-x-full');
                }
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
        observer.observe(el);
    });

    // Counter animation
    function animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            
            // Format number with commas for large numbers
            if (end >= 1000) {
                element.textContent = currentValue.toLocaleString();
            } else {
                element.textContent = currentValue;
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Animate counters when they come into view
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const countValue = parseInt(counter.getAttribute('data-count') || counter.textContent.replace(/[^\d]/g, ''));
                animateCounter(counter, 0, countValue, 2000);
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(counter => {
        counterObserver.observe(counter);
    });

    // Form validation and submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('border-red-500');
                    
                    // Remove error styling after user starts typing
                    field.addEventListener('input', function() {
                        this.classList.remove('border-red-500');
                    }, { once: true });
                }
            });

            if (isValid) {
                // Show success message
                showNotification('Form submitted successfully! We\'ll get back to you soon.', 'success');
                form.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    });

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Video lazy loading and error handling
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.addEventListener('error', function() {
            console.log('Video failed to load:', this.src);
            // Hide video container or show placeholder
            this.style.display = 'none';
        });

        // Intersection observer for video loading
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (video.src) {
                        video.load();
                        video.play().catch(e => {
                            console.log('Video autoplay prevented:', e);
                        });
                    }
                    videoObserver.unobserve(video);
                }
            });
        }, { threshold: 0.25 });

        videoObserver.observe(video);
    });

    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        img.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        imageObserver.observe(img);
    });

    // Back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="ri-arrow-up-line"></i>';
    backToTopBtn.className = 'fixed bottom-8 right-8 w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 opacity-0 pointer-events-none z-40';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('-translate-x-full')) {
            mobileMenu.classList.add('-translate-x-full');
        }
    });

    // Focus management for accessibility
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Trap focus in mobile menu when open
    if (mobileMenu) {
        mobileMenu.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                const focusableContent = mobileMenu.querySelectorAll(focusableElements);
                const firstFocusableElement = focusableContent[0];
                const lastFocusableElement = focusableContent[focusableContent.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Performance optimization: Debounce scroll events
    let scrollTimeout;
    function debounceScroll(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(scrollTimeout);
                func(...args);
            };
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(later, wait);
        };
    }

    // Apply debouncing to scroll-heavy operations
    const debouncedScrollHandler = debounceScroll(() => {
        // Any heavy scroll operations can go here
    }, 16); // ~60fps

    window.addEventListener('scroll', debouncedScrollHandler);

    // Visitor tracking
function trackPageVisit() {
    let visitorData = JSON.parse(localStorage.getItem('visitorData')) || {
        totalVisits: 0,
        uniqueVisitors: new Set(),
        dailyVisits: {},
        sessionData: [],
        quoteRequests: 0
    };
    
    const today = new Date().toISOString().split('T')[0];
    
    if (!visitorData.dailyVisits[today]) {
        visitorData.dailyVisits[today] = 0;
    }
    
    visitorData.dailyVisits[today]++;
    visitorData.totalVisits++;
    
    // Track session start
    const sessionStart = new Date().toISOString();
    visitorData.sessionData.push({
        page: window.location.pathname,
        timestamp: sessionStart,
        userAgent: navigator.userAgent.substring(0, 100)
    });
    
    // Keep only last 1000 sessions to prevent storage overflow
    if (visitorData.sessionData.length > 1000) {
        visitorData.sessionData = visitorData.sessionData.slice(-1000);
    }
    
    localStorage.setItem('visitorData', JSON.stringify(visitorData));
}

// Track page visit on load
trackPageVisit();

// Global CargoExpress object for shared functionality
window.CargoExpress = {
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transform transition-all duration-300 translate-x-full`;
        
        // Set color based on type
        switch(type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-blue-500');
        }
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="mr-2">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
};

console.log('Cargo Express Logistics - Website loaded successfully');
});

// Global utility functions
window.CargoExpress = {
    showNotification: function(message, type = 'info') {
        // Reuse the notification function from above
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
};