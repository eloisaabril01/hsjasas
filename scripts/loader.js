// Minimal Logo Loader functionality
class WebsiteLoader {
    constructor() {
        this.loadingComplete = false;
        this.assetsToLoad = [];
        this.loadedAssets = 0;
        this.init();
    }

    init() {
        // Create minimal loader HTML
        this.createLoader();

        // Track assets to load
        this.trackAssets();

        // Start loading process
        this.startLoading();
    }

    createLoader() {
        const loaderHTML = `
            <div id="website-loader" class="loader-container">
                <div class="loader-logo-container">
                    <img src="logo/cargo-express-logo.png" alt="Cargo Express Logo" class="loader-logo">
                </div>
                
                <div class="loader-text">Loading Cargo Express</div>

                <div class="loader-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>

                <div class="loader-progress">
                    <div class="loader-progress-bar"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    }

    trackAssets() {
        // Videos to preload
        const videos = [
            'videos/hero background.mp4',
            'videos/ships.mp4',
            'videos/planes.mp4',
            'videos/trucks.mp4'
        ];

        // Images to preload
        const images = [
            'logo/cargo-express-logo.jpg',
            'logo/cargo-express-logo.png'
        ];

        // CSS files
        const stylesheets = [
            'styles/main.css'
        ];

        this.assetsToLoad = [...videos, ...images, ...stylesheets];
    }

    async startLoading() {
        // Load assets
        const loadPromises = this.assetsToLoad.map(asset => this.loadAsset(asset));

        // Wait for all critical assets to load or timeout after 2 seconds
        try {
            await Promise.race([
                Promise.all(loadPromises),
                new Promise(resolve => setTimeout(resolve, 2000))
            ]);
        } catch (error) {
            console.log('Some assets failed to load, continuing anyway');
        }

        // Determine minimum loading time based on page
        const currentPage = window.location.pathname;
        const isIndexPage = currentPage === '/' || currentPage === '/index.html' || currentPage.endsWith('index.html');
        const minLoadTime = isIndexPage ? 2000 : 1500; // 2s for index, 1.5s for others
        
        const loadStartTime = performance.now();
        const elapsed = performance.now() - loadStartTime;

        if (elapsed < minLoadTime) {
            await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed));
        }

        this.completeLoading();
    }

    loadAsset(assetPath) {
        return new Promise((resolve, reject) => {
            const extension = assetPath.split('.').pop().toLowerCase();

            if (['mp4', 'webm', 'ogg'].includes(extension)) {
                // Load video
                const video = document.createElement('video');
                video.onloadeddata = () => {
                    this.updateProgress();
                    resolve();
                };
                video.onerror = () => {
                    console.log(`Failed to load video: ${assetPath}`);
                    this.updateProgress();
                    resolve(); // Don't reject, just continue
                };
                video.src = assetPath;
                video.preload = 'metadata';
            } else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(extension)) {
                // Load image
                const img = new Image();
                img.onload = () => {
                    this.updateProgress();
                    resolve();
                };
                img.onerror = () => {
                    console.log(`Failed to load image: ${assetPath}`);
                    this.updateProgress();
                    resolve(); // Don't reject, just continue
                };
                img.src = assetPath;
            } else if (extension === 'css') {
                // Check if CSS is loaded
                const link = document.querySelector(`link[href="${assetPath}"]`);
                if (link) {
                    link.onload = () => {
                        this.updateProgress();
                        resolve();
                    };
                    link.onerror = () => {
                        this.updateProgress();
                        resolve();
                    };
                } else {
                    this.updateProgress();
                    resolve();
                }
            } else {
                this.updateProgress();
                resolve();
            }
        });
    }

    updateProgress() {
        this.loadedAssets++;
    }

    completeLoading() {
        const loader = document.getElementById('website-loader');

        // Add loaded class for fade out animation
        setTimeout(() => {
            if (loader) {
                loader.classList.add('loaded');

                // Remove loader from DOM after animation
                setTimeout(() => {
                    if (loader && loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                    this.loadingComplete = true;

                    // Dispatch custom event for other scripts
                    document.dispatchEvent(new CustomEvent('websiteLoaded'));
                }, 800);
            }
        }, 300);
    }
}

// Initialize loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WebsiteLoader();
    });
} else {
    new WebsiteLoader();
}

// Export for potential use in other scripts
window.WebsiteLoader = WebsiteLoader;