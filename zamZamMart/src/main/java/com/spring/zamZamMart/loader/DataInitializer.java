package com.spring.zamZamMart.loader;

import com.spring.zamZamMart.entity.*;
import com.spring.zamZamMart.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Purge any fake customer accounts and demo orders
        userRepository.findByEmail("customer@zamzammart.com").ifPresent(user -> {
            try {
                orderRepository.findByUserIdOrderByOrderDateDesc(user.getId()).forEach(orderRepository::delete);
            } catch (Exception ignored) {}
            userRepository.delete(user);
        });
        userRepository.findByEmail("admin@zamzammart.com").ifPresent(userRepository::delete);
        try {
            orderRepository.findByOrderNumber("ZZM-DEMO99").ifPresent(orderRepository::delete);
        } catch (Exception ignored) {}

        // Ensure real admin account with abhijeet@7890
        User realAdmin = userRepository.findByEmail("zamzammart08@gmail.com").orElse(null);
        if (realAdmin == null) {
            realAdmin = new User(
                    "ZamZam Admin",
                    "zamzammart08@gmail.com",
                    passwordEncoder.encode("abhijeet@7890"),
                    "+91 9876543210",
                    "ZamZam Mart HQ, Central Avenue",
                    Role.ROLE_ADMIN
            );
        } else {
            realAdmin.setName("ZamZam Admin");
            realAdmin.setPassword(passwordEncoder.encode("abhijeet@7890"));
            realAdmin.setRole(Role.ROLE_ADMIN);
        }
        userRepository.save(realAdmin);

        if (categoryRepository.count() == 0) {
            initData();
        }
    }

    private void initData() {
        System.out.println(">>> Initializing ZamZam Mart default data (Real Customers Only)...");

        // 1. Seed Categories
        Category catProduce = categoryRepository.save(new Category(
                "Fresh Fruits & Vegetables",
                "fruits-vegetables",
                "Farm-fresh crisp vegetables and organic juicy fruits",
                "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
                "Apple"
        ));

        Category catMeat = categoryRepository.save(new Category(
                "ZamZam Meats & Poultry",
                "zamzam-meats",
                "100% Certified fresh ZamZam chicken, mutton, and cuts",
                "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80",
                "Beef"
        ));

        Category catDairy = categoryRepository.save(new Category(
                "Dairy & Farm Eggs",
                "dairy-eggs",
                "Pure cow milk, organic ghee, butter, paneer, and farm eggs",
                "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
                "Milk"
        ));

        Category catBakery = categoryRepository.save(new Category(
                "Bakery & Delights",
                "bakery-delights",
                "Freshly baked bread, pita, sweet baklava, and croissants",
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
                "Croissant"
        ));

        Category catPantry = categoryRepository.save(new Category(
                "Rice, Spices & Pantry",
                "pantry-spices",
                "Aromatic Basmati rice, authentic spices, cold-pressed oils",
                "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
                "CookingPot"
        ));

        Category catDates = categoryRepository.save(new Category(
                "Dates, Nuts & Dry Fruits",
                "dates-nuts-snacks",
                "Premium Medjool & Ajwa dates, roasted almonds, cashews",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
                "Sparkles"
        ));

        Category catBeverages = categoryRepository.save(new Category(
                "Beverages & Refreshments",
                "beverages-juices",
                "Fresh juices, premium rose sherbet, herbal teas, and ZamZam water",
                "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80",
                "CupSoda"
        ));

        // 3. Seed Products
        List<Product> products = new ArrayList<>();

        // Produce
        products.add(new Product(
                "Fresh Organic Shimla Apples",
                "Hand-picked sweet and crunchy organic Shimla apples packed with nutrients.",
                new BigDecimal("180.00"), new BigDecimal("149.00"), "1 kg", 60,
                "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
                true, true, 4.9, 48, catProduce
        ));
        products.add(new Product(
                "Farm Fresh Organic Spinach (Palak)",
                "Pesticide-free tender green spinach leaves washed and ready to cook.",
                new BigDecimal("40.00"), new BigDecimal("29.00"), "250 g", 45,
                "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
                true, false, 4.7, 32, catProduce
        ));
        products.add(new Product(
                "Ripe Alphonso Mangoes (Ratnagiri)",
                "Luscious, fragrant and naturally ripened Alphonso king mangoes.",
                new BigDecimal("650.00"), new BigDecimal("549.00"), "1 Dozen (12 pcs)", 30,
                "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
                true, true, 5.0, 84, catProduce
        ));

        // ZamZam Meat
        Product chicken = new Product(
                "Fresh ZamZam Skinless Curry Cut Chicken",
                "100% ZamZam certified, fresh tender bone-in chicken cut into ideal curry pieces.",
                new BigDecimal("280.00"), new BigDecimal("235.00"), "1 kg", 40,
                "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
                true, true, 4.9, 112, catMeat
        );
        products.add(chicken);

        products.add(new Product(
                "Premium ZamZam Tender Mutton Boti Cuts",
                "Fresh, juicy boneless goat mutton cubes perfect for biryani, kebabs, and stews.",
                new BigDecimal("790.00"), new BigDecimal("720.00"), "500 g", 25,
                "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
                true, true, 4.8, 65, catMeat
        ));

        // Dairy & Eggs
        Product eggs = new Product(
                "Farm Fresh Country Brown Eggs",
                "Nutritious free-range country brown eggs with deep golden yolks.",
                new BigDecimal("120.00"), new BigDecimal("95.00"), "Pack of 12", 80,
                "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
                true, true, 4.9, 90, catDairy
        );
        products.add(eggs);

        products.add(new Product(
                "Pure Desi Cow Ghee (A2 Bilona Method)",
                "Traditional aromatic golden cow ghee crafted using the ancient hand-churned Bilona method.",
                new BigDecimal("899.00"), new BigDecimal("799.00"), "500 ml jar", 35,
                "https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=600&q=80",
                true, true, 5.0, 77, catDairy
        ));

        // Bakery
        products.add(new Product(
                "Artisan Honey & Pistachio Baklava Box",
                "Delicate layers of flaky phyllo dough loaded with crushed pistachios and pure wildflower honey.",
                new BigDecimal("450.00"), new BigDecimal("390.00"), "Box of 8 pcs", 25,
                "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80",
                true, true, 4.9, 56, catBakery
        ));
        products.add(new Product(
                "Traditional Stone-Baked Garlic Pita Bread",
                "Soft, pillowy Middle Eastern pita pocket breads baked on hot stones.",
                new BigDecimal("85.00"), new BigDecimal("69.00"), "Pack of 5", 50,
                "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                true, false, 4.6, 28, catBakery
        ));

        // Pantry
        Product basmati = new Product(
                "Royal Daawat Extra Long Grain Basmati Rice",
                "Aged 2 years for unmatched royal aroma, delicate pearls, and fluffiness for authentic biryanis.",
                new BigDecimal("420.00"), new BigDecimal("360.00"), "2 kg bag", 40,
                "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
                true, true, 4.8, 140, catPantry
        );
        products.add(basmati);

        products.add(new Product(
                "Kashmir Mogra Saffron (Pure Kesar)",
                "Grade A1 authentic Kashmiri saffron threads with intense natural fragrance and vivid crimson tint.",
                new BigDecimal("499.00"), new BigDecimal("449.00"), "1 g sealed box", 60,
                "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
                true, true, 5.0, 95, catPantry
        ));

        // Dates & Nuts
        products.add(new Product(
                "Premium Saudi Ajwa Al-Madinah Dates",
                "Soft, rich black Ajwa dates cultivated in the blessed groves of Al-Madinah Al-Munawwarah.",
                new BigDecimal("699.00"), new BigDecimal("599.00"), "500 g box", 55,
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
                true, true, 5.0, 160, catDates
        ));
        products.add(new Product(
                "California Roasted & Salted Jumbo Pistachios",
                "Naturally opened, crunchy California pistachios lightly sea-salted to perfection.",
                new BigDecimal("350.00"), new BigDecimal("299.00"), "250 g pouch", 45,
                "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80",
                true, false, 4.7, 43, catDates
        ));

        // Beverages
        products.add(new Product(
                "Natural Pure ZamZam Holy Water",
                "Authentic sealed bottle of pure, mineral-rich ZamZam blessed water.",
                new BigDecimal("250.00"), new BigDecimal("199.00"), "500 ml bottle", 100,
                "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
                true, true, 5.0, 310, catBeverages
        ));
        products.add(new Product(
                "Royal Rooh Afza Herbal Rose Sharbat",
                "The classic cooling herbal rose syrup made with pure floral distillates and fruit extracts.",
                new BigDecimal("180.00"), new BigDecimal("160.00"), "750 ml bottle", 65,
                "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
                true, true, 4.8, 88, catBeverages
        ));

        productRepository.saveAll(products);

        System.out.println(">>> ZamZam Mart default data successfully initialized (Categories & Products ready, awaiting real customers)!");
    }
}

