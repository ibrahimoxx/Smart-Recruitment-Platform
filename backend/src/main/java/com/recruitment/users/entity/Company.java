package com.recruitment.users.entity;

import com.recruitment.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "companies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Company extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "website_url", length = 512)
    private String websiteUrl;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(length = 120)
    private String industry;

    @Column(name = "company_size", length = 64)
    private String companySize;

    @Column(length = 255)
    private String headquarters;

    public static Company create(String name, String slug, String description,
                                  String websiteUrl, String industry,
                                  String companySize, String headquarters) {
        Company c = new Company();
        c.name = name;
        c.slug = slug;
        c.description = description;
        c.websiteUrl = websiteUrl;
        c.industry = industry;
        c.companySize = companySize;
        c.headquarters = headquarters;
        return c;
    }

    public void update(String name, String description, String websiteUrl,
                       String industry, String companySize, String headquarters) {
        this.name = name;
        this.description = description;
        this.websiteUrl = websiteUrl;
        this.industry = industry;
        this.companySize = companySize;
        this.headquarters = headquarters;
    }
}
