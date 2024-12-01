const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

const pathKey = path.resolve('./submissionmlgc-indahdwi-a811e79e6d54.json')

console.log('Path to key file:', pathKey);

async function storeData(id, data) {
  try {
    const db = new Firestore({
      projectId: 'submissionmlgc-indahdwi',
      keyFilename: pathKey,
    });

    console.log('Firestore initialized');
    console.log(`Storing data to document ID: ${id}`);

    const predictCollection = db.collection('predictions');
    await predictCollection.doc(id).set(data);

    console.log('Data stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing data:', error.message);
    throw error;
  }
}
 
module.exports = storeData;