ALTER TABLE candidate_profiles
    ADD COLUMN cv_object_key VARCHAR(512),
    ADD COLUMN cv_original_filename VARCHAR(255),
    ADD COLUMN cv_uploaded_at TIMESTAMP WITH TIME ZONE;
