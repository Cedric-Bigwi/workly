export const CONFIG = {
    JOBS_PER_PAGE: 1,
    NEWS_PER_PAGE: 1,
    NEWS_LIMIT: 20,
    ERROR_TIMEOUT: 5000
};

export const LANGUAGE_MAP = {
    'English': { country: 'US', lang: 'en' },
    'French': { country: 'FR', lang: 'fr' },
    'Spanish': { country: 'ES', lang: 'es' },
    'German': { country: 'DE', lang: 'de' },
    'Japanese': { country: 'JP', lang: 'ja' }
};

export const TIME_PUBLISHED_OPTIONS = [
    { label: 'Anytime', value: 'anytime' },
    { label: 'Last 24 Hours', value: '1d' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last Month', value: '1m' },
    { label: 'Last Year', value: '1y' }
];

export const SELECTORS = {
    searchInput: '#searchInput',
    searchBtn: '#searchBtn',
    errorMessage: '#errorMessage',
    jobsContainer: '#jobsContainer',
    newsContainer: '#newsContainer',
    jobModal: '#jobModal',
    modalBody: '#modalBody',
    modalClose: '#modalClose',
    modalDone: '#modalDone',
    modalOverlay: '#modalOverlay',
    themeToggle: '#themeToggle',
    newsFilters: '#newsFilters',
    waveButton: '#waveButton',
    waveMenu: '#waveMenu'
};

export const INITIAL_STATE = {
    allJobs: [],
    currentJobPage: 1,
    allNews: [],
    currentNewsPage: 1,
    selectedJobIndex: null,
    selectedJobTitle: '',
    currentQuery: '',
    newsLanguage: 'English',
    newsTimePublished: 'anytime',
    theme: localStorage.getItem('theme') || 'light'
};

export const Utils = {

    formatDate(dateString) {
        if (!dateString) return 'Recently';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (days === 0) return 'Today';
            if (days === 1) return 'Yesterday';
            if (days < 7) return `${days} days ago`;
            return date.toLocaleDateString();
        } catch {
            return dateString;
        }
    },

    formatSalary(job) {
        if (job.salary) return job.salary;
        if (job.min_salary && job.max_salary) {
            const period = job.salary_period === 'HOUR' ? '/hr' : '/yr';
            return `$${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}${period}`;
        }
        return 'Not specified';
    },

    truncateText(text, length = 200) {
        if (!text) return '';
        if (text.length > length) return text.substring(0, length) + '...';
        return text;
    },

    getElement(selector) {
        return document.querySelector(selector);
    }
    
};