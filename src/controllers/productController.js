// 📄 Path: src/controllers/productController.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

/**
 * GET /api/products
 * Public search and filter
 */
exports.getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            brand,
            minPrice,
            maxPrice,
            sort = "popular",
            page = 1,
            limit = 12
        } = req.query;

        const filter = { status: "approved" };

        if (category) filter.category = category;
        if (brand) filter.brand = new RegExp(brand, 'i');

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (search && search.trim()) {
            filter.$text = { $search: search.trim() };
        }

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(Math.min(parseInt(limit) || 12, 50), 1);
        const skip = (pageNum - 1) * limitNum;

        const sortObj = { isFeatured: -1 };
        if (sort === "price_asc") sortObj.price = 1;
        else if (sort === "price_desc") sortObj.price = -1;
        else if (sort === "rating") sortObj.ratingAvg = -1;
        else sortObj.soldCount = -1; // popular

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('sellerId', 'businessName')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean();

        return res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            products: products.map(p => ({
                _id: p._id,
                title: p.title,
                category: p.category,
                brand: p.brand,
                price: Number(p.price || 0),
                mrp: Number(p.mrp || 0),
                stock: Number(p.stock || 0),
                inStock: Number(p.stock || 0) > 0,
                variants: p.variants || [],
                images: p.images || [],
                ratingAvg: Number(p.ratingAvg || 0),
                ratingCount: Number(p.ratingCount || 0),
                soldCount: Number(p.soldCount || 0),
                isFeatured: Boolean(p.isFeatured),
                seller: p.sellerId ? { id: p.sellerId._id, businessName: p.sellerId.businessName } : null
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(id).populate('sellerId', 'businessName pickupAddress').lean();
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const reviews = await Review.find({ targetType: "Product", targetId: id })
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return res.status(200).json({
            success: true,
            product: {
                ...product,
                price: Number(product.price),
                mrp: Number(product.mrp),
                stock: Number(product.stock),
                inStock: Number(product.stock) > 0,
                seller: product.sellerId ? { id: product.sellerId._id, businessName: product.sellerId.businessName } : null
            },
            reviews: reviews.map(r => ({
                id: r._id,
                userName: r.userId ? r.userId.name : "Verified Buyer",
                rating: Number(r.rating),
                comment: r.comment,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Cart Endpoints ----------------
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        let cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        let total = 0;
        const validItems = [];

        for (const item of cart.items) {
            if (item.productId && item.productId.status === "approved") {
                const sub = item.productId.price * item.quantity;
                total += sub;
                validItems.push({
                    productId: item.productId._id,
                    title: item.productId.title,
                    price: Number(item.productId.price),
                    quantity: Number(item.quantity),
                    variant: item.variant || "",
                    image: item.productId.images?.[0] || "",
                    stock: Number(item.productId.stock || 0),
                    itemTotal: Number(sub.toFixed(2))
                });
            }
        }

        return res.status(200).json({
            success: true,
            count: validItems.length,
            total: Number(total.toFixed(2)),
            items: validItems
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1, variant = "" } = req.body;

        const product = await Product.findById(productId);
        if (!product || product.status !== "approved") {
            return res.status(404).json({ success: false, message: "Product not available" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) cart = new Cart({ userId, items: [] });

        const existingIndex = cart.items.findIndex(i => i.productId.toString() === productId.toString() && i.variant === variant);
        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += Number(quantity);
        } else {
            cart.items.push({ productId, quantity: Number(quantity), variant });
        }

        await cart.save();
        return res.status(200).json({ success: true, message: "Item added to cart", itemsCount: cart.items.length });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = cart.items.filter(i => i.productId.toString() !== productId.toString());
            await cart.save();
        }

        return res.status(200).json({ success: true, message: "Item removed from cart" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        await Cart.findOneAndUpdate({ userId }, { items: [] });
        return res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Address Endpoints ----------------
exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
        return res.status(200).json({ success: true, count: addresses.length, addresses });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, addressLine, city, state, pincode, isDefault = false } = req.body;

        if (!name || !phone || !addressLine || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: "All address fields are required" });
        }

        if (isDefault) {
            await Address.updateMany({ userId }, { isDefault: false });
        }

        const address = await Address.create({
            userId,
            name: name.trim(),
            phone: phone.trim(),
            addressLine: addressLine.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            isDefault: Boolean(isDefault)
        });

        return res.status(201).json({ success: true, message: "Address added successfully", address });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Orders Endpoints ----------------
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, shippingAddress } = req.body;

        if (!Array.isArray(items) || items.length === 0 || !shippingAddress) {
            return res.status(400).json({ success: false, message: "items array and shippingAddress are required" });
        }

        // 1. Validate items & stock atomically
        const productIds = items.map(i => i.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = {};
        products.forEach(p => { productMap[p._id.toString()] = p; });

        for (const item of items) {
            const product = productMap[item.productId];
            if (!product || product.status !== "approved") {
                return res.status(400).json({ success: false, message: `Product '${item.productId}' is unavailable` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for '${product.title}' (available: ${product.stock}, requested: ${item.quantity})`
                });
            }
        }

        // 2. Group items by seller for order split
        const sellerGroups = {};
        for (const item of items) {
            const product = productMap[item.productId];
            const sellerId = product.sellerId.toString();
            if (!sellerGroups[sellerId]) sellerGroups[sellerId] = [];
            sellerGroups[sellerId].push({
                productId: product._id,
                title: product.title,
                price: product.price,
                quantity: item.quantity,
                variant: item.variant || "",
                image: product.images?.[0] || "",
                category: product.category
            });
        }

        const settings = await Settings.getSettings();
        const paymentsEnabled = process.env.PAYMENTS_ENABLED === 'true';
        const createdOrders = [];
        let grandTotal = 0;

        for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
            let subtotal = 0;
            let platformFeeTotal = 0;

            for (const sItem of sellerItems) {
                const itemCost = sItem.price * sItem.quantity;
                subtotal += itemCost;
                const catCommission = Number(settings.categoryCommissions?.[sItem.category] || 10);
                platformFeeTotal += (itemCost * catCommission) / 100;
            }

            platformFeeTotal = Number(platformFeeTotal.toFixed(2));
            const partnerAmount = Number((subtotal - platformFeeTotal).toFixed(2));
            grandTotal += subtotal;

            const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const order = await Order.create({
                userId,
                sellerId,
                orderNumber,
                items: sellerItems,
                shippingAddress,
                subtotal: Number(subtotal.toFixed(2)),
                platformFee: platformFeeTotal,
                partnerAmount,
                status: paymentsEnabled ? "pending_payment" : "placed",
                razorpayOrderId: paymentsEnabled ? `order_test_${Date.now()}` : `dev_ord_${Date.now()}`
            });

            // 3. Atomically decrement stock and increment soldCount
            for (const sItem of sellerItems) {
                await Product.findByIdAndUpdate(sItem.productId, {
                    $inc: { stock: -sItem.quantity, soldCount: sItem.quantity }
                });
            }

            // Create Payment record if payments disabled
            if (!paymentsEnabled) {
                const payment = await Payment.create({
                    userId,
                    referenceType: "Order",
                    marketplaceOrderId: order._id,
                    orderId: order.razorpayOrderId,
                    paymentId: `dev_pay_${Date.now()}`,
                    amount: subtotal,
                    currency: "INR",
                    status: "skipped_dev",
                    platformFee: platformFeeTotal,
                    partnerAmount,
                    rawResponse: { mode: "skipped_dev", reason: "PAYMENTS_ENABLED is false" }
                });

                order.paymentId = payment._id;
                await order.save();
            }

            createdOrders.push(order);
        }

        // Clear user cart
        await Cart.findOneAndUpdate({ userId }, { items: [] });

        return res.status(201).json({
            success: true,
            paymentsEnabled,
            message: paymentsEnabled ? "Orders placed, complete payment" : "Orders placed successfully (payment skipped in dev)",
            ordersCount: createdOrders.length,
            grandTotal: Number(grandTotal.toFixed(2)),
            orders: createdOrders
        });
    } catch (error) {
        console.error("❌ Error placing marketplace order:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/orders/mine
 */
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId })
            .populate('sellerId', 'businessName')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders.map(o => ({
                _id: o._id,
                orderNumber: o.orderNumber,
                items: o.items || [],
                subtotal: Number(o.subtotal || 0),
                status: o.status,
                tracking: o.tracking || {},
                shippingAddress: o.shippingAddress,
                seller: o.sellerId ? { businessName: o.sellerId.businessName } : null,
                createdAt: o.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/orders/:id/cancel
 * Buyer cancels order before shipped; restores stock
 */
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to cancel this order" });
        }

        if (!["placed", "packed", "pending_payment"].includes(order.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel order in '${order.status}' status` });
        }

        order.status = "cancelled";
        order.cancelledAt = new Date();
        await order.save();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity, soldCount: -item.quantity }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully and stock restored",
            order
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/orders/:id/return
 * Return order within 7 days of delivery
 */
exports.returnOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason = "" } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (order.status !== "delivered") {
            return res.status(400).json({ success: false, message: "Only delivered orders can be returned" });
        }

        const settings = await Settings.getSettings();
        const returnDaysAllowed = Number(settings.refundRules?.marketplaceReturnDays || 7);
        const deliveredTime = order.tracking?.deliveredAt ? new Date(order.tracking.deliveredAt).getTime() : order.updatedAt.getTime();
        const daysElapsed = (Date.now() - deliveredTime) / (1000 * 60 * 60 * 24);

        if (daysElapsed > returnDaysAllowed) {
            return res.status(400).json({
                success: false,
                message: `Return window expired. Returns are only allowed within ${returnDaysAllowed} days of delivery.`
            });
        }

        order.status = "returned";
        order.returnedAt = new Date();
        order.returnReason = reason.trim() || "Customer return request";
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity, soldCount: -item.quantity }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Return request processed successfully",
            order
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/products/:id/reviews
 * Review product (enforces delivered order requirement)
 */
exports.createProductReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, comment = "" } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        // Enforce delivered order requirement
        const deliveredOrder = await Order.findOne({
            userId,
            status: "delivered",
            "items.productId": product._id
        });

        if (!deliveredOrder) {
            return res.status(403).json({
                success: false,
                message: "Only verified buyers with a delivered order for this product can submit a review"
            });
        }

        let review = await Review.findOne({
            targetType: "Product",
            targetId: id,
            userId,
            orderId: deliveredOrder._id
        });

        if (review) {
            review.rating = Number(rating);
            review.comment = comment.trim();
            await review.save();
        } else {
            review = await Review.create({
                targetType: "Product",
                targetId: id,
                userId,
                orderId: deliveredOrder._id,
                rating: Number(rating),
                comment: comment.trim()
            });
        }

        const refreshed = await Product.findById(id).select('ratingAvg ratingCount');

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review,
            productRating: {
                ratingAvg: Number(refreshed.ratingAvg || 0),
                ratingCount: Number(refreshed.ratingCount || 0)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
