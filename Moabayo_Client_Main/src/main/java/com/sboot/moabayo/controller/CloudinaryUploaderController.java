package com.sboot.moabayo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sboot.moabayo.service.CardProductService;
import com.sboot.moabayo.service.ImageService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class CloudinaryUploaderController {

    private final ImageService imageService;
    private final CardProductService cardProductService;

    /** 파일 업로드 + card_product.img 업데이트 */
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<UploadResponse> upload(
        @RequestParam("cardId") Long cardId,
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        String url = imageService.upload(file);          // 1) Cloudinary 업로드
        cardProductService.updateImageUrl(cardId, url);  // 2) DB 업데이트
        UploadResponse resp = new UploadResponse();
        resp.setUrl(url);
        return ResponseEntity.ok(resp);                  // 3) URL만 반환
    }

    @Data
    static class UploadResponse { private String url; }
}
