package com.sboot.moabayo.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder:}")
    private String defaultFolder;

    /** 멀티파트 업로드 → 최종 URL 반환 */
    public String upload(MultipartFile file) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "folder", defaultFolder,
                "use_filename", true,
                "unique_filename", true
            )
        );
        return (String) result.get("secure_url") != null
        	    ? (String) result.get("secure_url")
        	    : (String) result.get("url");

    }
}
