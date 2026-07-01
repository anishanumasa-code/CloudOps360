import os
import google.generativeai as genai

# HARDCODED TEST (Do not push this to GitHub)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def analyze_incident(title: str, description: str, logs_context: str) -> dict:
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are a Senior Site Reliability Engineer (SRE). Analyze the following incident and system logs.
    
    Incident Title: {title}
    Incident Description: {description}
    System Logs: 
    {logs_context}

    Do not jump to a single conclusion. Provide a highly professional, multi-dimensional analysis.
    Output EXACTLY in this format using these text markers (no markdown formatting):
    EXPLANATION: (Provide an objective analysis of the root cause. Consider and list at least two potential failure points based strictly on the provided logs.)
    RECOMMENDATION: (Provide a structured troubleshooting path. Give precise diagnostic commands (Linux, Docker, SQL) to verify the root cause before applying destructive fixes.)
    """
    
    
    response = model.generate_content(prompt)
    response_text = response.text
    
    try:
        parts = response_text.split("RECOMMENDATION:")
        explanation = parts[0].replace("EXPLANATION:", "").strip()
        recommendation = parts[1].strip()
    except IndexError:
        explanation = response_text
        recommendation = "Manual intervention required. AI could not format recommendation."

    return {
        "explanation": explanation,
        "recommendation": recommendation
    }