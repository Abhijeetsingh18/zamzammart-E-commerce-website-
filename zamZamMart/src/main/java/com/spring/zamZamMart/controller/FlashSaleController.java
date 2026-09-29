package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.FlashSale;
import com.spring.zamZamMart.service.FlashSaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class FlashSaleController {

    @Autowired
    private FlashSaleService flashSaleService;

    @GetMapping("/api/flash-sales/current")
    public ResponseEntity<?> getCurrentFlashSale() {
        Optional<FlashSale> sale = flashSaleService.getCurrentActiveFlashSale();
        if (sale.isPresent()) {
            return ResponseEntity.ok(new ApiResponse(true, "Active flash sale found", sale.get()));
        }
        return ResponseEntity.ok(new ApiResponse(true, "No active flash sale at this time", null));
    }

    @PostMapping("/api/admin/flash-sales")
    public ResponseEntity<?> createFlashSale(@RequestBody FlashSale flashSale) {
        FlashSale created = flashSaleService.createFlashSale(flashSale);
        return ResponseEntity.ok(new ApiResponse(true, "Flash sale scheduled successfully", created));
    }
}
