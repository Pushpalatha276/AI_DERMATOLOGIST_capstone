
import os, sys, json
import numpy as np
from PIL import Image
import joblib

def color_hist_features(image_path, bins=8):
    img = Image.open(image_path).convert('RGB').resize((128,128))
    arr = np.array(img)
    feats = []
    for i in range(3):
        h, _ = np.histogram(arr[:,:,i], bins=bins, range=(0,255))
        feats.extend(h.tolist())
    feats = np.array(feats, dtype=float)
    feats = feats / (np.sum(feats)+1e-6)
    return feats

base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'reference_dataset'))
model_path = os.path.join(base, 'skin_classifier.joblib')
if not os.path.exists(model_path):
    print('Model not found. Train first by running python ml/train.py')
    sys.exit(1)

clf = joblib.load(model_path)

img_path = sys.argv[1] if len(sys.argv)>1 else None
if not img_path or not os.path.exists(img_path):
    print('Provide an image path to classify.')
    sys.exit(1)

feat = color_hist_features(img_path).reshape(1,-1)
pred = clf.predict(feat)[0]
# Load DB for details
with open(os.path.join(base, 'disease_database.json')) as f:
    db = json.load(f)
out = db.get(pred, {'disease':pred})
print('Predicted class:', pred)
print('Disease:', out.get('disease','-'))
print('Description:', out.get('description','-'))
