// 📄 Path: src/controllers/sellerController.js
const mongoose = require('mongoose');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/user.model');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const { checkMedicalClaims } = require('../utils/medicalClaimsCheck');
const { getInitialPartnerStatus } = require('../utils/partnerUtils');

/**
 * POST /api/seller/register
 * Register as a marketplace seller
 */
exports.registerSeller = async (req, res) => {
    try {
        const userId = req.user.id;
        const existing = await Seller.findOne({ userId });
        if (existing) {
            return res.status(409).json({ success: false, message: "You are already registered as a seller", seller: existing });
        }

        const { businessName, gstin = "", fssai = "", pickupAddress } = req.body;

        if (!businessName || !pickupAddress) {
            return res.status(400).json({ success: false, message: "businessName and pickupAddress are required" });
        }

        const seller = await Seller.create({
            userId,
            businessName: businessName.trim(),
            gstin: gstin.trim(),
            fssai: fssai.trim(),
            pickupAddress,
            status: getInitialPartnerStatus()
        });

        // Promote user to seller role
        await User.findByIdAndUpdate(userId, {
            $addToSet: { roles: "seller" }
        });

        return res.status(201).json({
            success: true,
            message: "Seller registered successfully",
            seller
        });
    } catch (error) {
        console.error("❌ Error registering seller:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/seller/profile
 */
exports.getSellerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const seller = await Seller.findOne({ userId });
        if (!seller) return res.status(404).json({ success: false, message: "Seller profile not found" });

        return res.status(200).json({ success: true, seller });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/seller/profile
 */
exports.updateSellerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const seller = await Seller.findOne({ userId });
        if (!seller) return res.status(404).json({ success: false, message: "Seller profile not found" });

        const { businessName, gstin, fssai, pickupAddress } = req.body;
        if (businessName) seller.businessName = businessName.trim();
        if (gstin !== undefined) seller.gstin = gstin.trim();
        if (fssai !== undefined) seller.fssai = fssai.trim();
        if (pickupAddress) seller.pickupAddress = pickupAddress;

        await seller.save();
        return res.status(200).json({ success: true, message: "Seller profile updated", seller });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/seller/products
 * Add new product with banned medical claims check & FSSAI check
 */
exports.createProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const seller = await Seller.findOne({ userId });
        if (!seller) return res.status(403).json({ success: false, message: "Only registered sellers can create products" });

        const {
            title,
            description,
            category,
            brand,
            price,
            mrp,
            stock = 1,
            variants = [],
            images = [],
            ingredients = [],
            nutritionFacts = {},
            expiryDate = "",
            tags = []
        } = req.body;

        if (!title || !description || !category || !brand || price === undefined || mrp === undefined) {
            return res.status(400).json({
                success: false,
                message: "title, description, category, brand, price, and mrp are required"
            });
        }

        // FSSAI required for food & supplements!
        if (["supplements", "nutrition_food"].includes(category) && !seller.fssai) {
            return res.status(400).json({
                success: false,
                message: "FSSAI license number is required for selling food or supplement products. Please update your seller profile with your FSSAI license."
            });
        }

        // Banned Medical Claims check
        const claimCheck = checkMedicalClaims(`${title} ${description}`);
        let flagged = false;
        let flagReason = "";
        let initialStatus = getInitialPartnerStatus();

        if (claimCheck.hasBannedClaims) {
            flagged = true;
            flagReason = `Banned medical claim keywords detected: [${claimCheck.matches.join(', ')}]`;
            initialStatus = "pending"; // force admin review!
        }

        const product = await Product.create({
            sellerId: seller._id,
            title: title.trim(),
            description: description.trim(),
            category,
            brand: brand.trim(),
            price: Number(price),
            mrp: Number(mrp),
            stock: Number(stock),
            variants: Array.isArray(variants) ? variants : [],
            images: Array.isArray(images) ? images : [],
            ingredients: Array.isArray(ingredients) ? ingredients : [],
            nutritionFacts: typeof nutritionFacts === 'object' ? nutritionFacts : {},
            expiryDate: expiryDate ? String(expiryDate) : "",
            tags: Array.isArray(tags) ? tags : [],
            status: initialStatus,
            flaggedForAdminReview: flagged,
            flagReason: flagReason
        });

        return res.status(201).json({
            success: true,
            message: flagged
                ? "Product created but flagged for admin review due to medical claims"
                : "Product created successfully",
            product
        });
    } catch (error) {
        console.error("❌ Error creating product:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/seller/products
 */
exports.getMyProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const seller = await Seller.findOne({ userId });
        if (!seller) return res.status(403).json({ success: false, message: "Seller profile not found" });

        const products = await Product.find({ sellerId: seller._id }).sort({ createdAt: -1 }).lean();
        return res.status(200).json({
            success: true,
            count: products.length,
            products: products.map(p => ({
                ...p,
                price: Number(p.price || 0),
                mrp: Number(p.mrp || 0),
                stock: Number(p.stock || 0),
                soldCount: Number(p.soldCount || 0),
                ratingAvg: Number(p.ratingAvg || 0)
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/seller/products/:id
 */
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const seller = await Seller.findOne({ userId });
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const isOwner = seller && product.sellerId.toString() === seller._id.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "Unauthorized" });

        const updatable = [
            'title', 'description', 'category', 'brand', 'price', 'mrp',
            'stock', 'variants', 'images', 'ingredients', 'nutritionFacts', 'expiryDate', 'tags'
        ];

        updatable.forEach(f => {
            if (req.body[f] !== undefined) product[f] = req.body[f];
        });

        // Re-check medical claims if title or description changed
        if (req.body.title || req.body.description) {
            const claimCheck = checkMedicalClaims(`${product.title} ${product.description}`);
            if (claimCheck.hasBannedClaims) {
                product.flaggedForAdminReview = true;
                product.flagReason = `Banned medical claim keywords detected: [${claimCheck.matches.join(', ')}]`;
                product.status = "pending";
            }
        }

        await product.save();
        return res.status(200).json({ success: true, message: "Product updated successfully", product });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * DELETE /api/seller/products/:id
 */
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const seller = await Seller.findOne({ userId });
        if (!seller) return res.status(403).json({ success: false, message: "Unauthorized" });

        const product = await Product.findOneAndDelete({ _id: id, sellerId: seller._id });
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        return res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/seller/orders
 */
exports.getSellerOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const seller = await Seller.findOne({ userId });
        if (!seller) return res.status(403).json({ success: false, message: "Seller profile not found" });

        const filter = { sellerId: seller._id };
        if (req.query.status) filter.status = req.query.status;

        const orders = await Order.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders.map(o => ({
                ...o,
                subtotal: Number(o.subtotal || 0),
                platformFee: Number(o.platformFee || 0),
                partnerAmount: Number(o.partnerAmount || 0)
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/seller/orders/:id/status
 * packed | shipped (courier + tracking id) | delivered
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const seller = await Seller.findOne({ userId });
        if (!seller) return res.status(403).json({ success: false, message: "Seller profile not found" });

        const { status, courierName = "", trackingId = "" } = req.body;
        const validStatuses = ["packed", "shipped", "delivered"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findOne({ _id: id, sellerId: seller._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.status = status;
        if (status === "shipped") {
            order.tracking.courierName = courierName.trim();
            order.tracking.trackingId = trackingId.trim();
            order.tracking.shippedAt = new Date();
        } else if (status === "delivered") {
            order.tracking.deliveredAt = new Date();
        }

        await order.save();

        await Notification.create({
            userId: order.userId,
            title: `Order ${status.toUpperCase()}! 📦`,
            message: `Your order #${order.orderNumber} is now ${status}.${trackingId ? ` Tracking ID: ${trackingId} (${courierName})` : ""}`,
            type: "general",
            data: { orderId: order._id, status }
        });

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/seller/payout-summary
 */
exports.getSellerPayoutSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const seller = await Seller.findOne({ userId });
        if (!seller) return res.status(403).json({ success: false, message: "Seller profile not found" });

        const orders = await Order.find({
            sellerId: seller._id,
            status: { $in: ["delivered", "shipped", "packed", "placed"] }
        }).lean();

        let totalRevenue = 0;
        let totalPlatformFee = 0;
        let totalPartnerEarnings = 0;

        orders.forEach(o => {
            totalRevenue += Number(o.subtotal || 0);
            totalPlatformFee += Number(o.platformFee || 0);
            totalPartnerEarnings += Number(o.partnerAmount || 0);
        });

        return res.status(200).json({
            success: true,
            seller: {
                id: seller._id,
                businessName: seller.businessName
            },
            payoutLedgerNote: seller.payoutLedgerNote,
            summary: {
                totalOrders: orders.length,
                totalRevenue: Number(totalRevenue.toFixed(2)),
                totalPlatformFee: Number(totalPlatformFee.toFixed(2)),
                totalPartnerEarnings: Number(totalPartnerEarnings.toFixed(2))
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
