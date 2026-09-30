/**
 * X-29 Module: utils/dom.js
 * Safe DOM manipulation helpers with existence guards and fast O(1) element caching.
 */

const _domCache = new Map();

/**
 * Safely retrieves a DOM element by ID with SSR / existence guards and O(1) caching.
 * 
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} DOM element or null if not found or in SSR
 */
export function safeGetEl(id) {
    if (typeof document === 'undefined') return null;
    const cached = _domCache.get(id);
    if (cached && (cached.isConnected === undefined || cached.isConnected)) {
        return cached;
    }
    const el = document.getElementById(id);
    if (el) {
        _domCache.set(id, el);
    } else {
        _domCache.delete(id);
    }
    return el;
}

/**
 * Clears the internal DOM element cache.
 */
export function clearDomCache() {
    _domCache.clear();
}

/**
 * Safely sets the text content of a DOM element by ID if it exists.
 * 
 * @param {string} id - Element ID
 * @param {string|number} text - Text to set
 */
export function safeSetText(id, text) {
    const el = safeGetEl(id);
    if (el) el.textContent = (text !== undefined && text !== null) ? text : '';
}

/**
 * Safely sets the inner HTML of a DOM element by ID if it exists.
 * 
 * @param {string} id - Element ID
 * @param {string} html - HTML string
 */
export function safeSetHtml(id, html) {
    const el = safeGetEl(id);
    if (el) el.innerHTML = (html !== undefined && html !== null) ? html : '';
}

/**
 * Safely sets the class name of a DOM element by ID if it exists.
 * 
 * @param {string} id - Element ID
 * @param {string} className - CSS class name string
 */
export function safeSetClass(id, className) {
    const el = safeGetEl(id);
    if (el) el.className = className || '';
}

// Global window compatibility bridge
if (typeof window !== 'undefined') {
    window.safeGetEl = safeGetEl;
    window.clearDomCache = clearDomCache;
    window.safeSetText = safeSetText;
    window.safeSetHtml = safeSetHtml;
    window.safeSetClass = safeSetClass;
} else if (typeof global !== 'undefined') {
    global.safeGetEl = safeGetEl;
    global.clearDomCache = clearDomCache;
    global.safeSetText = safeSetText;
    global.safeSetHtml = safeSetHtml;
    global.safeSetClass = safeSetClass;
}
