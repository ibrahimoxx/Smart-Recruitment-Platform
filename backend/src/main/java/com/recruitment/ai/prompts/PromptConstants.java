package com.recruitment.ai.prompts;

public final class PromptConstants {

    private PromptConstants() {}

    public static final String CV_PARSING_PROMPT = """
            You are a professional CV parser. Extract structured information from the following CV text.
            Return ONLY a valid JSON object with no markdown, no code blocks, no explanation — raw JSON only.

            Required JSON fields:
            - "summary": string (2-4 sentence professional summary)
            - "skills": array of strings (technical and soft skills)
            - "experiences": array of strings (each work experience as a descriptive string including role, company, duration)
            - "education": array of strings (each degree/certificate as a descriptive string)

            CV TEXT:
            %s

            Return ONLY the JSON object.
            """;

    public static final String MATCH_SCORING_PROMPT = """
            You are an expert technical recruiter. Score how well this candidate matches the job offer.
            Return ONLY a valid JSON object with no markdown, no code blocks, no explanation — raw JSON only.

            Required JSON fields:
            - "score": integer 0-100 (overall match percentage)
            - "justification": string (2-3 sentence explanation of the score)
            - "matched_skills": array of strings (skills candidate has that the job requires)
            - "missing_skills": array of strings (skills the job requires that candidate lacks)

            CANDIDATE PROFILE (parsed CV data):
            %s

            JOB OFFER:
            Title: %s
            Description: %s
            Requirements: %s

            Return ONLY the JSON object.
            """;

    public static final String EMAIL_DRAFT_PROMPT = """
            You are a professional HR email writer. Draft an email for the following recruitment context.
            Return ONLY a valid JSON object with no markdown, no code blocks, no explanation — raw JSON only.

            Required JSON fields:
            - "subject": string (concise email subject line)
            - "body": string (full professional email body, use \\n for line breaks)
            - "tone": string (one of: "professional", "warm", "formal")

            CONTEXT:
            - Candidate name: %s
            - Job title: %s
            - Company: %s
            - Application status change: %s → %s

            Return ONLY the JSON object.
            """;
}
