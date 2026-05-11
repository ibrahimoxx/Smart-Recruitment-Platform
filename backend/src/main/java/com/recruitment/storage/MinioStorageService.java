package com.recruitment.storage;

import com.recruitment.common.config.MinioProperties;
import com.recruitment.common.exception.AppException;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MinioStorageService implements StorageService {

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    @Override
    public String uploadFile(String bucket, String objectKey, InputStream inputStream, long size, String contentType) {
        try {
            ensureBucketExists(bucket);
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .stream(inputStream, size, -1)
                    .contentType(contentType)
                    .build());
            return objectKey;
        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Storage error: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String bucket, String objectKey) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Storage error: " + e.getMessage());
        }
    }

    @Override
    public String getPresignedUrl(String bucket, String objectKey, int expirySeconds) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .method(Method.GET)
                    .expiry(expirySeconds, TimeUnit.SECONDS)
                    .build());
        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Storage error: " + e.getMessage());
        }
    }

    private void ensureBucketExists(String bucket) throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }
    }
}
