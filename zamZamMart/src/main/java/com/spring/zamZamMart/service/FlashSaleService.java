package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.FlashSale;
import com.spring.zamZamMart.repository.FlashSaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class FlashSaleService {

    @Autowired
    private FlashSaleRepository flashSaleRepository;

    public Optional<FlashSale> getCurrentActiveFlashSale() {
        return flashSaleRepository.findFirstByActiveTrueAndEndTimeAfterOrderByEndTimeAsc(LocalDateTime.now());
    }

    public FlashSale createFlashSale(FlashSale flashSale) {
        return flashSaleRepository.save(flashSale);
    }
}
