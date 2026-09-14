package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.Order;
import com.spring.zamZamMart.entity.OrderItem;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:zamzammart08@gmail.com}")
    private String senderEmail;

    @Value("${spring.mail.password:YOUR_GMAIL_APP_PASSWORD}")
    private String mailPassword;

    /**
     * Sends a warm Greeting / Welcome Email from Admin Gmail (zamzammart08@gmail.com)
     * to a new customer upon login or account creation.
     */
    @Async
    public void sendWelcomeGreetingEmail(String customerEmail, String customerName) {
        if (customerEmail == null || customerEmail.trim().isEmpty()) {
            logger.warn("Cannot send welcome email: empty recipient");
            return;
        }

        String displayName = (customerName != null && !customerName.trim().isEmpty()) 
                ? customerName.trim() 
                : customerEmail.split("@")[0];

        String htmlContent = buildWelcomeEmailHtml(displayName, customerEmail);

        logger.info("================================================================================");
        logger.info("🎉 [WELCOME GREETING EMAIL]");
        logger.info("From (Admin Gmail): {}", senderEmail);
        logger.info("To (New Customer Login): {}", customerEmail);
        logger.info("Subject: 🌟 Welcome to ZamZam Mart, {}! 100% Certified ZamZam Groceries", displayName);
        logger.info("Welcome Gift: Coupon code ZAMZAM10 for 10% OFF on your first grocery delivery");
        logger.info("Customer Support: {}", senderEmail);
        logger.info("================================================================================");

        if (mailSender != null && !"YOUR_GMAIL_APP_PASSWORD".equalsIgnoreCase(mailPassword)) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(senderEmail, "ZamZam Mart Welcome Team");
                helper.setTo(customerEmail);
                helper.setSubject("🌟 Welcome to ZamZam Mart, " + displayName + "! 100% Certified ZamZam Groceries");
                helper.setText(htmlContent, true);

                mailSender.send(message);
                logger.info("✅ Welcome greeting email successfully dispatched via Gmail SMTP to {}", customerEmail);
            } catch (Exception e) {
                logger.warn("Live Gmail SMTP dispatch deferred (Set 16-digit Google App Password): {}", e.getMessage());
            }
        }
    }

    /**
     * Sends an Order Confirmation Email from Admin Gmail (zamzammart08@gmail.com)
     * to the customer's login email ID with item name, price, and quantity.
     */
    @Async
    public void sendOrderConfirmationEmail(Order order) {
        // Priority to logged-in user's email, fallback to customerEmail on the order
        String recipient = (order.getUser() != null && order.getUser().getEmail() != null && !order.getUser().getEmail().trim().isEmpty())
                ? order.getUser().getEmail().trim()
                : order.getCustomerEmail();

        if (recipient == null || recipient.trim().isEmpty()) {
            logger.warn("No customer email provided for order {}", order.getOrderNumber());
            return;
        }

        String htmlContent = buildOrderEmailHtml(order);

        logger.info("================================================================================");
        logger.info("🛒 [ORDER CONFIRMATION EMAIL]");
        logger.info("From (Admin Gmail): {}", senderEmail);
        logger.info("To (Customer Login ID): {}", recipient);
        logger.info("Subject: 🛒 Order Confirmed! ZamZam Mart Invoice #{}", order.getOrderNumber());
        logger.info("Customer: {}", order.getCustomerName());
        logger.info("Total Amount: ₹{}", order.getTotalAmount());
        logger.info("Delivery Slot: {}", order.getDeliverySlot());
        logger.info("Delivery Address: {}, {}", order.getShippingAddress(), order.getCity());
        logger.info("Items Ordered (Name, Quantity, Price, Subtotal):");
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                String name = item.getProduct() != null ? item.getProduct().getName() : "Grocery Item";
                logger.info("   -> Item Name: \"{}\" | Qty: {} | Price: ₹{} | Subtotal: ₹{}", 
                        name, item.getQuantity(), item.getUnitPrice(), item.getSubtotal());
            }
        }
        logger.info("================================================================================");

        if (mailSender != null && !"YOUR_GMAIL_APP_PASSWORD".equalsIgnoreCase(mailPassword)) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(senderEmail, "ZamZam Mart Orders");
                helper.setTo(recipient);
                helper.setSubject("🛒 Order Confirmed! ZamZam Mart Invoice #" + order.getOrderNumber());
                helper.setText(htmlContent, true);

                mailSender.send(message);
                logger.info("✅ Order confirmation email successfully dispatched via Gmail SMTP to {}", recipient);
            } catch (Exception e) {
                logger.warn("Live Gmail SMTP dispatch deferred (Set 16-digit Google App Password): {}", e.getMessage());
            }
        }
    }

    private String buildWelcomeEmailHtml(String customerName, String customerEmail) {
        String year = new SimpleDateFormat("yyyy").format(new Date());
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #064e3b 0%%, #047857 100%%); padding: 36px 24px; text-align: center; color: #ffffff;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ZamZam <span style="color: #6ee7b7;">Mart</span></h1>
                        <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Pure • Fresh • 100%% Certified ZamZam</p>
                    </div>

                    <!-- Welcome Banner -->
                    <div style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                        <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-weight: 800; padding: 8px 20px; border-radius: 24px; font-size: 14px; margin-bottom: 16px; border: 1px solid #a7f3d0;">
                            ✨ Welcome to the Family!
                        </div>
                        <h2 style="margin: 0; font-size: 22px; color: #0f172a;">Assalamu Alaikum, %s!</h2>
                        <p style="margin: 12px 0 0 0; font-size: 14px; color: #475569; line-height: 1.6;">
                            We are delighted to welcome you to <strong>ZamZam Mart</strong>. Your account (<strong>%s</strong>) is now active and ready for online grocery shopping!
                        </p>
                    </div>

                    <!-- Gift Coupon Card -->
                    <div style="margin: 24px; background: linear-gradient(135deg, #fef3c7 0%%, #fde68a 100%%); border: 2px dashed #f59e0b; border-radius: 16px; padding: 20px; text-align: center;">
                        <span style="font-size: 12px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">Special Welcome Gift Just For You</span>
                        <div style="margin: 10px 0; font-size: 26px; font-weight: 900; color: #78350f; letter-spacing: 2px; font-family: monospace;">ZAMZAM10</div>
                        <p style="margin: 0; font-size: 13px; color: #b45309; font-weight: 600;">Use code at checkout to enjoy <strong>10%% OFF</strong> on your first order!</p>
                    </div>

                    <!-- Highlights -->
                    <div style="padding: 0 24px 24px;">
                        <h3 style="margin: 0 0 16px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Why Shop at ZamZam Mart?</h3>
                        <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155; line-height: 1.8;">
                            <div>⚡ <strong>Express 2-Hour Delivery:</strong> Rapid delivery right to your kitchen counter.</div>
                            <div>🥩 <strong>100%% Certified ZamZam:</strong> Fresh poultry, mutton, and ZamZam pantry staples.</div>
                            <div>🌱 <strong>Farm-Fresh Produce:</strong> Crisp fruits and vegetables harvested daily.</div>
                            <div>💳 <strong>Instant UPI & Razorpay:</strong> Safe, seamless payment with Google Pay, PhonePe, & Paytm.</div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #0f172a; color: #94a3b8; padding: 24px; text-align: center; font-size: 12px;">
                        <p style="margin: 0 0 6px 0;">Sent with care by <strong>ZamZam Mart Admin Team</strong> (<a href="mailto:%s" style="color: #6ee7b7; text-decoration: none;">%s</a>)</p>
                        <p style="margin: 0; color: #64748b;">© %s ZamZam Mart. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        """, customerName, customerEmail, senderEmail, senderEmail, year);
    }

    private String buildOrderEmailHtml(Order order) {
        StringBuilder itemsHtml = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsHtml.append(String.format("""
                    <tr>
                        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">
                            <strong style="color: #0f172a; font-size: 13px;">%s</strong>
                            <span style="display: block; font-size: 11px; color: #64748b;">%s</span>
                        </td>
                        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #334155;">%d</td>
                        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">₹%.2f</td>
                        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 800; color: #047857;">₹%.2f</td>
                    </tr>
                """,
                    item.getProduct() != null ? item.getProduct().getName() : "Grocery Item",
                    item.getProduct() != null && item.getProduct().getUnit() != null ? item.getProduct().getUnit() : "Standard pack",
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getSubtotal()
                ));
            }
        }

        String formattedDate = new SimpleDateFormat("dd MMM yyyy, hh:mm a").format(new Date());
        String year = new SimpleDateFormat("yyyy").format(new Date());

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #064e3b 0%%, #047857 100%%); padding: 30px 20px; text-align: center; color: #ffffff;">
                        <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">ZamZam <span style="color: #6ee7b7;">Mart</span></h1>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: #a7f3d0; font-weight: 600;">100%% Certified Pure, Fresh & ZamZam</p>
                    </div>

                    <!-- Confirmation Banner -->
                    <div style="padding: 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                        <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-weight: bold; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-bottom: 10px; border: 1px solid #a7f3d0;">
                            ✓ Order Confirmed
                        </div>
                        <h2 style="margin: 0; font-size: 20px; color: #0f172a;">Thank you for your order, %s!</h2>
                        <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b;">We have received your order. Below is your detailed receipt with item names, prices, and quantities.</p>
                    </div>

                    <!-- Order Meta Card -->
                    <div style="padding: 20px 24px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <table style="width: 100%%; font-size: 12px; color: #475569;">
                            <tr>
                                <td style="padding: 4px 0;"><strong>Order ID:</strong> <span style="font-family: monospace; font-weight: 800; color: #047857; font-size: 13px;">%s</span></td>
                                <td style="padding: 4px 0; text-align: right;"><strong>Date:</strong> %s</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;"><strong>Delivery Slot:</strong> %s</td>
                                <td style="padding: 4px 0; text-align: right;"><strong>Payment Method:</strong> %s</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 6px 0 0;"><strong>Shipping Destination:</strong> %s, %s (PIN: %s)</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Items Table with Name, Quantity, Price -->
                    <div style="padding: 24px;">
                        <table style="width: 100%%; border-collapse: collapse; font-size: 13px; color: #1e293b;">
                            <thead>
                                <tr style="background-color: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    <th style="padding: 10px; text-align: left;">Item Name</th>
                                    <th style="padding: 10px; text-align: center;">Quantity</th>
                                    <th style="padding: 10px; text-align: right;">Unit Price</th>
                                    <th style="padding: 10px; text-align: right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                %s
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" style="padding: 16px 10px 4px; text-align: right; font-weight: bold; color: #0f172a; font-size: 15px;">Grand Total:</td>
                                    <td style="padding: 16px 10px 4px; text-align: right; font-weight: 800; color: #047857; font-size: 18px;">₹%.2f</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #0f172a; color: #94a3b8; padding: 20px; text-align: center; font-size: 11px;">
                        <p style="margin: 0 0 5px 0;">Sent by Admin (<strong style="color: #ffffff;">%s</strong>) • Pure • Fresh • ZamZam</p>
                        <p style="margin: 0; color: #64748b;">© %s ZamZam Mart. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        """,
            order.getCustomerName() != null ? order.getCustomerName() : "Valued Customer",
            order.getOrderNumber(),
            formattedDate,
            order.getDeliverySlot() != null ? order.getDeliverySlot() : "Express 2-Hour",
            order.getPaymentMethod() != null ? order.getPaymentMethod() : "UPI",
            order.getShippingAddress() != null ? order.getShippingAddress() : "",
            order.getCity() != null ? order.getCity() : "",
            order.getPostalCode() != null ? order.getPostalCode() : "",
            itemsHtml.toString(),
            order.getTotalAmount(),
            senderEmail,
            year
        );
    }
}
