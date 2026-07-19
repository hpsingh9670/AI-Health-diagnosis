"""
ML Model Training Script
Trains a Random Forest classifier on the Kaggle Disease Symptom Prediction dataset.

Dataset columns: Disease, Symptom_1 through Symptom_17
Run this script once to generate model.pkl and label_encoder.pkl

Usage: python ml/train_model.py
"""
import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "dataset.csv")
MODEL_OUT = os.path.join(BASE_DIR, "model.pkl")
ENCODER_OUT = os.path.join(BASE_DIR, "label_encoder.pkl")

# All known symptoms (must match ml_service.py ALL_SYMPTOMS)
ALL_SYMPTOMS = [
    "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering", "chills",
    "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue", "muscle_wasting", "vomiting",
    "burning_micturition", "spotting_urination", "fatigue", "weight_gain", "anxiety",
    "cold_hands_and_feets", "mood_swings", "weight_loss", "restlessness", "lethargy",
    "patches_in_throat", "irregular_sugar_level", "cough", "high_fever", "sunken_eyes",
    "breathlessness", "sweating", "dehydration", "indigestion", "headache", "yellowish_skin",
    "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes", "back_pain",
    "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "yellow_urine",
    "yellowing_of_eyes", "acute_liver_failure", "fluid_overload", "swelling_of_stomach",
    "swelled_lymph_nodes", "malaise", "blurred_and_distorted_vision", "phlegm",
    "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion",
    "chest_pain", "weakness_in_limbs", "fast_heart_rate", "pain_during_bowel_motions",
    "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", "dizziness",
    "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels",
    "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties",
    "excessive_hunger", "extra_marital_contacts", "drying_and_tingling_lips", "slurred_speech",
    "knee_pain", "hip_joint_pain", "muscle_weakness", "stiff_neck", "swelling_joints",
    "movement_stiffness", "spinning_movements", "loss_of_balance", "unsteadiness",
    "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort", "foul_smell_of_urine",
    "continuous_feel_of_urine", "passage_of_gases", "internal_itching", "toxic_look_(typhos)",
    "depression", "irritability", "muscle_pain", "altered_sensorium", "red_spots_over_body",
    "belly_pain", "abnormal_menstruation", "dischromic_patches", "watering_from_eyes",
    "increased_appetite", "polyuria", "family_history", "mucoid_sputum", "rusty_sputum",
    "lack_of_concentration", "visual_disturbances", "receiving_blood_transfusion",
    "receiving_unsterile_injections", "coma", "stomach_bleeding", "distention_of_abdomen",
    "history_of_alcohol_consumption", "fluid_overload.1", "blood_in_sputum",
    "prominent_veins_on_calf", "palpitations", "painful_walking", "pus_filled_pimples",
    "blackheads", "scurring", "skin_peeling", "silver_like_dusting", "small_dents_in_nails",
    "inflammatory_nails", "blister", "red_sore_around_nose", "yellow_crust_ooze"
]


def generate_synthetic_dataset() -> pd.DataFrame:
    """
    Generate a synthetic training dataset based on known symptom-disease relationships.
    Used when the real CSV dataset is not available.
    """
    print("[WARNING] Real dataset not found. Generating synthetic training data...")

    # Define disease → symptom mapping
    disease_symptoms = {
        "Fungal infection": ["itching", "skin_rash", "nodal_skin_eruptions", "chills"],
        "Allergy": ["continuous_sneezing", "shivering", "chills", "watering_from_eyes", "runny_nose"],
        "GERD": ["acidity", "indigestion", "vomiting", "stomach_pain", "chest_pain"],
        "Chronic cholestasis": ["yellowish_skin", "itching", "nausea", "dark_urine", "yellowing_of_eyes"],
        "Drug Reaction": ["skin_rash", "itching", "stomach_pain", "vomiting", "burning_micturition"],
        "Peptic ulcer diseae": ["acidity", "vomiting", "indigestion", "abdominal_pain", "nausea"],
        "AIDS": ["fatigue", "weight_loss", "muscle_wasting", "patches_in_throat", "extra_marital_contacts"],
        "Diabetes": ["fatigue", "weight_loss", "restlessness", "polyuria", "excessive_hunger", "irregular_sugar_level"],
        "Gastroenteritis": ["vomiting", "diarrhoea", "fatigue", "dehydration", "abdominal_pain"],
        "Bronchial Asthma": ["cough", "breathlessness", "chest_pain", "fatigue", "phlegm"],
        "Hypertension": ["headache", "chest_pain", "dizziness", "fatigue", "restlessness"],
        "Migraine": ["headache", "nausea", "vomiting", "blurred_and_distorted_vision", "visual_disturbances"],
        "Cervical spondylosis": ["back_pain", "neck_pain", "dizziness", "weakness_in_limbs", "loss_of_balance"],
        "Paralysis (brain hemorrhage)": ["weakness_of_one_body_side", "slurred_speech", "headache", "dizziness", "altered_sensorium"],
        "Jaundice": ["yellowish_skin", "nausea", "vomiting", "dark_urine", "yellowing_of_eyes", "abdominal_pain"],
        "Malaria": ["high_fever", "chills", "sweating", "vomiting", "headache", "nausea"],
        "Chicken pox": ["skin_rash", "itching", "high_fever", "fatigue", "blister", "red_spots_over_body"],
        "Dengue": ["high_fever", "pain_behind_the_eyes", "joint_pain", "skin_rash", "headache", "nausea"],
        "Typhoid": ["high_fever", "fatigue", "vomiting", "diarrhoea", "abdominal_pain", "malaise"],
        "hepatitis A": ["yellowing_of_eyes", "nausea", "vomiting", "fatigue", "abdominal_pain", "dark_urine"],
        "Hepatitis B": ["fatigue", "nausea", "vomiting", "yellowish_skin", "dark_urine", "abdominal_pain"],
        "Hepatitis C": ["fatigue", "nausea", "yellowish_skin", "dark_urine", "abdominal_pain"],
        "Hepatitis D": ["fatigue", "yellowish_skin", "dark_urine", "abdominal_pain", "malaise"],
        "Hepatitis E": ["fatigue", "nausea", "vomiting", "abdominal_pain", "yellowing_of_eyes"],
        "Alcoholic hepatitis": ["yellowish_skin", "vomiting", "abdominal_pain", "fatigue", "distention_of_abdomen"],
        "Tuberculosis": ["cough", "high_fever", "breathlessness", "sweating", "weight_loss", "fatigue", "blood_in_sputum"],
        "Common Cold": ["continuous_sneezing", "runny_nose", "congestion", "throat_irritation", "mild_fever"],
        "Pneumonia": ["cough", "high_fever", "breathlessness", "chest_pain", "phlegm", "fatigue"],
        "Dimorphic hemmorhoids(piles)": ["constipation", "pain_in_anal_region", "bloody_stool", "irritation_in_anus"],
        "Heart attack": ["chest_pain", "fast_heart_rate", "breathlessness", "sweating", "vomiting"],
        "Varicose veins": ["cramps", "obesity", "swollen_legs", "swollen_blood_vessels", "bruising"],
        "Hypothyroidism": ["fatigue", "weight_gain", "cold_hands_and_feets", "constipation", "brittle_nails", "enlarged_thyroid"],
        "Hyperthyroidism": ["sweating", "fatigue", "weight_loss", "fast_heart_rate", "mood_swings"],
        "Hypoglycemia": ["sweating", "fatigue", "anxiety", "restlessness", "irregular_sugar_level", "dizziness"],
        "Osteoarthritis": ["knee_pain", "hip_joint_pain", "joint_pain", "movement_stiffness", "muscle_weakness"],
        "Arthritis": ["joint_pain", "swelling_joints", "movement_stiffness", "muscle_pain"],
        "(vertigo) Paroymsal Positional Vertigo": ["dizziness", "spinning_movements", "loss_of_balance", "nausea"],
        "Acne": ["skin_rash", "pus_filled_pimples", "blackheads", "scurring"],
        "Urinary tract infection": ["burning_micturition", "bladder_discomfort", "foul_smell_of_urine", "continuous_feel_of_urine"],
        "Psoriasis": ["skin_rash", "skin_peeling", "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails"],
        "Impetigo": ["blister", "red_sore_around_nose", "yellow_crust_ooze", "skin_rash"],
    }

    rows = []
    symptom_cols = [f"Symptom_{i}" for i in range(1, 18)]

    for disease, syms in disease_symptoms.items():
        for _ in range(120):  # 120 samples per disease
            # Randomly add noise and variation
            selected = list(syms)
            extra = [s for s in ALL_SYMPTOMS if s not in syms]
            np.random.shuffle(extra)
            selected += extra[:np.random.randint(0, 3)]  # Add 0-2 extra symptoms
            np.random.shuffle(selected)

            row = {"Disease": disease}
            for i, col in enumerate(symptom_cols):
                row[col] = selected[i] if i < len(selected) else np.nan
            rows.append(row)

    return pd.DataFrame(rows)


def load_dataset() -> pd.DataFrame:
    """Load dataset from CSV or generate synthetic data."""
    if os.path.exists(DATASET_PATH):
        print(f"✅ Loading real dataset from {DATASET_PATH}")
        df = pd.read_csv(DATASET_PATH)
        # Normalize column names
        df.columns = df.columns.str.strip()
        return df
    else:
        return generate_synthetic_dataset()


def preprocess(df: pd.DataFrame):
    """Convert symptom columns to a binary feature matrix."""
    symptom_cols = [c for c in df.columns if c != "Disease"]

    # Build binary feature matrix
    X = np.zeros((len(df), len(ALL_SYMPTOMS)))
    for i, row in df.iterrows():
        for col in symptom_cols:
            sym = str(row[col]).strip().lower() if pd.notna(row[col]) else ""
            if sym in ALL_SYMPTOMS:
                X[i][ALL_SYMPTOMS.index(sym)] = 1

    y = df["Disease"].str.strip().values
    return X, y


def train():
    """Main training pipeline."""
    print("[MediAI] ML Model Training")
    print("=" * 50)

    df = load_dataset()
    print(f"[INFO] Dataset shape: {df.shape}")
    print(f"[INFO] Diseases: {df['Disease'].nunique()}")

    X, y_raw = preprocess(df)

    # Encode labels
    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    # Train-test split (stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[INFO] Training samples: {len(X_train)}, Test samples: {len(X_test)}")

    # Train Random Forest
    print("\n[INFO] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n[RESULT] Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("\n[RESULT] Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_, zero_division=0))

    # Save model and encoder
    joblib.dump(model, MODEL_OUT)
    joblib.dump(le, ENCODER_OUT)
    print(f"\n[SAVED] Model saved to: {MODEL_OUT}")
    print(f"[SAVED] Label encoder saved to: {ENCODER_OUT}")
    print("\n[DONE] Training complete!")


if __name__ == "__main__":
    train()
