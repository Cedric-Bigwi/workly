import { SELECTORS, CONFIG, Utils } from './state.js';


export const PaginationHelper = {
    getPaginationHtml(appState, type) {
        const isJob = type === 'job';
        const totalItems = isJob ? appState.allJobs.length : appState.allNews.length;
        const itemsPerPage = isJob ? CONFIG.JOBS_PER_PAGE : CONFIG.NEWS_PER_PAGE;
        const currentPage = isJob ? appState.currentJobPage : appState.currentNewsPage;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) return '';

        let html = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            const prevFunc = isJob ? 'appState.prevJob()' : 'appState.prevNews()';
            html += `<button onclick="${prevFunc}" class="pagination-btn pagination-prev">← Previous</button>`;
        }
        
        // Show all page numbers
        for (let i = 1; i <= totalPages; i++) {
            const setPageFunc = isJob ? 
                `appState.currentJobPage=${i}; appState.displayJobPage()` : 
                `appState.currentNewsPage=${i}; appState.displayNewsPage()`;
            const activeClass = i === currentPage ? 'pagination-btn-active' : '';
            html += `<button onclick="${setPageFunc}" class="pagination-btn pagination-number ${activeClass}">${i}</button>`;
        }
        
        // Next button
        if (currentPage < totalPages) {
            const nextFunc = isJob ? 'appState.nextJob()' : 'appState.nextNews()';
            html += `<button onclick="${nextFunc}" class="pagination-btn pagination-next">Next →</button>`;
        }
        
        html += `<span class="pagination-info">(${totalPages} pages)</span>`;
        html += '</div>';
        return html;
    }
};

export const ErrorHandler = {
    showError(message) {
        const errorEl = Utils.getElement(SELECTORS.errorMessage);
        errorEl.textContent = '❌ ' + message;
        errorEl.style.display = 'block';
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, CONFIG.ERROR_TIMEOUT);
    },

    clearError() {
        const errorEl = Utils.getElement(SELECTORS.errorMessage);
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    },

    getInitialJobsView() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <p>Enter a search query to get started</p>
                <p style="font-size: 0.9rem; color: var(--text-light);">
                    Example: "Python developer remote", "React engineer NYC"
                </p>
            </div>
        `;
    },
    
    getInitialNewsView() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📰</div>
                <p>Click a job's <strong>Company News</strong> button</p>
                <p style="font-size: 0.9rem; color: var(--text-light);">
                    The latest news for that company will appear here.
                </p>
            </div>
        `;
    }
};

export const ThemeManager = {
    init(appState) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        appState.theme = savedTheme;
        this.applyTheme(savedTheme);
        this.updateButtonIcon(savedTheme);
    },

    toggle(appState) {
        const newTheme = appState.theme === 'light' ? 'dark' : 'light';
        appState.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        this.applyTheme(newTheme);
        this.updateButtonIcon(newTheme);
    },

    updateButtonIcon(theme) {
        const btn = Utils.getElement(SELECTORS.themeToggle);
        if (btn) {
            btn.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    },

    applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--bg', '#1a202c');
            root.style.setProperty('--bg-dark', '#0f172a');
            root.style.setProperty('--text', '#e2e8f0');
            root.style.setProperty('--text-light', '#cbd5e0');
            root.style.setProperty('--border', '#2d3748');
            document.body.style.background = 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)';
            document.body.classList.add('dark-mode');
        } else {
            root.style.setProperty('--bg', '#f7f9fc');
            root.style.setProperty('--bg-dark', '#0f172a');
            root.style.setProperty('--text', '#2d3748');
            root.style.setProperty('--text-light', '#718096');
            root.style.setProperty('--border', '#e2e8f0');
            document.body.style.background = 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)';
            document.body.classList.remove('dark-mode');
        }
    }
};