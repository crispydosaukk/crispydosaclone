const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", email).get();

        if (snapshot.empty) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        let userFound = null;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.password === password) {
                userFound = { id: doc.id, ...data };
            }
        });

        if (userFound) {
            delete userFound.password;
            res.json({
                message: "Login successful",
                user: userFound
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Test Connection Route
router.get("/test-db", async (req, res) => {
    try {
        const collections = await db.listCollections();
        res.json({
            message: "Database connected successfully!",
            collections: collections.map(col => col.id)
        });
    } catch (error) {
        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

module.exports = router;
