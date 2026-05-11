CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(32),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidate_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    headline VARCHAR(255),
    summary TEXT,
    location VARCHAR(255),
    years_of_experience INTEGER,
    experience_level VARCHAR(32),
    skills TEXT,
    linkedin_url VARCHAR(512),
    github_url VARCHAR(512),
    portfolio_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_candidate_profiles_user UNIQUE (user_id)
);

CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    website_url VARCHAR(512),
    logo_url VARCHAR(512),
    industry VARCHAR(120),
    company_size VARCHAR(64),
    headquarters VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_companies_slug UNIQUE (slug)
);

CREATE TABLE recruiter_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    job_title VARCHAR(120),
    department VARCHAR(120),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recruiter_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_recruiter_profiles_company
        FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT uq_recruiter_profiles_user UNIQUE (user_id)
);

CREATE TABLE job_offers (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    recruiter_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    location VARCHAR(255),
    remote_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    currency VARCHAR(8),
    contract_type VARCHAR(32) NOT NULL,
    experience_level VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    closes_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_offers_company
        FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT fk_job_offers_recruiter
        FOREIGN KEY (recruiter_id) REFERENCES recruiter_profiles (id) ON DELETE CASCADE
);

CREATE TABLE applications (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL,
    job_offer_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL,
    cover_letter TEXT,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_candidate
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_job_offer
        FOREIGN KEY (job_offer_id) REFERENCES job_offers (id) ON DELETE CASCADE,
    CONSTRAINT uq_applications_candidate_job_offer UNIQUE (candidate_id, job_offer_id)
);

CREATE TABLE cv_parsed_data (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL,
    source_file_name VARCHAR(255),
    source_object_key VARCHAR(512),
    raw_text TEXT,
    parsed_summary TEXT,
    parsed_skills TEXT,
    parsed_experience TEXT,
    parsed_education TEXT,
    parsed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cv_parsed_data_candidate
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles (id) ON DELETE CASCADE
);

CREATE TABLE match_scores (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    reasoning TEXT,
    matched_skills TEXT,
    missing_skills TEXT,
    computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_match_scores_application
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
    CONSTRAINT uq_match_scores_application UNIQUE (application_id)
);

CREATE TABLE email_drafts (
    id UUID PRIMARY KEY,
    application_id UUID,
    recruiter_id UUID,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    tone VARCHAR(64),
    draft_type VARCHAR(64),
    generated_by VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_drafts_application
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE SET NULL,
    CONSTRAINT fk_email_drafts_recruiter
        FOREIGN KEY (recruiter_id) REFERENCES recruiter_profiles (id) ON DELETE SET NULL
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_refresh_tokens_token UNIQUE (token)
);

CREATE TABLE audit_events (
    id UUID PRIMARY KEY,
    user_id UUID,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_events_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_candidate_profiles_experience_level ON candidate_profiles (experience_level);
CREATE INDEX idx_recruiter_profiles_company_id ON recruiter_profiles (company_id);
CREATE INDEX idx_job_offers_company_id ON job_offers (company_id);
CREATE INDEX idx_job_offers_recruiter_id ON job_offers (recruiter_id);
CREATE INDEX idx_job_offers_status ON job_offers (status);
CREATE INDEX idx_job_offers_contract_type ON job_offers (contract_type);
CREATE INDEX idx_applications_job_offer_id ON applications (job_offer_id);
CREATE INDEX idx_applications_status ON applications (status);
CREATE INDEX idx_cv_parsed_data_candidate_id ON cv_parsed_data (candidate_id);
CREATE INDEX idx_match_scores_score ON match_scores (score);
CREATE INDEX idx_email_drafts_recruiter_id ON email_drafts (recruiter_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);
CREATE INDEX idx_audit_events_user_id ON audit_events (user_id);
CREATE INDEX idx_audit_events_event_type ON audit_events (event_type);
