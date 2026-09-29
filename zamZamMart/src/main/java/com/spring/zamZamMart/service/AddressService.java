package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.Address;
import com.spring.zamZamMart.entity.User;
import com.spring.zamZamMart.exception.ResourceNotFoundException;
import com.spring.zamZamMart.repository.AddressRepository;
import com.spring.zamZamMart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Address> getUserAddresses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
    }

    @Transactional
    public Address addAddress(Address address, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        address.setUser(user);
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            clearDefaultAddress(user.getId());
        }
        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long addressId, String email) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
        if (!address.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Unauthorized to delete this address");
        }
        addressRepository.delete(address);
    }

    @Transactional
    public Address setDefaultAddress(Long addressId, String email) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
        if (!address.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Unauthorized to update this address");
        }

        clearDefaultAddress(address.getUser().getId());
        address.setIsDefault(true);
        return addressRepository.save(address);
    }

    private void clearDefaultAddress(Long userId) {
        List<Address> list = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        for (Address a : list) {
            if (Boolean.TRUE.equals(a.getIsDefault())) {
                a.setIsDefault(false);
                addressRepository.save(a);
            }
        }
    }
}
