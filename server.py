#!/usr/bin/env python3

import os
import json
import urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import requests
from typing import Dict, List, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
    
except:
    pass

JSEARCH_HOST = os.getenv("JSEARCH_HOST", "jsearch.p.rapidapi.com")
JSEARCH_KEY = os.getenv("JSEARCH_KEY", "")
NEWS_HOST = os.getenv("NEWS_HOST", "real-time-news-data.p.rapidapi.com")
NEWS_KEY = os.getenv("NEWS_KEY", "")
PORT = int(os.getenv("PORT", "8000"))

class JobSearchHandler:
    
    @staticmethod
    def search(query: str, page: int = 1, num_pages: int = 1) -> Dict[str, Any]:
        if not JSEARCH_KEY:
            return JobSearchHandler.generate_mock_jobs(query, page)
        
        url = f"https://{JSEARCH_HOST}/search"
        headers = {
            "X-RapidAPI-Key": JSEARCH_KEY,
            "X-RapidAPI-Host": JSEARCH_HOST
        }
        params = {
            "query": query,
            "page": page,
            "num_pages": num_pages
        }
        
        try:
            r = requests.get(url, headers=headers, params=params, timeout=15)
            r.raise_for_status()
            data = r.json()
            
            if data.get("status") != "OK":
                return {"error": "API returned non-OK status"}
            
            jobs = []
            for job in data.get("data", []):
                jobs.append(JobSearchHandler.normalize_job(job))
            
            return {
                "source": "jsearch",
                "query": query,
                "page": page,
                "total": len(jobs),
                "results": jobs
            }
        except requests.Timeout:
            return {"error": "API timeout - try again"}
        except Exception as e:
            return {"error": str(e)}
    
    @staticmethod
    def normalize_job(job: Dict) -> Dict:
        return {
            "id": job.get("job_id", ""),
            "title": job.get("job_title", "Untitled"),
            "company": job.get("employer_name", "Unknown"),
            "location": job.get("job_location", "Not specified"),
            "is_remote": job.get("job_is_remote", False),
            "employment_type": job.get("job_employment_type", "Full-time"),
            "posted": job.get("job_posted_at", "Recently"),
            "posted_utc": job.get("job_posted_at_datetime_utc", ""),
            "description": job.get("job_description", "No description"),
            "salary": job.get("job_salary", "Not specified"),
            "min_salary": job.get("job_min_salary", "Not specified"),
            "max_salary": job.get("job_max_salary", "Not specified"),
            "salary_period": job.get("job_salary_period", "YEAR"),
            "apply_link": job.get("job_apply_link", ""),
            "apply_options": JobSearchHandler.extract_apply_options(job),
            "qualifications": JobSearchHandler.extract_from_highlights(job, "Qualifications"),
            "responsibilities": JobSearchHandler.extract_from_highlights(job, "Responsibilities"),
            "benefits": JobSearchHandler.extract_from_highlights(job, "Benefits"),
            "company_logo": job.get("employer_logo", ""),
            "company_website": job.get("employer_website", ""),
            "google_link": job.get("job_google_link", "")
        }
    
    @staticmethod
    def extract_apply_options(job: Dict) -> List[Dict]:
        options = []
        for option in job.get("apply_options", []):
            options.append({
                "publisher": option.get("publisher", ""),
                "link": option.get("apply_link", ""),
                "is_direct": option.get("is_direct", False)
            })
        return options
    
    @staticmethod
    def extract_from_highlights(job: Dict, section: str) -> List[str]:
        highlights = job.get("job_highlights", {})
        return highlights.get(section, [])
    
    @staticmethod
    def generate_mock_jobs(query: str, page: int) -> Dict:
        mock_jobs = [
            {
                "id": f"mock-{i}",
                "title": f"Senior {query.split()[0] if query else 'Software'} Engineer",
                "company": f"TechCorp {i}",
                "location": ["Remote", "New York", "San Francisco", "London"][i % 4],
                "is_remote": i % 2 == 0,
                "employment_type": "Full-time",
                "posted": "2 days ago",
                "description": f"We're looking for a talented {query} professional...",
                "salary": None,
                "min_salary": 100000 + i*10000,
                "max_salary": 150000 + i*10000,
                "salary_period": "YEAR",
                "apply_link": "https://example.com/apply",
                "apply_options": [
                    {"publisher": "LinkedIn", "link": "https://linkedin.com", "is_direct": False},
                    {"publisher": "Company Site", "link": "https://company.com", "is_direct": True}
                ],
                "qualifications": ["Bachelor's degree", "5+ years experience", "Problem solving"],
                "responsibilities": ["Design systems", "Lead team", "Code reviews"],
                "benefits": ["Health insurance", "401k", "Remote work"],
                "company_logo": "",
                "company_website": "https://example.com",
                "google_link": ""
            }
            for i in range(1, 21)
        ]
        return {"source": "mock", "query": query, "page": page, "total": 20, "results": mock_jobs}

class NewsHandler:
    
    @staticmethod
    def search_news(query: str, limit: int = 10, time_published: str = "anytime", country: str = "US", lang: str = "en") -> Dict[str, Any]:
        if not NEWS_KEY:
            return NewsHandler.generate_mock_news(query, limit)
        
        url = f"https://{NEWS_HOST}/search"
        headers = {
            "X-RapidAPI-Key": NEWS_KEY,
            "X-RapidAPI-Host": NEWS_HOST
        }
        params = {
            "query": query,
            "limit": limit,
            "time_published": time_published,
            "country": country,
            "lang": lang
        }

        try:
            r = requests.get(url, headers=headers, params=params, timeout=15)
            r.raise_for_status()
            data = r.json()
            
            if data.get("status") != "OK":
                return {"news_available": False, "articles": []}
            
            articles = []
            for article in data.get("data", []):
                articles.append(NewsHandler.normalize_article(article))
            
            return {
                "source": "news_api",
                "query": query,
                "news_available": len(articles) > 0,
                "articles": articles
            }
        except Exception as e:
            return {"error": str(e), "news_available": False, "articles": []}
    
    @staticmethod
    def normalize_article(article: Dict) -> Dict:
        return {
            "id": article.get("article_id", ""),
            "title": article.get("title", "Untitled"),
            "source_name": article.get("source_name", "Unknown"),
            "source_url": article.get("source_url", ""),
            "published": article.get("published_datetime_utc", ""),
            "summary": article.get("snippet", ""),
            "image": article.get("photo_url", "") or article.get("thumbnail_url", ""),
            "link": article.get("link", ""),
            "author": article.get("authors", [""])[0] if article.get("authors") else ""
        }
    
    @staticmethod
    def generate_mock_news(query: str, limit: int) -> Dict:
        mock_articles = [
            {
                "id": f"mock-{i}",
                "title": f"Latest news about {query} - Article {i}",
                "source_name": ["TechNews", "BusinessDaily", "NewsHub", "MediaCorp"][i % 4],
                "source_url": f"https://news.example{i}.com",
                "published": "2 hours ago",
                "summary": f"Breaking news regarding {query}: Companies are advancing their initiatives...",
                "image": "",
                "link": f"https://example.com/article/{i}",
                "author": "News Team"
            }
            for i in range(1, limit + 1)
        ]
        return {
            "source": "mock",
            "query": query,
            "news_available": True,
            "articles": mock_articles
        }

class JobNewsHTTPHandler(SimpleHTTPRequestHandler):
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)
        
        if path == "/api/search_jobs":
            query = qs.get("q", [""])[0]
            page = int(qs.get("page", ["1"])[0])
            
            if not query:
                return self.send_json({"error": "Query parameter required"}, 400)
            
            result = JobSearchHandler.search(query)
            return self.send_json(result)
        
        if path == "/api/search_news":
            query = qs.get("q", [""])[0]
            limit = int(qs.get("limit", ["10"])[0])
            time_published = qs.get("time_published", ["anytime"])[0]
            country = qs.get("country", ["US"])[0]
            lang = qs.get("lang", ["en"])[0]
            
            if not query:
                return self.send_json({"error": "Query parameter required"}, 400)
            
            result = NewsHandler.search_news(query, limit, time_published, country, lang)
            return self.send_json(result)
        
        if path == "/" or path == "":
            self.path = "/index.html"
        elif not path.startswith("/api/"):
            if not path.startswith("/static/"):
                self.path = "/index.html"
        
        return super().do_GET()
    
    def send_json(self, data, status=200):
        raw = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

def start_server():
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    addr = ("0.0.0.0", PORT)
    print(f" Server: http://0.0.0.0:{PORT}")
    print(f" JSearch: {' SET' if JSEARCH_KEY else ' NOT SET'}")
    print(f" News API: {' SET' if NEWS_KEY else ' NOT SET'}")
    
    server = ThreadingHTTPServer(addr, JobNewsHTTPHandler)
    try:
        server.serve_forever()

    except KeyboardInterrupt:

        print("\n\n Shutting down server...")
        server.server_close()

if __name__ == "__main__":
    start_server()