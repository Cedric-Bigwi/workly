import { CONFIG, LANGUAGE_MAP } from './state.js';


export const API = {

    async searchJobs(query, page = 1) {

        try {
            const response = await fetch(
                `/api/search_jobs?q=${encodeURIComponent(query)}&page=${page}`
            );
            if (!response.ok) throw new Error('API error');
            return await response.json();

        } catch (error) {
            console.error('Job search error:', error);
            throw error;
        }
    },

    async searchNews(query, limit = CONFIG.NEWS_LIMIT, language = 'English', timePublished = 'anytime') {

        try {
            const langMap = LANGUAGE_MAP[language] || LANGUAGE_MAP['English'];
            const response = await fetch(
                `/api/search_news?q=${encodeURIComponent(query)}&limit=${limit}&country=${langMap.country}&lang=${langMap.lang}&time_published=${timePublished}`
            );
            if (!response.ok) throw new Error('API error');
            
            return await response.json();

        } catch (error) {
            console.error('News search error:', error);
            throw error;
        }
    }
};