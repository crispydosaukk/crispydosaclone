const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// Get all categories
router.get("/", async (req, res) => {
    try {
        const categoriesRef = db.collection("inventoryCategory");
        const snapshot = await categoriesRef.get();

        if (snapshot.empty) {
            return res.json([]);
        }

        const categories = [];
        snapshot.forEach(doc => {
            categories.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
