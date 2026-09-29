package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class AiGroceryService {

    @Autowired
    private ProductRepository productRepository;

    public Map<String, Object> solveGroceryBasket(String prompt, BigDecimal budget, String dietaryPreference, Integer familySize) {
        BigDecimal targetBudget = budget != null ? budget : new BigDecimal("1000.00");
        int people = familySize != null ? familySize : 4;
        String q = prompt != null ? prompt.toLowerCase() : "";

        List<Product> allProducts = productRepository.findAll();
        List<Product> candidateProducts = new ArrayList<>();

        for (Product p : allProducts) {
            if (p.getStockQuantity() == null || p.getStockQuantity() <= 0) continue;
            if (Boolean.TRUE.equals(p.getIsDeleted())) continue;

            if ("HALAL".equalsIgnoreCase(dietaryPreference) && !Boolean.TRUE.equals(p.getIsHalal())) {
                continue;
            }
            if ("VEGETARIAN".equalsIgnoreCase(dietaryPreference)) {
                String catName = p.getCategory() != null ? p.getCategory().getName().toLowerCase() : "";
                if (catName.contains("meat") || catName.contains("poultry") || catName.contains("chicken") || catName.contains("mutton")) {
                    continue;
                }
            }
            candidateProducts.add(p);
        }

        candidateProducts.sort((a, b) -> {
            int scoreA = calculateRelevance(a, q);
            int scoreB = calculateRelevance(b, q);
            return Integer.compare(scoreB, scoreA);
        });

        BigDecimal totalCost = BigDecimal.ZERO;
        List<Map<String, Object>> basketItems = new ArrayList<>();

        for (Product p : candidateProducts) {
            BigDecimal price = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
            if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) continue;

            int quantity = people > 4 ? 2 : 1;
            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(quantity));

            if (totalCost.add(itemTotal).compareTo(targetBudget) <= 0) {
                totalCost = totalCost.add(itemTotal);

                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("product", p);
                itemMap.put("quantity", quantity);
                itemMap.put("unitPrice", price);
                itemMap.put("subtotal", itemTotal);
                basketItems.add(itemMap);
            }

            if (basketItems.size() >= 6) break;
        }

        BigDecimal savings = targetBudget.subtract(totalCost).max(BigDecimal.ZERO);

        String mealTitle = "Balanced Fresh Grocery & Meal Kit";
        String cookingTips = "Wash all fresh produce thoroughly before cooking. For meats, marinate with pure spices for 30 minutes to lock in flavors.";
        if (q.contains("biryani")) {
            mealTitle = "Royal ZamZam Dum Biryani Feast";
            cookingTips = "Layer half-cooked Basmati rice over slow-cooked marinated chicken/mutton with pure desi ghee for an authentic aroma.";
        } else if (q.contains("breakfast")) {
            mealTitle = "Farm Fresh Organic Breakfast Basket";
            cookingTips = "Pair country eggs with toasted artisan breads and fresh fruit slices for a protein-rich morning.";
        } else if (q.contains("dinner") || q.contains("curry")) {
            mealTitle = "Wholesome Family Dinner Curry Set";
            cookingTips = "Sauté finely diced onions in golden ghee until golden brown before adding spices and curry cut pieces.";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("mealTitle", mealTitle);
        response.put("summary", "Optimized " + basketItems.size() + " fresh database items for " + people + " portions within your budget.");
        response.put("budgetAllocated", targetBudget);
        response.put("totalCost", totalCost);
        response.put("savingsRemaining", savings);
        response.put("cookingTips", cookingTips);
        response.put("items", basketItems);

        return response;
    }

    private int calculateRelevance(Product p, String query) {
        int score = 0;
        String name = p.getName() != null ? p.getName().toLowerCase() : "";
        String desc = p.getDescription() != null ? p.getDescription().toLowerCase() : "";
        String cat = p.getCategory() != null ? p.getCategory().getName().toLowerCase() : "";
        String brand = p.getBrand() != null ? p.getBrand().toLowerCase() : "";

        if (query.isEmpty()) return Boolean.TRUE.equals(p.getIsFeatured()) ? 10 : 5;

        for (String word : query.split("\\s+")) {
            if (word.length() < 3) continue;
            if (name.contains(word)) score += 15;
            if (cat.contains(word)) score += 10;
            if (brand.contains(word)) score += 10;
            if (desc.contains(word)) score += 5;
        }

        if (Boolean.TRUE.equals(p.getIsFeatured())) score += 2;
        return score;
    }
}
