package com.recruitment.users.entity;

import com.recruitment.auth.entity.User;
import com.recruitment.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recruiter_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecruiterProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "job_title", length = 120)
    private String jobTitle;

    @Column(length = 120)
    private String department;

    @Column(columnDefinition = "TEXT")
    private String bio;

    public static RecruiterProfile create(User user, Company company,
                                           String jobTitle, String department, String bio) {
        RecruiterProfile p = new RecruiterProfile();
        p.user = user;
        p.company = company;
        p.jobTitle = jobTitle;
        p.department = department;
        p.bio = bio;
        return p;
    }

    public void update(Company company, String jobTitle, String department, String bio) {
        this.company = company;
        this.jobTitle = jobTitle;
        this.department = department;
        this.bio = bio;
    }
}
