import os, json, shutil
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'reference_dataset'))
IMG_DIR = os.path.join(BASE, 'images')
LABELS_PATH = os.path.join(BASE, 'labels.json')
MODEL_OUT = os.path.join(BASE, 'cnn_skin_classifier.h5')
CLASSES_OUT = os.path.join(BASE, 'cnn_classes.json')

IMG_SIZE = (128,128)
BATCH_SIZE = 2
EPOCHS = 20

# Load mapping
with open(LABELS_PATH, 'r') as f:
    labels = json.load(f)

# Temporary dataset
TEMP_DIR = os.path.join(BASE, 'tmp_flow')
if os.path.exists(TEMP_DIR):
    shutil.rmtree(TEMP_DIR)
os.makedirs(TEMP_DIR, exist_ok=True)

# Copy files into class folders
for fname, cls in labels.items():
    cls_dir = os.path.join(TEMP_DIR, cls)
    os.makedirs(cls_dir, exist_ok=True)
    src = os.path.join(IMG_DIR, fname)
    if os.path.exists(src):
        shutil.copy(src, os.path.join(cls_dir, fname))
    else:
        print('⚠️ Missing image:', src)

# Check data counts
for d in os.listdir(TEMP_DIR):
    print(f"{d}: {len(os.listdir(os.path.join(TEMP_DIR, d)))} images")

# Data generator (no validation split)
datagen = ImageDataGenerator(rescale=1./255)

print("Checking tmp_flow structure...")
for root, dirs, files in os.walk(TEMP_DIR):
    print(root, "->", len(files), "files")


train_gen = datagen.flow_from_directory(
    TEMP_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True
)

num_classes = len(train_gen.class_indices)
print('Detected classes:', train_gen.class_indices)

# Save class order
idx_to_class = {v:k for k,v in train_gen.class_indices.items()}
ordered_classes = [idx_to_class[i] for i in range(len(idx_to_class))]
with open(CLASSES_OUT, 'w') as f:
    json.dump(ordered_classes, f)

# CNN architecture
from tensorflow.keras.callbacks import ModelCheckpoint
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)),
    BatchNormalization(),
    MaxPooling2D(2,2),
    Conv2D(64, (3,3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2,2),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.4),
    Dense(num_classes, activation='softmax')
])

model.compile(optimizer=Adam(learning_rate=1e-4),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

model.fit(train_gen, epochs=EPOCHS)
model.save(MODEL_OUT)
print('✅ Model saved to', MODEL_OUT)
