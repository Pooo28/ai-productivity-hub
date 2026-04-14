from flask import Blueprint, request, jsonify
from firecrawl import FirecrawlApp
from openai import OpenAI
import os

jobs_bp = Blueprint('jobs', __name__)

def handle_job_search():
    data = request.json
    role = data.get('role')
    location = data.get('location')

    if not role or not location:
        return jsonify({"error": "Role and location are required"}), 400

    try:
        import time
        start_time = time.time()
        
        # Initialize Firecrawl
        app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))
        
        # Optimize query for jobs to get better results
        search_query = f"{role} jobs in {location}"
        print(f"DEBUG: Searching Firecrawl for: {search_query}")
        
        # In v4.x SDK, timeout is a keyword argument. Default is 300000ms (300s).
        # We'll set it to 60000ms (60s) to balance wait time and responsiveness.
        try:
            search_result = app.search(search_query, timeout=60000)
            print(f"DEBUG: Firecrawl search completed successfully")
        except TypeError:
            # Fallback for unexpected keyword argument if SDK differs
            print(f"DEBUG: Fallback: 'timeout' argument not accepted by this SDK version.")
            search_result = app.search(search_query)
        
        search_duration = time.time() - start_time
        print(f"DEBUG: Firecrawl search took {search_duration:.2f} seconds")

        # Handle SDK return type (SearchData object in v4.x, or dict/list in older)
        job_data = []
        if hasattr(search_result, 'web') and search_result.web is not None:
            job_data = search_result.web
        elif isinstance(search_result, list):
            job_data = search_result
        elif isinstance(search_result, dict):
            job_data = search_result.get('data', {}).get('web', []) or search_result.get('web', [])
        
        print(f"DEBUG: Extracted {len(job_data)} results from search")

        if not job_data:
            return jsonify({
                "summary": "No specific job listings were found for this query. Try being more specific (e.g., 'Software Engineer Bangalore').",
                "raw_results": []
            }), 200

        # Prepare context for AI summarization
        context = ""
        for i, job in enumerate(job_data[:5]): # Take top 5
            if isinstance(job, dict):
                metadata = job.get('metadata', {})
                title = job.get('title') or job.get('name') or metadata.get('title') or 'Job'
                url = job.get('url') or job.get('link') or metadata.get('sourceURL') or '#'
                content = (job.get('markdown') or job.get('description') or job.get('snippet') or job.get('content') or '')[:1000]
            else:
                title = getattr(job, 'title', None) or getattr(job, 'name', 'Job')
                url = getattr(job, 'url', None) or getattr(job, 'link', '#')
                # SearchResultWeb uses description, Document uses markdown/content
                content = (getattr(job, 'markdown', '') or getattr(job, 'description', '') or getattr(job, 'snippet', '') or getattr(job, 'content', ''))[:1000]
            
            context += f"Job {i+1}:\nTitle: {title}\nURL: {url}\nContent: {content}\n---\n"

        # Initialize OpenRouter client
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
             return jsonify({"error": "OPENROUTER_API_KEY is missing in backend environment variables"}), 500

        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

        # Get user skills if provided (optional for now, can be added later)
        user_skills = data.get('skills', 'Not provided')

        print(f"DEBUG: Requesting structured AI job data for {len(job_data)} jobs")
        ai_start_time = time.time()
        try:
            response = client.chat.completions.create(
                model="openrouter/free",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a professional career consultant. Analyze the provided job search results and return a JSON object. "
                            "The JSON should contain a key 'jobs' which is an array of objects. "
                            "Each job object MUST have: 'company', 'role' (specific job title), 'location', 'salary_estimate', 'type' (e.g. Remote, Full-time), "
                            f"'requirements' (list of strings), 'link', and 'fit_analysis' (a brief explanation of why this job matches the user's skills: {user_skills}). "
                            "Return ONLY valid JSON."
                        )
                    },
                    {
                        "role": "user",
                        "content": f"Role: {role}\nLocation: {location}\nUser Skills: {user_skills}\n\nSearch Results:\n{context}"
                    }
                ],
                response_format={ "type": "json_object" }
            )

            ai_duration = time.time() - ai_start_time
            print(f"DEBUG: AI Processing took {ai_duration:.2f} seconds")

            import json
            raw_content = response.choices[0].message.content
            try:
                # Clean up potential markdown formatting if not strictly JSON
                if "```json" in raw_content:
                    raw_content = raw_content.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_content:
                    raw_content = raw_content.split("```")[1].split("```")[0].strip()
                
                structured_data = json.loads(raw_content)
                jobs_list = structured_data.get('jobs', [])
                summary = f"Found {len(jobs_list)} matching roles for your profile."
            except Exception as json_err:
                print(f"JSON Parse Error: {json_err}. Raw content: {raw_content}")
                raise Exception("Failed to parse AI job data")
                
        except Exception as ai_err:
            print(f"AI API Error (Rate Limit/Parse): {str(ai_err)}. Falling back to raw Firecrawl extraction.")
            jobs_list = []
            for item in job_data[:5]:
                if isinstance(item, dict):
                    meta = item.get('metadata', {})
                    title = item.get('title') or item.get('name') or meta.get('title') or 'Job'
                    url = item.get('url') or item.get('link') or meta.get('sourceURL') or '#'
                    company = meta.get('company', title.split('-')[0].strip() if '-' in title else 'Company')
                else:
                    title = getattr(item, 'title', None) or getattr(item, 'name', 'Job')
                    url = getattr(item, 'url', None) or getattr(item, 'link', '#')
                    company = title.split('-')[0].strip() if '-' in title else 'Company'
                
                jobs_list.append({
                    "company": company,
                    "role": title[:80] + "..." if len(title) > 80 else title,
                    "location": location,
                    "salary_estimate": "N/A",
                    "type": "N/A",
                    "requirements": [],
                    "link": url,
                    "fit_analysis": "AI rate limit reached. Raw result provided directly from search engine."
                })
            summary = f"Found {len(jobs_list)} matching roles (bypassed AI sorting due to API daily limits)."

        return jsonify({
            "summary": summary,
            "jobs": jobs_list
        }), 200

    except Exception as e:
        print(f"DEBUG ERROR in Job search: {str(e)}")
        return jsonify({"error": f"Search failed: {str(e)}"}), 500

def handle_cover_letter_draft():
    data = request.json
    job_details = data.get('job_details')
    user_skills = data.get('skills', 'Not specified')

    if not job_details:
        return jsonify({"error": "Job details are required"}), 400

    try:
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
             return jsonify({"error": "OPENROUTER_API_KEY is missing in backend environment variables"}), 500

        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert career coach. Write a concise, professional, and compelling cover letter or application message for the provided job based on the user's skills. Keep it under 200 words and focus on high impact."
                },
                {
                    "role": "user",
                    "content": f"Job: {job_details}\nUser Skills: {user_skills}"
                }
            ]
        )

        draft = response.choices[0].message.content or "Could not generate draft."
        return jsonify({"draft": draft}), 200

    except Exception as e:
        print(f"DEBUG ERROR in Cover Letter draft: {str(e)}")
        return jsonify({"error": f"Draft failed: {str(e)}"}), 500
