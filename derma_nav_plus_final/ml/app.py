from flask import Flask, request, jsonify
import joblib, os, json
import numpy as np
from PIL import Image

app = Flask(__name__)

def color_hist_features_from_pil(img, bins=8):
    img = img.convert('RGB').resize((128,128))
    arr = np.array(img)
    feats = []
    for i in range(3):
        h, _ = np.histogram(arr[:,:,i], bins=bins, range=(0,255))
        feats.extend(h.tolist())
    feats = np.array(feats, dtype=float)
    feats = feats / (np.sum(feats)+1e-6)
    return feats

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'reference_dataset'))
MODEL_JOBLIB = os.path.join(BASE, 'skin_classifier.joblib')
MODEL_CNN = os.path.join(BASE, 'cnn_skin_classifier.h5')
CLASSES_JSON = os.path.join(BASE, 'cnn_classes.json')

with open(os.path.join(BASE, 'disease_database.json')) as f:
    db = json.load(f)

cnn = None
classes = None
try:
    if os.path.exists(MODEL_CNN):
        from tensorflow.keras.models import load_model
        cnn = load_model(MODEL_CNN)
        if os.path.exists(CLASSES_JSON):
            with open(CLASSES_JSON,'r') as f:
                classes = json.load(f)
        print('✅ Loaded CNN model:', MODEL_CNN)
except Exception as e:
    print('⚠️ Could not load CNN model:', e)

clf = None
try:
    if os.path.exists(MODEL_JOBLIB):
        clf = joblib.load(MODEL_JOBLIB)
        print('✅ Loaded joblib model:', MODEL_JOBLIB)
except Exception as e:
    print('⚠️ Could not load joblib model:', e)

def predict_with_cnn(img):
    img = img.convert('RGB').resize((128,128))
    arr = np.array(img)/255.0
    arr = np.expand_dims(arr, 0)
    preds = cnn.predict(arr)
    idx = int(preds.argmax())
    if classes and idx < len(classes):
        return classes[idx]
    return None

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image_file = request.files['image']
    try:
        img = Image.open(image_file.stream)
    except Exception as e:
        return jsonify({'error': 'Invalid image uploaded', 'detail': str(e)}), 400

    if cnn is not None:
        try:
            pred_class = predict_with_cnn(img)
            if pred_class:
                details = db.get(pred_class, {'disease': pred_class})
                return jsonify({'prediction': pred_class, 'details': details})
        except Exception as e:
            print('CNN predict error:', e)

    if clf is not None:
        feat = color_hist_features_from_pil(img).reshape(1,-1)
        pred = clf.predict(feat)[0]
        disease_info = db.get(pred, {'disease': pred, 'description':'', 'precautions':'', 'cure':''})
        return jsonify({'prediction': pred, 'details': disease_info})

    return jsonify({'error': 'No model available. Train CNN or joblib model first.'}), 500

if __name__ == '__main__':
    app.run(port=5001, host='0.0.0.0')
