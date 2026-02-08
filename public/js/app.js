// Photo Album Frontend Application

// =============================================================================
// Cache Manager - Client-side caching with TTL and stale-while-revalidate
// =============================================================================

class CacheManager {
  constructor(options = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.staleWhileRevalidate = options.staleWhileRevalidate !== false;
    this.storageKey = options.storageKey || 'photoAlbumCache';
    this.memoryCache = new Map();
    this.loadFromStorage();
  }

  /**
   * Load cache from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.memoryCache.set(key, value);
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  saveToStorage() {
    try {
      const data = Object.fromEntries(this.memoryCache);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {{ data: any, isStale: boolean } | null}
   */
  get(key) {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    const now = Date.now();
    const isExpired = now > item.expiry;
    const isStale = now > item.staleAt;

    // If completely expired (past stale window), remove it
    if (isExpired) {
      this.memoryCache.delete(key);
      this.saveToStorage();
      return null;
    }

    return {
      data: item.data,
      isStale: isStale
    };
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    const now = Date.now();
    this.memoryCache.set(key, {
      data,
      staleAt: now + this.ttl,
      expiry: now + this.ttl * 2 // Keep stale data for double TTL
    });
    this.saveToStorage();
  }

  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear();
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Remove specific key from cache
   * @param {string} key - Cache key
   */
  remove(key) {
    this.memoryCache.delete(key);
    this.saveToStorage();
  }
}

// Initialize global cache manager
const photoCache = new CacheManager({ ttl: 5 * 60 * 1000 }); // 5 minute TTL

// =============================================================================
// Lazy Loading with Intersection Observer
// =============================================================================

class LazyImageLoader {
  constructor(options = {}) {
    this.rootMargin = options.rootMargin || '100px';
    this.threshold = options.threshold || 0.1;
    this.observer = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          rootMargin: this.rootMargin,
          threshold: this.threshold
        }
      );
    }
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // Create a new image to preload
    const preloadImg = new Image();
    
    preloadImg.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      img.style.opacity = '1';
      
      // Hide skeleton loader
      const skeleton = img.previousElementSibling;
      if (skeleton && skeleton.classList.contains('skeleton-loader')) {
        skeleton.style.display = 'none';
      }
    };

    preloadImg.onerror = () => {
      img.classList.add('error');
      const skeleton = img.previousElementSibling;
      if (skeleton) {
        skeleton.innerHTML = '<div class="flex items-center justify-center h-full text-slate-500 dark:text-slate-400"><i class="fas fa-exclamation-circle mr-2"></i>Failed to load</div>';
      }
    };

    preloadImg.src = src;
  }

  observe(img) {
    if (this.observer) {
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize global lazy loader
const lazyLoader = new LazyImageLoader({ rootMargin: '200px' });

// =============================================================================
// Infinite Scroll / Pagination
// =============================================================================

class PaginationManager {
  constructor(options = {}) {
    this.page = 1;
    this.limit = options.limit || 12;
    this.total = 0;
    this.totalPages = 0;
    this.hasMore = true;
    this.isLoading = false;
    this.allPhotos = []; // Track all loaded photos
  }

  reset() {
    this.page = 1;
    this.total = 0;
    this.totalPages = 0;
    this.hasMore = true;
    this.isLoading = false;
    this.allPhotos = [];
  }

  updateFromResponse(pagination) {
    this.page = pagination.page;
    this.total = pagination.total;
    this.totalPages = pagination.totalPages;
    this.hasMore = pagination.hasMore;
  }

  nextPage() {
    if (this.hasMore) {
      this.page++;
    }
    return this.page;
  }

  getStatus() {
    return {
      page: this.page,
      total: this.total,
      totalPages: this.totalPages,
      hasMore: this.hasMore,
      loaded: this.allPhotos.length
    };
  }
}

class InfiniteScroll {
  constructor(options = {}) {
    this.container = options.container;
    this.loadMore = options.loadMore;
    this.rootMargin = options.rootMargin || '200px';
    this.threshold = options.threshold || 0.1;
    this.observer = null;
    this.sentinel = null;
  }

  init() {
    if (!this.container || !('IntersectionObserver' in window)) {
      return;
    }

    // Create sentinel element
    this.sentinel = document.createElement('div');
    this.sentinel.id = 'scroll-sentinel';
    this.sentinel.className = 'h-4 w-full';
    this.sentinel.setAttribute('aria-hidden', 'true');

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && this.loadMore) {
            this.loadMore();
          }
        });
      },
      {
        rootMargin: this.rootMargin,
        threshold: this.threshold
      }
    );
  }

  attach() {
    if (this.sentinel && this.container) {
      // Remove if already attached
      const existing = document.getElementById('scroll-sentinel');
      if (existing) {
        existing.remove();
      }
      
      this.container.after(this.sentinel);
      
      if (this.observer) {
        this.observer.observe(this.sentinel);
      }
    }
  }

  detach() {
    if (this.observer && this.sentinel) {
      this.observer.unobserve(this.sentinel);
    }
    if (this.sentinel) {
      this.sentinel.remove();
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.sentinel) {
      this.sentinel.remove();
    }
  }
}

// Initialize global pagination manager
const paginationManager = new PaginationManager({ limit: 12 });
let infiniteScroll = null;

// =============================================================================
// Photo Fetching with Caching and Pagination
// =============================================================================

// Feature flag for infinite scroll vs load all
const USE_INFINITE_SCROLL = true;
const PHOTOS_PER_PAGE = 12;

/**
 * Fetch initial photos (first page or all)
 */
async function fetchPhotos() {
  const photoGrid = document.getElementById('photo-grid');
  const loadingSpinner = document.getElementById('loading');
  const errorMessage = document.getElementById('error-message');

  // Reset pagination state
  paginationManager.reset();

  if (USE_INFINITE_SCROLL) {
    await fetchPhotosPaginated(photoGrid, loadingSpinner, errorMessage, true);
  } else {
    await fetchAllPhotos(photoGrid, loadingSpinner, errorMessage);
  }
}

/**
 * Fetch all photos at once (legacy mode)
 */
async function fetchAllPhotos(photoGrid, loadingSpinner, errorMessage) {
  const cacheKey = 'photos_all';

  try {
    // Check cache first
    const cached = photoCache.get(cacheKey);
    
    if (cached) {
      if (loadingSpinner) loadingSpinner.classList.add('hidden');
      if (errorMessage) errorMessage.classList.add('hidden');
      renderPhotos(cached.data, photoGrid);

      if (cached.isStale) {
        console.log('Cache is stale, revalidating in background...');
        revalidatePhotos(cacheKey, photoGrid);
      }
      return;
    }

    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');

    const photos = await fetchPhotosFromAPI();
    photoCache.set(cacheKey, photos);

    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    renderPhotos(photos, photoGrid);
  } catch (error) {
    console.error('Error fetching photos:', error);
    if (loadingSpinner) loadingSpinner.classList.add('hidden');

    const staleCache = photoCache.get(cacheKey);
    if (staleCache) {
      renderPhotos(staleCache.data, photoGrid);
      showToast('Showing cached photos. Network error occurred.', 'warning');
      return;
    }

    if (errorMessage) {
      errorMessage.classList.remove('hidden');
      errorMessage.textContent = 'Failed to load photos. Please try again later.';
    }
  }
}

/**
 * Fetch photos with pagination
 */
async function fetchPhotosPaginated(photoGrid, loadingSpinner, errorMessage, isInitial = false) {
  if (paginationManager.isLoading) return;
  if (!paginationManager.hasMore && !isInitial) return;

  paginationManager.isLoading = true;
  const page = isInitial ? 1 : paginationManager.page;
  const cacheKey = `photos_page_${page}`;

  try {
    // Show loading state
    if (isInitial && loadingSpinner) {
      loadingSpinner.classList.remove('hidden');
    }
    if (errorMessage) {
      errorMessage.classList.add('hidden');
    }

    // Show inline loading for subsequent pages
    if (!isInitial) {
      showLoadingMore();
    }

    // Check cache for this page
    const cached = photoCache.get(cacheKey);
    let result;

    if (cached && !cached.isStale) {
      result = cached.data;
    } else {
      result = await fetchPhotosFromAPIPaginated(page, PHOTOS_PER_PAGE);
      photoCache.set(cacheKey, result);
    }

    // Update pagination state
    paginationManager.updateFromResponse(result.pagination);
    paginationManager.allPhotos = isInitial 
      ? result.photos 
      : [...paginationManager.allPhotos, ...result.photos];

    // Hide loading states
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    hideLoadingMore();

    // Render or append photos
    if (isInitial) {
      renderPhotos(result.photos, photoGrid);
      setupInfiniteScroll(photoGrid);
    } else {
      appendPhotos(result.photos, photoGrid);
    }

    // Update load more button and photo counter
    updateLoadMoreButton();
    updatePhotoCounter();

    // Move to next page if there's more
    if (paginationManager.hasMore) {
      paginationManager.nextPage();
    } else {
      // No more photos - detach infinite scroll
      if (infiniteScroll) {
        infiniteScroll.detach();
      }
    }

  } catch (error) {
    console.error('Error fetching photos:', error);
    
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    hideLoadingMore();

    if (isInitial) {
      // Try stale cache for initial load
      const staleCache = photoCache.get(cacheKey);
      if (staleCache) {
        paginationManager.updateFromResponse(staleCache.data.pagination);
        paginationManager.allPhotos = staleCache.data.photos;
        renderPhotos(staleCache.data.photos, photoGrid);
        setupInfiniteScroll(photoGrid);
        showToast('Showing cached photos. Network error occurred.', 'warning');
      } else if (errorMessage) {
        errorMessage.classList.remove('hidden');
        errorMessage.textContent = 'Failed to load photos. Please try again later.';
      }
    } else {
      showToast('Failed to load more photos.', 'error');
    }
  } finally {
    paginationManager.isLoading = false;
  }
}

/**
 * Fetch photos from API (all)
 * @returns {Promise<Array>} Array of photos
 */
async function fetchPhotosFromAPI() {
  const response = await fetch('/photos');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch photos from API with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Paginated response
 */
async function fetchPhotosFromAPIPaginated(page, limit) {
  const response = await fetch(`/photos?page=${page}&limit=${limit}&paginated=true`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Setup infinite scroll observer
 */
function setupInfiniteScroll(photoGrid) {
  if (infiniteScroll) {
    infiniteScroll.disconnect();
  }

  infiniteScroll = new InfiniteScroll({
    container: photoGrid,
    loadMore: () => loadMorePhotos(),
    rootMargin: '400px'
  });

  infiniteScroll.init();
  
  if (paginationManager.hasMore) {
    infiniteScroll.attach();
  }
}

/**
 * Load more photos (called by infinite scroll or button)
 */
async function loadMorePhotos() {
  if (paginationManager.isLoading || !paginationManager.hasMore) return;

  const photoGrid = document.getElementById('photo-grid');
  const loadingSpinner = document.getElementById('loading');
  const errorMessage = document.getElementById('error-message');

  await fetchPhotosPaginated(photoGrid, loadingSpinner, errorMessage, false);
}

/**
 * Show loading indicator for loading more
 */
function showLoadingMore() {
  let loader = document.getElementById('loading-more');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loading-more';
    loader.className = 'col-span-full flex justify-center py-8';
    loader.innerHTML = `
      <div class="flex items-center gap-3 text-slate-600 dark:text-slate-400">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 dark:border-slate-700 border-t-yellow-600 dark:border-t-yellow-500"></div>
        <span>Loading more photos...</span>
      </div>
    `;
    const photoGrid = document.getElementById('photo-grid');
    if (photoGrid) {
      photoGrid.appendChild(loader);
    }
  }
}

/**
 * Hide loading more indicator
 */
function hideLoadingMore() {
  const loader = document.getElementById('loading-more');
  if (loader) {
    loader.remove();
  }
}

/**
 * Update load more button visibility
 */
function updateLoadMoreButton() {
  let button = document.getElementById('load-more-btn');
  
  if (!paginationManager.hasMore) {
    if (button) button.remove();
    return;
  }

  if (!button) {
    button = document.createElement('button');
    button.id = 'load-more-btn';
    button.className = 'mx-auto mt-8 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 hidden sm:block';
    button.innerHTML = '<i class="fas fa-plus mr-2"></i>Load More Photos';
    button.onclick = loadMorePhotos;
    
    const container = document.querySelector('main') || document.getElementById('photo-grid')?.parentElement;
    if (container) {
      const photoGrid = document.getElementById('photo-grid');
      if (photoGrid) {
        photoGrid.after(button);
      }
    }
  }
}

/**
 * Update photo counter display
 */
function updatePhotoCounter() {
  let counter = document.getElementById('photo-counter');
  
  if (!counter) {
    counter = document.createElement('div');
    counter.id = 'photo-counter';
    counter.className = 'text-center text-sm text-slate-500 dark:text-slate-400 mt-4';
    const photoGrid = document.getElementById('photo-grid');
    if (photoGrid) {
      photoGrid.before(counter);
    }
  }

  const { loaded, total } = paginationManager.getStatus();
  counter.textContent = `Showing ${loaded} of ${total} photos`;
}

/**
 * Revalidate photos in background (stale-while-revalidate)
 * @param {string} cacheKey - Cache key
 * @param {HTMLElement} photoGrid - Photo grid container
 */
async function revalidatePhotos(cacheKey, photoGrid) {
  try {
    const photos = await fetchPhotosFromAPI();
    const cached = photoCache.get(cacheKey);

    // Check if data has changed
    if (cached && JSON.stringify(cached.data) !== JSON.stringify(photos)) {
      console.log('New photos detected, updating view...');
      photoCache.set(cacheKey, photos);
      renderPhotos(photos, photoGrid);
      showToast('Photos updated!', 'success');
    } else {
      // Just update cache timestamp
      photoCache.set(cacheKey, photos);
    }
  } catch (error) {
    console.warn('Background revalidation failed:', error);
  }
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, warning, error)
 */
function showToast(message, type = 'info') {
  // Remove existing toast
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'toast';
  
  const bgColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white ${bgColors[type] || bgColors.info} transform transition-all duration-300 z-50`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  document.body.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Render photos to the grid
 * @param {Array} photos - Array of photo objects
 * @param {HTMLElement} container - Container element
 */
function renderPhotos(photos, container) {
  if (!container) return;

  // Disconnect existing observers
  lazyLoader.disconnect();
  lazyLoader.init();

  // Clear existing content
  container.innerHTML = '';

  // Check if photos array is empty
  if (!photos || photos.length === 0) {
    container.innerHTML =
      '<p class="text-center text-slate-500 dark:text-slate-400 col-span-full py-8">No photos available</p>';
    return;
  }

  // Render each photo with staggered animation
  photos.forEach((photo, index) => {
    const photoCard = createPhotoCard(photo);
    // Add staggered fade-in animation
    photoCard.style.animationDelay = `${index * 0.05}s`;
    photoCard.classList.add('animate-fade-in');
    container.appendChild(photoCard);

    // Set up lazy loading for the image
    const img = photoCard.querySelector('img[data-src]');
    if (img) {
      lazyLoader.observe(img);
    }
  });
}

/**
 * Append photos to existing grid (for infinite scroll)
 * @param {Array} photos - Array of photo objects to append
 * @param {HTMLElement} container - Container element
 */
function appendPhotos(photos, container) {
  if (!container || !photos || photos.length === 0) return;

  const existingCount = container.querySelectorAll('[data-photo-id]').length;

  // Append each photo with staggered animation
  photos.forEach((photo, index) => {
    // Skip if photo already exists
    if (container.querySelector(`[data-photo-id="${photo.id}"]`)) {
      return;
    }

    const photoCard = createPhotoCard(photo);
    // Add staggered fade-in animation based on position in new batch
    photoCard.style.animationDelay = `${index * 0.05}s`;
    photoCard.classList.add('animate-fade-in');
    container.appendChild(photoCard);

    // Set up lazy loading for the image
    const img = photoCard.querySelector('img[data-src]');
    if (img) {
      lazyLoader.observe(img);
    }
  });

  // Announce to screen readers
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `${photos.length} more photos loaded. ${existingCount + photos.length} photos total.`;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}

/**
 * Create a photo card element with lazy loading support
 * @param {Object} photo - Photo object with id and url
 * @returns {HTMLElement} Photo card element
 */
function createPhotoCard(photo) {
  const div = document.createElement('div');
  div.className =
    'photo-card max-w-md rounded-xl overflow-hidden shadow-lg bg-white dark:bg-slate-800/90 hover:shadow-2xl dark:hover:shadow-yellow-500/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.03] border-2 border-slate-200 dark:border-yellow-500/20 dark:hover:border-yellow-500/40 backdrop-blur-sm';
  div.setAttribute('role', 'listitem');
  div.dataset.photoId = photo.id;

  // Use data-src for lazy loading instead of src
  div.innerHTML = `
    <div class="relative">
      <!-- Skeleton loader -->
      <div class="skeleton-loader absolute inset-0 h-64"></div>

      <!-- Image with lazy loading -->
      <img
        class="lazy-image w-full h-64 object-cover cursor-pointer"
        data-src="${photo.url}"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
        alt="Photo ${photo.id}"
        data-photo-id="${photo.id}"
        onclick="openModal('${photo.url}', 'Photo ${photo.id}')"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openModal('${photo.url}', 'Photo ${photo.id}');}"
        tabindex="0"
        role="button"
        aria-label="View Photo ${photo.id} in full size"
      />
    </div>
    <div class="px-3 py-2 text-center bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-yellow-500/10">
      <a
        href="${photo.url}"
        download
        class="download-btn inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-yellow-400 transition-all duration-300 text-sm font-medium"
        aria-label="Download photo ${photo.id}"
        onclick="event.stopPropagation()"
      >
        <i class="fas fa-download"></i>
        <span class="hidden sm:inline">Download</span>
      </a>
    </div>
  `;

  return div;
}

// =============================================================================
// Cache Control UI
// =============================================================================

/**
 * Clear photo cache and reload
 */
function clearCacheAndReload() {
  photoCache.clear();
  showToast('Cache cleared!', 'success');
  fetchPhotos();
}

/**
 * Get cache status info
 * @returns {Object} Cache status
 */
function getCacheStatus() {
  const cached = photoCache.get('photos_all');
  return {
    hasCachedData: !!cached,
    isStale: cached ? cached.isStale : false,
    cacheSize: photoCache.memoryCache.size
  };
}

// =============================================================================
// Initialization
// =============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/**
 * Initialize the application
 */
function init() {
  // Fetch photos on load
  fetchPhotos();

  // Add visibility change handler to revalidate when user returns
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const cached = photoCache.get('photos_all');
      if (cached && cached.isStale) {
        console.log('Page visible, revalidating stale cache...');
        const photoGrid = document.getElementById('photo-grid');
        revalidatePhotos('photos_all', photoGrid);
      }
    }
  });

  // Add online/offline handlers
  window.addEventListener('online', () => {
    showToast('You are back online!', 'success');
    const cached = photoCache.get('photos_all');
    if (cached && cached.isStale) {
      const photoGrid = document.getElementById('photo-grid');
      revalidatePhotos('photos_all', photoGrid);
    }
  });

  window.addEventListener('offline', () => {
    showToast('You are offline. Showing cached content.', 'warning');
  });

  console.log('Photo Album initialized with caching and lazy loading');
}
