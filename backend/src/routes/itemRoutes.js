const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// Get items by categoryId
router.get("/category/:categoryId", async (req, res) => {
    try {
        const { categoryId } = req.params;
        const itemsRef = db.collection("inventoryItems");
        const snapshot = await itemsRef.where("categoryId", "==", categoryId).get();

        if (snapshot.empty) {
            return res.json([]);
        }

        const items = [];
        snapshot.forEach(doc => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(items);
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update User Cart
router.post("/cart/update", async (req, res) => {
    try {
        const { userId, cart } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const cartRef = db.collection("userCart").doc(userId);
        await cartRef.set({
            items: cart,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        res.json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get User Cart
router.get("/cart/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const cartRef = db.collection("userCart").doc(userId);
        const doc = await cartRef.get();

        if (!doc.exists) {
            return res.json({ items: [] });
        }

        res.json(doc.data());
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Place order
router.post("/place-order", async (req, res) => {
    try {
        const { userId, items, total } = req.body;

        // Save to orders table
        const orderRef = db.collection("orders").doc();
        await orderRef.set({
            userId,
            items,
            total,
            status: "pending",
            createdAt: new Date().toISOString()
        });

        // Clear user cart in DB after placing order
        if (userId) {
            await db.collection("userCart").doc(userId).set({ items: [], updatedAt: new Date().toISOString() });
        }

        res.json({ success: true, message: "Order placed successfully!", orderId: orderRef.id });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
