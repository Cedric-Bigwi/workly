# 💼 Workly - Find Your Next Job, Then Know the Company

> **Where Careers Meet Insight** - A unified platform that helps job seekers discover opportunities and instantly access company intelligence through real-time news aggregation.

![Status](https://img.shields.io/badge/Status-Deployed-brightgreen)

![Version](https://img.shields.io/badge/Version-1.0-blue)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features in Detail](#features-in-detail)
- [Challenges & Solutions](#challenges--solutions)
- [Credits & Attribution](#credits--attribution)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Workly** solves a critical gap in the job search process. While job boards show you positions, they don't help you understand the companies behind them. Workly combines **real-time job listings** with **live company news**, enabling job seekers to make informed decisions instantly.

Users can:
- 🔍 Search for jobs using natural language
- 📰 View real-time news about companies
- 🌐 Filter news by language (5 languages supported)
- ⏰ Filter news by time period
- 🌓 Toggle between light/dark themes
- 📱 Enjoy a fully responsive, mobile-friendly interface

---

## ✨ Features

### Core Functionality
- **Intelligent Job Search**: Natural language processing for flexible job queries
- **Real-Time News Integration**: Fetch company news from multiple sources
- **Multi-Language Support**: English, French, Spanish, German, Japanese
- **Advanced Filtering**: Time-based news filtering (1 day, 7 days, 1 month, 1 year, anytime)
- **Responsive Pagination**: Browse 1 item per page with intuitive navigation

### User Experience
- **Dark Mode Toggle**: Beautiful light/dark theme switching with persistence
- **Intuitive Navigation**: Floating menu for quick access to app info
- **Error Handling**: Comprehensive error messages and graceful fallbacks
- **Modern UI**: Gradient designs, smooth animations, professional styling
- **Mobile Optimized**: Fully responsive design for all devices

### Technical Features
- **Load Balanced Deployment**: HAProxy distributing traffic across 2 web servers
- **Modular JavaScript**: Clean, maintainable code architecture
- **Secure API Key Handling**: Environment-based configuration
- **CORS Enabled**: Proper cross-origin request handling

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6 Modules) |
| **Backend** | Python 3, HTTP Server (ThreadingHTTPServer) |
| **Load Balancing** | HAProxy |
| **Web Server** | Nginx |
| **Deployment** | Ubuntu 20.04 LTS, AWS EC2 |
| **APIs** | JSearch (RapidAPI), Real-Time News Data (RapidAPI) |

---

## 📦 Prerequisites

### Local Development
- **Python 3.8+**
- **pip** (Python package manager)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** (for API calls)

### Deployment
- **Ubuntu 20.04 LTS** servers
- **Nginx** (reverse proxy)
- **HAProxy** (load balancer)
- **Python 3.8+**
- **Valid API keys** for JSearch and Real-Time News Data

---

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Cedric-Bigwi/workly.git
cd workly
```

### 2. Create Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

Add your API keys:
```env
JSEARCH_HOST=jsearch.p.rapidapi.com
JSEARCH_KEY=your_jsearch_api_key_here

NEWS_HOST=real-time-news-data.p.rapidapi.com
NEWS_KEY=your_news_api_key_here

PORT=8000
```

### 5. Run the Application Locally

```bash
python3 server.py
```

Open your browser and navigate to: **http://localhost:8000**

---

## 🌐 Deployment

### Architecture Overview

```
Internet
    ↓
www.bigwi.tech (18.207.223.168)
    ↓
HAProxy Load Balancer (lb-01)
    ↓
    ├─→ Nginx Web Server 1 (web-01: 3.82.220.109)
    │       ↓
    │   Python App (Port 8000)
    │
    └─→ Nginx Web Server 2 (web-02: 13.221.82.220)
            ↓
        Python App (Port 8000)
```

### Deployment Steps

#### Step 1: Prepare Deployment Scripts

Create `deploy.sh`:
```bash
#!/bin/bash
WEB_01_IP="3.82.220.109"
WEB_02_IP="13.221.82.220"
PRIVATE_KEY="$HOME/.ssh/your-key.pem"
PROJECT_DIR="/path/to/workly"
REMOTE_PATH="/var/www/workly"

deploy_to_server() {
    local SERVER_IP=$1
    local SERVER_NAME=$2
    echo "📤 Deploying to $SERVER_NAME..."
    ssh -i "$PRIVATE_KEY" ubuntu@$SERVER_IP "sudo mkdir -p $REMOTE_PATH && sudo chown ubuntu:ubuntu $REMOTE_PATH"
    scp -i "$PRIVATE_KEY" -r "$PROJECT_DIR"/* ubuntu@$SERVER_IP:$REMOTE_PATH/
    ssh -i "$PRIVATE_KEY" ubuntu@$SERVER_IP "cd $REMOTE_PATH && chmod -R 755 ."
    echo "✅ $SERVER_NAME complete"
}

deploy_to_server "$WEB_01_IP" "web-01"
deploy_to_server "$WEB_02_IP" "web-02"
```

#### Step 2: Configure Nginx (on each web server)

SSH into each server and update `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /var/www/workly;
    
    location /static/ {
        alias /var/www/workly/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Served-By $hostname always;
}
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

#### Step 3: Create Systemd Service

On each web server, create `/etc/systemd/system/workly.service`:

```ini
[Unit]
Description=Workly Jobs & News App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/workly
ExecStart=/usr/bin/python3 /var/www/workly/server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable workly
sudo systemctl start workly
```

#### Step 4: Verify HAProxy Configuration

The load balancer should have:
```haproxy
backend balancer_http_out
    balance roundrobin
    server web-01 3.82.220.109:80 check
    server web-02 13.221.82.220:80 check
    http-response set-header X-Served-By %[srv_name]
```

#### Step 5: Access Your Application

- **Via Load Balancer**: http://www.bigwi.tech
---

## 📡 API Documentation

### JSearch API
- **Endpoint**: https://rapidapi.com/laimoon/api/jsearch
- **Purpose**: Fetch real-time job listings
- **Parameters**:
  - `query`: Job search query
  - `page`: Page number
  - `num_pages`: Number of pages to fetch
- **Response**: Job listings with titles, companies, salaries, descriptions

**Example**:
```bash
curl -X GET "https://jsearch.p.rapidapi.com/search?query=python%20developer" \
  -H "X-RapidAPI-Key: YOUR_KEY" \
  -H "X-RapidAPI-Host: jsearch.p.rapidapi.com"
```

### Real-Time News Data API
- **Endpoint**: https://rapidapi.com/belchiorarkad/api/real-time-news-data
- **Purpose**: Fetch company news articles
- **Parameters**:
  - `query`: Company or topic name
  - `limit`: Number of articles
  - `time_published`: Filter by time (1d, 7d, 1m, 1y, anytime)
  - `country`: Country code (US, FR, ES, DE, JP)
  - `lang`: Language code (en, fr, es, de, ja)

**Example**:
```bash
curl -X GET "https://real-time-news-data.p.rapidapi.com/search?query=Apple&limit=10&time_published=7d" \
  -H "X-RapidAPI-Key: YOUR_KEY" \
  -H "X-RapidAPI-Host: real-time-news-data.p.rapidapi.com"
```

### Workly Server Endpoints

#### Search Jobs
```
GET /api/search_jobs?q=<query>&page=<page>
```
Returns: Array of job listings

#### Search News
```
GET /api/search_news?q=<query>&limit=<limit>&country=<country>&lang=<lang>&time_published=<time>
```
Returns: Array of news articles

---

## 📁 Project Structure

```
workly/
├── 📄 index.html                 # Main HTML template
├── 📄 server.py                  # Python backend server
├── 📄 requirements.txt           # Python dependencies
├── 📄 .env.example               # Environment template
├── 📄 .gitignore                 # Git ignore rules
├── 📄 README.md                  # This file
│
└── static/
    ├── css/
    │   └── styles.css            # All styling (900+ lines)
    │
    ├── js/
    │   ├── app.js                # Main controller & event listeners
    │   ├── state.js              # Config, constants, utilities
    │   ├── api.js                # API communication layer
    │   ├── jobs.js               # Job rendering & modals
    │   ├── news.js               # News rendering & filters
    │   └── ui.js                 # UI utilities & theme management
    │
    └── icons/
        ├── logo.png              # Workly logo
        └── workly-icon.svg       # Favicon
```

---
## 🎨 Features in Detail

### 1. Natural Language Job Search
Users can search with conversational queries:
- "Senior Python developer remote"
- "React engineer in NYC with 100k+"
- "Entry-level jobs in Chicago"

### 2. Real-Time Company News
Click "Company News" on any job to see:
- Latest articles from reliable news sources
- Publication dates and sources
- Direct links to full articles

### 3. Multi-Language News
Switch between 5 languages:
- 🇺🇸 English (default)
- 🇫🇷 French
- 🇪🇸 Spanish
- 🇩🇪 German
- 🇯🇵 Japanese

### 4. Time-Based Filtering
Filter news by recency:
- Last 24 Hours
- Last 7 Days
- Last Month
- Last Year
- Anytime

### 5. Dark Mode
- Beautiful dark theme for night browsing
- Persists user preference in localStorage
- One-click toggle in bottom-right corner

### 6. Pagination
- 1 job per page (10 total jobs)
- 1 news article per page
- All page numbers visible
- Smooth scrolling between pages

---

## 🔧 Challenges & Solutions

### Challenge 1: API Rate Limiting
**Problem**: News API would timeout with too many requests

**Solution**: 
- Implemented caching logic
- Added proper error handling with user feedback
- Fall back to fallback queries (company name → job title)

### Challenge 2: Mobile Responsiveness
**Problem**: Pagination buttons were cramped on mobile

**Solution**:
- Reduced button padding on small screens
- Made filters stack vertically
- Adjusted font sizes responsively

### Challenge 3: State Management
**Problem**: App state was scattered across multiple files

**Solution**:
- Created centralized state.js
- Used ES6 modules for clean imports
- Made appState global for onclick handlers

### Challenge 4: Dark Mode Implementation
**Problem**: Theme switching was flickering

**Solution**:
- Store preference in localStorage
- Apply theme immediately on page load
- Use CSS variables for easy switching

### Challenge 5: Load Balancer Configuration
**Problem**: Sticky sessions weren't needed but traffic distribution was uneven

**Solution**:
- Configured HAProxy with round-robin balancing
- Set proper health checks on backends
- Added X-Served-By headers for debugging

---

## 🙏 Credits & Attribution

### APIs Used
- **JSearch API** by Laimoon (RapidAPI)
  - Endpoint: https://rapidapi.com/laimoon/api/jsearch
  - Used for real-time job listings

- **Real-Time News Data API** by Belchior Arkad (RapidAPI)
  - Endpoint: https://rapidapi.com/belchiorarkad/api/real-time-news-data
  - Used for company news aggregation

### Tools & Libraries
- **Python**: Server framework and API handling
- **Nginx**: Reverse proxy and web server
- **HAProxy**: Load balancing and traffic distribution
- **ES6 JavaScript**: Frontend interactivity

### Inspiration & Resources
- Design inspired by: [interaction_check](https://github.com/waka-man/interaction_check)
- Styling patterns from modern web design best practices
- Load balancing architecture based on industry standards

### AI Assistance
- **ChatGPT (OpenAI)**: Used for debugging, error handling patterns, and documentation.
- **Google Gemini**: Used for code optimization and deployment strategies.
- **Claude (Anthropic)**: Assisted with architectural decisions, performance tuning, and workflow improvements.

### Personal Development
- All core functionality designed and implemented independently
- Custom modular architecture with clean separation of concerns
- Unique feature combinations and user experience enhancements

---

## 🤝 Contributing

While this is a course project, feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or feedback:
- 📧 Email: c.bigwinhin@alustudent.com
- 🐛 Report bugs via GitHub Issues
- 💡 Suggest features via GitHub Discussions

---

## 🚀 Quick Links

- **Live Application**: http://www.bigwi.tech
- **GitHub Repository**: https://github.com/yourusername/workly
- **API Documentation**: [JSearch](https://rapidapi.com/laimoon/api/jsearch), [Real-Time News](https://rapidapi.com/belchiorarkad/api/real-time-news-data)
- **Demo Video**: (https://youtu.be/YHt3W2CZKVk)

---


**Made with ❤️ by Cedric BIGWI HINDURA - 2025**
