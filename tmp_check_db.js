
import { db } from './src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function checkCategories() {
    const ref = collection(db, "inventoryCategory");
    const snapshot = await getDocs(ref);
    snapshot.forEach(doc => {
        console.log(doc.id, " => ", doc.data());
    });
}

checkCategories();
