package com.spring.zamZamMart.dto;

public class PaymentOrderResponse {
    private String razorpayOrderId;
    private Long amountInPaise;
    private String currency;
    private String keyId;
    private String merchantName;
    private String merchantUpiId;
    private String upiIntentUrl;

    public PaymentOrderResponse() {
    }

    public PaymentOrderResponse(String razorpayOrderId, Long amountInPaise, String currency, String keyId, String merchantName, String merchantUpiId, String upiIntentUrl) {
        this.razorpayOrderId = razorpayOrderId;
        this.amountInPaise = amountInPaise;
        this.currency = currency;
        this.keyId = keyId;
        this.merchantName = merchantName;
        this.merchantUpiId = merchantUpiId;
        this.upiIntentUrl = upiIntentUrl;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public Long getAmountInPaise() {
        return amountInPaise;
    }

    public void setAmountInPaise(Long amountInPaise) {
        this.amountInPaise = amountInPaise;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }

    public String getMerchantUpiId() {
        return merchantUpiId;
    }

    public void setMerchantUpiId(String merchantUpiId) {
        this.merchantUpiId = merchantUpiId;
    }

    public String getUpiIntentUrl() {
        return upiIntentUrl;
    }

    public void setUpiIntentUrl(String upiIntentUrl) {
        this.upiIntentUrl = upiIntentUrl;
    }
}

