package com.recruitment.storage;

import java.io.InputStream;

public interface StorageService {
    String uploadFile(String bucket, String objectKey, InputStream inputStream, long size, String contentType);
    InputStream downloadFile(String bucket, String objectKey);
    void deleteFile(String bucket, String objectKey);
    String getPresignedUrl(String bucket, String objectKey, int expirySeconds);
}
