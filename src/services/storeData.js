const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

const pathKey = path.resolve('./submissionmlgc-indahdwi-a811e79e6d54.json');

const db = new Firestore({
    projectId: 'submissionmlgc-indahdwi',
    keyFilename: pathKey,
});

console.log('Firestore initialized with key file:', pathKey);

/**
 * Menyimpan data ke koleksi 'predictions' di Firestore
 * @param {string} id - ID dokumen untuk data yang akan disimpan
 * @param {object} data - Data yang akan disimpan
 * @returns {Promise<boolean>} - Mengembalikan true jika berhasil
 */
async function storeData(id, data) {
    try {
        console.log(`Storing data to document ID: ${id}`);
        const predictCollection = db.collection('predictions');
        await predictCollection.doc(id).set(data);
        console.log('Data stored successfully');
        return true;
    } catch (error) {
        console.error('Error storing data:', error.message);
        throw new Error('Failed to store data');
    }
}

/**
 * Mengambil semua riwayat prediksi dari koleksi 'predictions' di Firestore
 * @returns {Promise<Array>} - Array berisi semua data prediksi
 */
async function getHistories() {
    try {
        console.log('Fetching prediction histories...');
        const predictCollection = db.collection('predictions');
        const snapshot = await predictCollection.get();

        if (snapshot.empty) {
            console.log('No prediction histories found.');
            return [];
        }

        const histories = snapshot.docs.map((doc) => ({
            id: doc.id,
            history: {
                ...doc.data(),
                id: doc.id,
            },
        }));

        console.log('Histories fetched successfully');
        return histories;
    } catch (error) {
        console.error('Error fetching histories:', error.message);
        throw new Error('Failed to fetch prediction histories');
    }
}

module.exports = { storeData, getHistories };
