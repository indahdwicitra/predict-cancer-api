const predictClassification = require('../services/InferenceService');
const crypto = require('crypto');
const { storeData } = require('../services/storeData'); // Pastikan fungsi storeData diimport dengan benar
const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

const firestoreKeyPath = path.resolve('./submissionmlgc-indahdwi-a811e79e6d54.json'); // Path ke key file Firestore
const db = new Firestore({
    projectId: 'submissionmlgc-indahdwi',
    keyFilename: firestoreKeyPath,
});

// Handler untuk prediksi
async function postPredictHandler(request, h) {
    try {
        const { image } = request.payload; // Mengambil payload gambar
        const { model } = request.server.app; // Mengambil model dari server

        // Memanggil fungsi prediksi
        const { confidenceScore, label, suggestion } = await predictClassification(model, image);

        // Membuat data prediksi
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const data = {
            id,
            result: label,
            suggestion,
            createdAt,
        };

        // Menyimpan data ke Firestore
        await storeData(id, data);

        // Mengembalikan respons
        return h.response({
            status: 'success',
            message:
                confidenceScore > 99
                    ? 'Model is predicted successfully'
                    : 'Model is predicted successfully but under threshold. Please use the correct picture',
            data,
        }).code(201);
    } catch (error) {
        console.error('Error in postPredictHandler:', error.message);
        return h.response({
            status: 'fail',
            message: 'Failed to process the prediction',
        }).code(500);
    }
}

// Handler untuk mendapatkan riwayat prediksi
async function predictHistories(request, h) {
    try {
        const predictCollection = db.collection('predictions');
        const snapshot = await predictCollection.get();

        // Mengambil semua data dari koleksi Firestore
        const result = snapshot.docs.map((doc) => ({
            id: doc.id,
            history: {
                result: doc.data().result,
                createdAt: doc.data().createdAt,
                suggestion: doc.data().suggestion,
                id: doc.data().id,
            },
        }));

        // Mengembalikan respons
        return h.response({
            status: 'success',
            data: result,
        }).code(200);
    } catch (error) {
        console.error('Error in predictHistories:', error.message);
        return h.response({
            status: 'fail',
            message: 'Failed to fetch prediction histories',
        }).code(500);
    }
}

module.exports = { postPredictHandler, predictHistories };
