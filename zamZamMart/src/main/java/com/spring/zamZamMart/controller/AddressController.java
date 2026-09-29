package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.Address;
import com.spring.zamZamMart.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class AddressController {

    @Autowired
    private AddressService addressService;

    @GetMapping({"/api/users/addresses", "/api/addresses"})
    public ResponseEntity<?> getUserAddresses(Authentication authentication, @RequestParam(required = false) String email) {
        String targetEmail = authentication != null ? authentication.getName() : email;
        if (targetEmail == null || targetEmail.trim().isEmpty()) {
            return ResponseEntity.ok(new ApiResponse(true, "No authenticated user", List.of()));
        }
        List<Address> list = addressService.getUserAddresses(targetEmail);
        return ResponseEntity.ok(new ApiResponse(true, "Addresses retrieved", list));
    }

    @PostMapping({"/api/users/addresses", "/api/addresses"})
    public ResponseEntity<?> addAddress(@RequestBody Address address, Authentication authentication, @RequestParam(required = false) String email) {
        String targetEmail = authentication != null ? authentication.getName() : email;
        if (targetEmail == null || targetEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Authentication or email required to save address"));
        }
        Address saved = addressService.addAddress(address, targetEmail);
        return ResponseEntity.ok(new ApiResponse(true, "Address saved successfully", saved));
    }

    @DeleteMapping({"/api/users/addresses/{id}", "/api/addresses/{id}"})
    public ResponseEntity<?> deleteAddress(@PathVariable Long id, Authentication authentication, @RequestParam(required = false) String email) {
        String targetEmail = authentication != null ? authentication.getName() : email;
        if (targetEmail == null || targetEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Authentication required"));
        }
        addressService.deleteAddress(id, targetEmail);
        return ResponseEntity.ok(new ApiResponse(true, "Address removed successfully"));
    }

    @PutMapping({"/api/users/addresses/{id}/default", "/api/addresses/{id}/default"})
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long id, Authentication authentication, @RequestParam(required = false) String email) {
        String targetEmail = authentication != null ? authentication.getName() : email;
        if (targetEmail == null || targetEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Authentication required"));
        }
        Address updated = addressService.setDefaultAddress(id, targetEmail);
        return ResponseEntity.ok(new ApiResponse(true, "Default address set successfully", updated));
    }
}
