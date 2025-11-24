import { CONFIG, SELECTORS, Utils, TIME_PUBLISHED_OPTIONS } from './state.js';
import { PaginationHelper } from './ui.js';

export const NewsRenderer = {
    displayLoading() {
        Utils.getElement(SELECTORS.newsContainer).innerHTML = 
            '<div class="loading"><div class="spinner"></div><p>Loading company news...</p></div>';
    },

    displayFilters(appState) {
        const filtersHtml = `
            <div id="newsFilters" class="news-filters">
                <div class="filter-group">
                    <label for="langFilter">Language:</label>
                    <select id="langFilter" onchange="appState.updateNewsLanguage(this.value)">
                        <option value="English" ${appState.newsLanguage === 'English' ? 'selected' : ''}>English</option>
                        <option value="French" ${appState.newsLanguage === 'French' ? 'selected' : ''}>French</option>
                        <option value="Spanish" ${appState.newsLanguage === 'Spanish' ? 'selected' : ''}>Spanish</option>
                        <option value="German" ${appState.newsLanguage === 'German' ? 'selected' : ''}>German</option>
                        <option value="Japanese" ${appState.newsLanguage === 'Japanese' ? 'selected' : ''}>Japanese</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="timeFilter">Time Published:</label>
                    <select id="timeFilter" onchange="appState.updateNewsTime(this.value)">
                        ${TIME_PUBLISHED_OPTIONS.map(opt => 
                            `<option value="${opt.value}" ${appState.newsTimePublished === opt.value ? 'selected' : ''}>${opt.label}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;
        return filtersHtml;
    },

    displayNewsPage(appState) {
        const container = Utils.getElement(SELECTORS.newsContainer);
        if (appState.allNews.length === 0) {
            container.innerHTML = `
                ${this.displayFilters(appState)}
                <div class="empty-state">
                    <div class="empty-icon">📰</div>
                    <p>No news found for "${appState.selectedJobTitle}"</p>
                    <p style="font-size: 0.9rem; color: var(--text-light);">Try a different filter or search</p>
                </div>
            `;
            return;
        }

        const start = (appState.currentNewsPage - 1) * CONFIG.NEWS_PER_PAGE;
        const pageNews = appState.allNews.slice(start, start + CONFIG.NEWS_PER_PAGE);
        
        let html = this.displayFilters(appState);
        html += `<div class="result-count">📰 Article ${appState.currentNewsPage} of ${appState.allNews.length}</div>`;

        pageNews.forEach((article) => {
            html += `
                <div class="news-item">
                    ${article.image ? `
                        <img src="${article.image}" alt="${article.title}" class="news-image" 
                            onerror="this.style.display='none'" />
                    ` : ''}
                    <a href="${article.link}" target="_blank" rel="noopener" class="news-title">
                        ${article.title}
                    </a>
                    <div class="news-meta">
                        <span class="news-source">${article.source_name}</span>
                        <span>${Utils.formatDate(article.published)}</span>
                    </div>
                    <p class="news-summary">
                        ${article.summary || 'No summary available'}
                    </p>
                    <a href="${article.link}" target="_blank" rel="noopener" class="news-link">
                        Read full article →
                    </a>
                </div>
            `;
        });
        html += PaginationHelper.getPaginationHtml(appState, 'news');
        container.innerHTML = html;
    }
};