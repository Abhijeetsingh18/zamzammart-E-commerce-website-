package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.service.AiGroceryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiController {

    @Autowired
    private AiGroceryService aiGroceryService;

    @PostMapping({"/assistant", "/solve-basket"})
    public ResponseEntity<?> solveBasket(@RequestBody Map<String, Object> body) {
        String prompt = body.get("prompt") != null ? body.get("prompt").toString() : "";

        BigDecimal budget = new BigDecimal("1000.00");
        if (body.get("budget") != null) {
            try {
                budget = new BigDecimal(body.get("budget").toString());
            } catch (Exception ignored) {}
        }

        String dietary = body.get("dietaryPreference") != null ? body.get("dietaryPreference").toString() : "ALL";
        Integer familySize = body.get("familySize") != null ? Integer.valueOf(body.get("familySize").toString()) : 4;

        Map<String, Object> result = aiGroceryService.solveGroceryBasket(prompt, budget, dietary, familySize);
        return ResponseEntity.ok(new ApiResponse(true, "Smart grocery basket generated successfully", result));
    }
}
