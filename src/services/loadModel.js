const tf = require('@tensorflow/tfjs-node');
async function loadModel() {
    return tf.loadGraphModel('https://storage.googleapis.com/predict-cancer-storage/model.json');
}
module.exports = loadModel;