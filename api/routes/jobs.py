from flask import Blueprint, request, jsonify
from firecrawl import FirecrawlApp
from openai import OpenAI
import os

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/api/job-search', methods=['POST'])
def job_search():
    data = request.json
    role = data.get('role')
    location = data.get('location')

    if not role or not location:
        return jsonify({"error": "Role and location are required"}), 400

    try:
        # Initialize Firecrawl
        app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))
        
        # Optimize query for jobs to get better results
        # Combining role and location for a targeted search
        search_query = f"{role} jobs in {location}"
        print(f"DEBUG: Searching Firecrawl for: {search_query}")
        search_result = app.search(search_query)
        
        print(f"DEBUG: FULL SEARCH RESULT: {search_result}")
        print(f"DEBUG: Search result type: {type(search_result)}")

        # Handle SDK return type (object or dict)
        job_data = []
        if isinstance(search_result, dict):
            # If it's a dict, it might be the raw response with 'data' or already parsed
            data_field = search_result.get('data', {})
            if isinstance(data_field, dict):
                job_data = data_field.get('web', [])
            else:
                job_data = search_result.get('web', [])
        else:
            # It's likely a SearchData object from v2 SDK
            job_data = getattr(search_result, 'web', [])
        
        print(f"DEBUG: Extracted {len(job_data)} web results")

        if not job_data:
            # Fallback to other types if web is empty
            if not isinstance(search_result, dict):
                job_data = getattr(search_result, 'news', []) or getattr(search_result, 'data', [])
            else:
                job_data = search_result.get('news', []) or search_result.get('data', [])
            print(f"DEBUG: Fallback check count: {len(job_data)}")

        if not isinstance(job_data, list):
            job_data = []

        if not job_data:
            return jsonify({
                "summary": "No specific job listings were found for this query. Try being more specific (e.g., 'Software Engineer Bangalore').",
                "raw_results": []
            }), 200

        # Prepare context for AI summarization
        context = ""
        for i, job in enumerate(job_data[:5]): # Take top 5
            if isinstance(job, dict):
                title = job.get('title') or job.get('name') or 'Job'
                url = job.get('url') or job.get('link') or '#'
                content = (job.get('markdown') or job.get('description') or job.get('snippet') or job.get('content') or '')[:1000]
            else:
                title = getattr(job, 'title', None) or getattr(job, 'name', 'Job')
                url = getattr(job, 'url', None) or getattr(job, 'link', '#')
                # SearchResultWeb uses description, Document uses markdown/content
                content = (getattr(job, 'markdown', '') or getattr(job, 'description', '') or getattr(job, 'snippet', '') or getattr(job, 'content', ''))[:1000]
            
            context += f"Job {i+1}:\nTitle: {title}\nURL: {url}\nContent: {content}\n---\n"

        # Initialize OpenRouter client
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )

        # Get user skills if provided (optional for now, can be added later)
        user_skills = data.get('skills', 'Not provided')

        print(f"DEBUG: Requesting structured AI job data for {len(job_data)} jobs")
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
            return jsonify({"error": "Failed to parse AI job data"}), 500

        return jsonify({
            "summary": summary,
            "jobs": jobs_list
        }), 200

    except Exception as e:
        print(f"DEBUG ERROR in Job search: {str(e)}")
        return jsonify({"error": f"Search failed: {str(e)}"}), 500

@jobs_bp.route('/api/draft-cover-letter', methods=['POST'])
def draft_cover_letter():
    data = request.json
    job_details = data.get('job_details')
    user_skills = data.get('skills', 'Not specified')

    if not job_details:
        return jsonify({"error": "Job details are required"}), 400

    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )

        response = client.chat.completions.create(
            model="openrouter/free",
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
