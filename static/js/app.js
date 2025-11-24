import { CONFIG, SELECTORS, INITIAL_STATE, Utils } from './state.js';
import { API } from './api.js';
import { ErrorHandler, ThemeManager } from './ui.js';
import { JobsRenderer, ModalRenderer } from './jobs.js';
import { NewsRenderer } from './news.js';


// Main Application State
export const appState = {
    ...INITIAL_STATE,

    async search() {
        const query = Utils.getElement(SELECTORS.searchInput).value.trim();
        if (!query) {
            ErrorHandler.showError('Please enter a search query');
            return;
        }

        this.currentQuery = query;
        this.currentJobPage = 1;
        ErrorHandler.clearError();
        JobsRenderer.displayLoading();

        try {
            const jobResult = await API.searchJobs(query);
            if (jobResult.error) {
                ErrorHandler.showError(jobResult.error);
                Utils.getElement(SELECTORS.jobsContainer).innerHTML = 
                    ErrorHandler.getInitialJobsView();
                return;
            }

            this.allJobs = jobResult.results || [];
            if (this.allJobs.length === 0) {
                ErrorHandler.showError('No jobs found for your query');
                Utils.getElement(SELECTORS.jobsContainer).innerHTML = 
                    ErrorHandler.getInitialJobsView();
                return;
            }

            this.displayJobPage();
        } catch (error) {
            ErrorHandler.showError(`Search failed: ${error.message}`);
            Utils.getElement(SELECTORS.jobsContainer).innerHTML = 
                ErrorHandler.getInitialJobsView();
        }
    },

    displayJobPage() {
        JobsRenderer.displayJobPage(this);
    },

    nextJob() {
        const totalPages = Math.ceil(this.allJobs.length / CONFIG.JOBS_PER_PAGE);
        if (this.currentJobPage < totalPages) {
            this.currentJobPage++;
            this.displayJobPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    prevJob() {
        if (this.currentJobPage > 1) {
            this.currentJobPage--;
            this.displayJobPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    showJobDetails(jobIndex) {
        const job = this.allJobs[jobIndex];
        ModalRenderer.showJobDetails(job);
    },

    async loadNews(jobIndex) {
        this.selectedJobIndex = jobIndex;
        const job = this.allJobs[jobIndex];
        this.selectedJobTitle = job.title;
        this.currentNewsPage = 1;

        NewsRenderer.displayLoading();

        try {
            let newsResult = await API.searchNews(
                job.company, 
                CONFIG.NEWS_LIMIT,
                this.newsLanguage,
                this.newsTimePublished
            );
            this.allNews = newsResult.articles || [];

            if (this.allNews.length === 0) {
                const relatedResult = await API.searchNews(
                    job.title, 
                    CONFIG.NEWS_LIMIT,
                    this.newsLanguage,
                    this.newsTimePublished
                );
                this.allNews = relatedResult.articles || [];
            }

            this.displayNewsPage();
        } catch (error) {
            ErrorHandler.showError(`Failed to load news: ${error.message}`);
            Utils.getElement(SELECTORS.newsContainer).innerHTML = 
                '<div class="empty-state"><p>Failed to load news</p></div>';
        }
    },

    displayNewsPage() {
        NewsRenderer.displayNewsPage(this);
    },

    nextNews() {
        const totalPages = Math.ceil(this.allNews.length / CONFIG.NEWS_PER_PAGE);
        if (this.currentNewsPage < totalPages) {
            this.currentNewsPage++;
            this.displayNewsPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    prevNews() {
        if (this.currentNewsPage > 1) {
            this.currentNewsPage--;
            this.displayNewsPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    updateNewsLanguage(language) {
        this.newsLanguage = language;
        this.currentNewsPage = 1;
        this.loadNews(this.selectedJobIndex);
    },

    updateNewsTime(timePublished) {
        this.newsTimePublished = timePublished;
        this.currentNewsPage = 1;
        this.loadNews(this.selectedJobIndex);
    },

    toggleTheme() {
        ThemeManager.toggle(this);
    }
};

// Event Listeners Setup
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = Utils.getElement(SELECTORS.searchBtn);
    const searchInput = Utils.getElement(SELECTORS.searchInput);
    const modalClose = Utils.getElement(SELECTORS.modalClose);
    const modalDone = Utils.getElement(SELECTORS.modalDone);
    const modalOverlay = Utils.getElement(SELECTORS.modalOverlay);
    const themeToggle = Utils.getElement(SELECTORS.themeToggle);
    const waveButton = Utils.getElement(SELECTORS.waveButton);
    const waveMenu = Utils.getElement(SELECTORS.waveMenu);

    searchBtn.addEventListener('click', () => appState.search());
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') appState.search();
    });

    modalClose.addEventListener('click', () => ModalRenderer.closeModal());
    modalDone.addEventListener('click', () => ModalRenderer.closeModal());
    modalOverlay.addEventListener('click', () => ModalRenderer.closeModal());
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => appState.toggleTheme());
    }

    // Initialize theme
    ThemeManager.init(appState);

    // Wave menu toggle
    if (waveButton && waveMenu) {
        waveButton.addEventListener('click', (e) => {
            e.stopPropagation();
            waveMenu.style.display = waveMenu.style.display === 'flex' ? 'none' : 'flex';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!waveMenu.contains(e.target) && e.target !== waveButton) {
                waveMenu.style.display = 'none';
            }
        });
    }

    // Initial UI
    Utils.getElement(SELECTORS.jobsContainer).innerHTML = 
        ErrorHandler.getInitialJobsView();
    Utils.getElement(SELECTORS.newsContainer).innerHTML =
        ErrorHandler.getInitialNewsView();
        
});

// Make appState global for onclick handlers
window.appState = appState;