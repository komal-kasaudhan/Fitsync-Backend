// 📄 Path: scratch/testPhase3.js

async function testPhase3() {
    console.log("==========================================");
    console.log("     TESTING PHASE 3: MARKETPLACE         ");
    console.log("==========================================");

    const BASE_URL = 'http://127.0.0.1:8000/api';

    // 1. Authenticate user & seller
    const userRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@fitsync.com', password: 'Password123!' })
    });
    const userToken = (await userRes.json()).token;

    const sellerRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'store@fitsync.com', password: 'Seller123!' })
    });
    const sellerToken = (await sellerRes.json()).token;

    // 2. Discover Products by Category and Search
    console.log("\n1. Searching Products...");
    const productsRes = await fetch(`${BASE_URL}/products?category=supplements&limit=3`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const productsData = await productsRes.json();
    console.log(`Found ${productsData.count} supplements (Total: ${productsData.total}):`);
    productsData.products.forEach(p => console.log(`   - ${p.title} (₹${p.price}, Stock: ${p.stock})`));

    const selectedProduct = productsData.products[0];
    const initialStock = selectedProduct.stock;

    // 3. Cart Operations
    console.log("\n2. Testing Cart Operations...");
    await fetch(`${BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            productId: selectedProduct._id,
            quantity: 2,
            variant: "Double Rich Chocolate"
        })
    });

    const cartRes = await fetch(`${BASE_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const cartData = await cartRes.json();
    console.log(`Cart total: ₹${cartData.total}, items: ${cartData.count}`);

    // 4. Address Operations
    console.log("\n3. Adding Shipping Address...");
    const addrRes = await fetch(`${BASE_URL}/addresses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            name: "Rahul Verma",
            phone: "+91 98765 43210",
            addressLine: "Flat 402, Green Park Apartments, Sector 4",
            city: "Bokaro",
            state: "Jharkhand",
            pincode: "827004",
            isDefault: true
        })
    });
    const addrData = await addrRes.json();
    const address = addrData.address;
    console.log("Address created:", address.city, address.pincode);

    // 5. Place Marketplace Order (Atomic stock reduction)
    console.log("\n4. Placing Marketplace Order...");
    const orderRes = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            items: [
                {
                    productId: selectedProduct._id,
                    quantity: 2,
                    variant: "Double Rich Chocolate"
                }
            ],
            shippingAddress: {
                name: address.name,
                phone: address.phone,
                addressLine: address.addressLine,
                city: address.city,
                state: address.state,
                pincode: address.pincode
            }
        })
    });
    const orderData = await orderRes.json();
    const createdOrder = orderData.orders[0];
    console.log("Order placed:", {
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        subtotal: createdOrder.subtotal,
        platformFee: createdOrder.platformFee,
        partnerAmount: createdOrder.partnerAmount
    });

    // Check stock was decremented by 2
    const verifyProdRes = await fetch(`${BASE_URL}/products/${selectedProduct._id}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const updatedProd = (await verifyProdRes.json()).product;
    console.log(`Atomic stock reduction verified: Initial: ${initialStock} -> Now: ${updatedProd.stock} (Expected: ${initialStock - 2})`);

    // 6. Seller Fulfillment (Packed -> Shipped -> Delivered)
    console.log("\n5. Seller Fulfilling Order...");
    const shipRes = await fetch(`${BASE_URL}/seller/orders/${createdOrder._id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify({
            status: "shipped",
            courierName: "Delhivery",
            trackingId: "DL987654321IN"
        })
    });
    const shipData = await shipRes.json();
    console.log("Order shipped status:", shipData.order?.status, "Tracking:", shipData.order?.tracking?.trackingId);

    const deliverRes = await fetch(`${BASE_URL}/seller/orders/${createdOrder._id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify({ status: "delivered" })
    });
    const deliverData = await deliverRes.json();
    console.log("Order delivered status:", deliverData.order?.status);

    // 7. Seller Payout Ledger
    console.log("\n6. Fetching Seller Payout Ledger...");
    const payoutRes = await fetch(`${BASE_URL}/seller/payout-summary`, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const payoutData = await payoutRes.json();
    console.log("Payout summary:", JSON.stringify(payoutData.summary, null, 2));

    // 8. Product Review (Now eligible since delivered)
    console.log("\n7. Submitting Product Review...");
    const reviewRes = await fetch(`${BASE_URL}/products/${selectedProduct._id}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            rating: 5,
            comment: "Genuine product with authentic batch code. Tastes amazing with cold milk!"
        })
    });
    const reviewData = await reviewRes.json();
    console.log("Product review result:", reviewData.message, "Rating:", reviewData.productRating);

    // 9. Buyer Return (Within 7 days window)
    console.log("\n8. Testing Buyer Return (within 7 days)...");
    const returnRes = await fetch(`${BASE_URL}/orders/${createdOrder._id}/return`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ reason: "Unopened sealed box; bought extra by mistake" })
    });
    const returnData = await returnRes.json();
    console.log("Return response:", returnData.message, "Order status:", returnData.order?.status);

    // Verify stock restored after return
    const restoredProdRes = await fetch(`${BASE_URL}/products/${selectedProduct._id}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const restoredProd = (await restoredProdRes.json()).product;
    console.log(`Stock restored after return: ${restoredProd.stock} (Expected: ${initialStock})`);

    // 10. Test Banned Medical Claims Keyword Check
    console.log("\n9. Testing Banned Medical Claims Detection...");
    const bannedRes = await fetch(`${BASE_URL}/seller/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify({
            title: "Herbal Miracle Pill for Guaranteed Fat Loss",
            description: "Cures all metabolic slowdown and provides 100% cure for obesity overnight.",
            category: "supplements",
            brand: "Quack Labs",
            price: 999,
            mrp: 1499,
            stock: 20
        })
    });
    const bannedData = await bannedRes.json();
    console.log("Banned claim response:", bannedData.message);
    console.log("Flagged for Admin Review:", bannedData.product?.flaggedForAdminReview);
    console.log("Flag Reason:", bannedData.product?.flagReason);

    console.log("\n==========================================");
    console.log("       PHASE 3 TESTS COMPLETED!           ");
    console.log("==========================================");
}

testPhase3().catch(console.error);
