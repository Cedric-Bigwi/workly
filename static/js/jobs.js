import { CONFIG, SELECTORS, Utils } from './state.js';
import { PaginationHelper } from './ui.js';

export const JobsRenderer = {

    displayLoading() {
        Utils.getElement(SELECTORS.jobsContainer).innerHTML = 
            '<div class="loading"><div class="spinner"></div><p>Searching jobs...</p></div>';
    },

    displayJobPage(appState) {
        const container = Utils.getElement(SELECTORS.jobsContainer);
        
        if (appState.allJobs.length === 0) {
            container.innerHTML = 
                '<div class="empty-state"><div class="empty-icon">💼</div><p>No jobs found</p></div>';
            return;
        }

        const start = (appState.currentJobPage - 1) * CONFIG.JOBS_PER_PAGE;
        const pageJobs = appState.allJobs.slice(start, start + CONFIG.JOBS_PER_PAGE);
        
        let html = `<div class="result-count">💼 Job ${Math.min(start + CONFIG.JOBS_PER_PAGE, appState.allJobs.length)} of ${appState.allJobs.length}</div>`;

        pageJobs.forEach((job, idx) => {
            const globalIdx = start + idx;
            html += `
                <div class="job-card">
                    <div class="job-header">
                        <div class="job-title">${job.title}</div>
                        <div class="job-company">${job.company}</div>
                    </div>
                    <div class="job-meta">
                        <span>📍 ${job.location}</span>
                        <span>💰 ${Utils.formatSalary(job)}</span>
                        <span>📅 ${Utils.formatDate(job.posted_utc)}</span>
                    </div>
                    <div class="job-snippet">
                        ${Utils.truncateText(job.description, 200)}
                    </div>
                    <div class="button-row">
                        <button onclick="appState.showJobDetails(${globalIdx})" class="btn-small btn-details">
                            View Full Details
                        </button>
                        <button onclick="appState.loadNews(${globalIdx})" class="btn-small btn-news">
                            Company News
                        </button>
                    </div>
                </div>
            `;
        });

        html += PaginationHelper.getPaginationHtml(appState, 'job');
        container.innerHTML = html;
    }
};

export const ModalRenderer = {

    showJobDetails(job) {
        const modalBody = Utils.getElement(SELECTORS.modalBody);
        
        const html = `
            <h2>${job.title}</h2>
            <p style="color: var(--primary); font-weight: 600; margin-bottom: 20px;">
                ${job.company} • ${job.location}
            </p>

            <div class="detail-section">
                <h4>📋 Position Details</h4>
                <ul class="detail-list">
                    <li><strong>Type:</strong> ${job.employment_type}</li>
                    <li><strong>Where:</strong> ${job.is_remote ? 'Remote' : 'On-site'}</li>
                    <li><strong>Posted:</strong> ${Utils.formatDate(job.posted_utc)}</li>
                    <li><strong>Salary:</strong> ${Utils.formatSalary(job)}</li>
                </ul>
            </div>

            ${job.qualifications && job.qualifications.length > 0 ? `
                <div class="detail-section">
                    <h4>📚 Qualifications</h4>
                    <ul class="detail-list">
                        ${job.qualifications.slice(0, 10).map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${job.responsibilities && job.responsibilities.length > 0 ? `
                <div class="detail-section">
                    <h4>💼 Responsibilities</h4>
                    <ul class="detail-list">
                        ${job.responsibilities.slice(0, 10).map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${job.benefits && job.benefits.length > 0 ? `
                <div class="detail-section">
                    <h4>🎁 Benefits</h4>
                    <ul class="detail-list">
                        ${job.benefits.slice(0, 10).map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="detail-section">
                <h4>📝 Full Description</h4>
                <div class="detail-text">${job.description}</div>
            </div>

            <div class="detail-section">
                <h4>🔗 Apply Now</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${job.apply_options.map(opt => 
                        `<a href="${opt.link}" target="_blank" rel="noopener" class="apply-link">
                            Apply at ${opt.publisher}
                        </a>`
                    ).join('')}
                </div>
            </div>
        `;

        modalBody.innerHTML = html;
        this.openModal();
    },

    openModal() {
        Utils.getElement(SELECTORS.jobModal).classList.add('active');
        Utils.getElement(SELECTORS.modalOverlay).classList.add('active');
    },

    closeModal() {
        Utils.getElement(SELECTORS.jobModal).classList.remove('active');
        Utils.getElement(SELECTORS.modalOverlay).classList.remove('active');
    }
};