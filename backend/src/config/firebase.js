const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Check connection
db.listCollections()
    .then(() => {
        console.log("✅ Firestore connected");
    })
    .catch((err) => {
        console.error("❌ Firestore error:", err);
    });

module.exports = db;
