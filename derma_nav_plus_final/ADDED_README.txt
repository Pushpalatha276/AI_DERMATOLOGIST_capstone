
Derma Nav Plus - Added dataset and ML prototype
==============================================

Files added:
- reference_dataset/disease_database.json  : JSON dataset converted from your JS object.
- reference_dataset/images/               : Copied reference images (if available in environment).
- reference_dataset/labels.json           : Template mapping image filenames to class labels. Edit this to add correct labels.
- reference_dataset/skin_classifier.joblib: (created after you run training) saved model file.
- ml/train.py                             : Training script (uses color histograms + RandomForest).
- ml/predict.py                           : Single-image prediction script that prints disease info.

How to use:
1. Edit reference_dataset/labels.json and map image filenames to one of the keys in disease_database.json
   (e.g., "melanoma", "basal cell carcinoma", "rosacea", "acne", "eczema", "normal skin").
2. From the project root, run: python3 ml/train.py
   - This requires: pillow, scikit-learn, joblib, numpy. Install with pip if needed.
3. After training, run: python3 ml/predict.py path/to/image.jpg
   - The script will print the predicted class and the disease description from the JSON.

Notes and limitations:
- This is a lightweight prototype using color histograms only. It is NOT a clinical-grade model.
- For robust performance, supply many labeled images and use a deep learning transfer-learning approach (e.g., Keras + pre-trained ResNet).
- Do not use this model for diagnostic or medical decisions. Always consult a dermatologist.
