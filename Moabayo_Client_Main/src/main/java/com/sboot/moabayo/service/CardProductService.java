// com.sboot.moabayo.service.CardProductService
package com.sboot.moabayo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sboot.moabayo.dao.CardProductMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CardProductService {

    private final CardProductMapper cardProductMapper;

    @Transactional
    public void updateImageUrl(Long cardId, String imgUrl) {
        Integer exists = cardProductMapper.existsById(cardId);
        if (exists == null || exists == 0) {
            throw new IllegalArgumentException("card_id 없음: " + cardId);
        }
        int updated = cardProductMapper.updateImageUrl(cardId, imgUrl);
        if (updated != 1) {
            throw new IllegalStateException("이미지 업데이트 실패(cardId=" + cardId + ")");
        }
    }
}
