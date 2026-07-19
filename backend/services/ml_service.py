"""
ML Service: Loads the trained Random Forest model and provides disease prediction.
Falls back to a rule-based system if model is not yet trained.
"""
import os
import joblib
import numpy as np
from typing import List, Dict, Tuple

# ─── Disease metadata: specialist and precautions ─────────────────────────────
DISEASE_META = {
    "Fungal infection": {
        "specialist": "Dermatologist",
        "severity": "Mild",
        "precautions": ["Keep skin dry", "Use antifungal creams", "Wear breathable fabrics", "Avoid sharing personal items"],
        "description": "A fungal infection caused by various types of fungus affecting skin, nails or hair."
    },
    "Allergy": {
        "specialist": "Allergist/Immunologist",
        "severity": "Mild to Moderate",
        "precautions": ["Identify allergens", "Avoid triggers", "Carry antihistamines", "Consult a doctor"],
        "description": "An overreaction of the immune system to substances that are normally harmless."
    },
    "GERD": {
        "specialist": "Gastroenterologist",
        "severity": "Moderate",
        "precautions": ["Avoid spicy food", "Eat small meals", "Don't lie down after eating", "Elevate head while sleeping"],
        "description": "Gastroesophageal reflux disease causing stomach acid to flow back into the esophagus."
    },
    "Chronic cholestasis": {
        "specialist": "Hepatologist",
        "severity": "Moderate to Severe",
        "precautions": ["Low-fat diet", "Avoid alcohol", "Take prescribed vitamins", "Regular liver checkups"],
        "description": "A condition where bile flow from the liver is reduced or blocked."
    },
    "Drug Reaction": {
        "specialist": "Allergist/Immunologist",
        "severity": "Moderate to Severe",
        "precautions": ["Stop the suspected drug immediately", "Consult a doctor", "Keep a medication history", "Wear medical ID"],
        "description": "An adverse reaction to a medication that causes symptoms ranging from mild rash to severe anaphylaxis."
    },
    "Peptic ulcer diseae": {
        "specialist": "Gastroenterologist",
        "severity": "Moderate",
        "precautions": ["Avoid NSAIDs", "Reduce stress", "Eat a balanced diet", "Take prescribed antacids"],
        "description": "Open sores that develop on the inner lining of the stomach and upper small intestine."
    },
    "AIDS": {
        "specialist": "Infectious Disease Specialist",
        "severity": "Severe",
        "precautions": ["Take antiretroviral therapy", "Practice safe sex", "Regular medical checkups", "Maintain healthy immunity"],
        "description": "Advanced stage of HIV infection affecting the immune system."
    },
    "Diabetes": {
        "specialist": "Endocrinologist",
        "severity": "Moderate to Severe",
        "precautions": ["Monitor blood sugar", "Follow a diabetic diet", "Exercise regularly", "Take prescribed insulin/medication"],
        "description": "A chronic condition affecting how the body regulates blood sugar (glucose)."
    },
    "Gastroenteritis": {
        "specialist": "Gastroenterologist",
        "severity": "Mild to Moderate",
        "precautions": ["Stay hydrated", "Rest", "Eat bland foods", "Avoid dairy and fatty foods"],
        "description": "Inflammation of the stomach and intestines, typically causing vomiting and diarrhea."
    },
    "Bronchial Asthma": {
        "specialist": "Pulmonologist",
        "severity": "Moderate to Severe",
        "precautions": ["Avoid triggers", "Use prescribed inhalers", "Monitor peak flow", "Keep home dust-free"],
        "description": "A condition in which airways narrow and swell, producing extra mucus and difficulty breathing."
    },
    "Hypertension": {
        "specialist": "Cardiologist",
        "severity": "Moderate to Severe",
        "precautions": ["Reduce salt intake", "Exercise regularly", "Monitor blood pressure", "Manage stress"],
        "description": "Persistently elevated blood pressure in the arteries."
    },
    "Migraine": {
        "specialist": "Neurologist",
        "severity": "Moderate",
        "precautions": ["Avoid triggers", "Sleep regularly", "Stay hydrated", "Take prescribed pain relievers"],
        "description": "A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound."
    },
    "Cervical spondylosis": {
        "specialist": "Orthopedist/Neurologist",
        "severity": "Moderate",
        "precautions": ["Physical therapy", "Avoid heavy lifting", "Use ergonomic furniture", "Do neck exercises"],
        "description": "Age-related wear and tear affecting spinal disks in the neck."
    },
    "Paralysis (brain hemorrhage)": {
        "specialist": "Neurologist/Neurosurgeon",
        "severity": "Critical",
        "precautions": ["Immediate medical attention", "Physical therapy", "Speech therapy", "Follow-up MRI"],
        "description": "Loss of muscle function due to bleeding in or around the brain."
    },
    "Jaundice": {
        "specialist": "Hepatologist/Gastroenterologist",
        "severity": "Moderate to Severe",
        "precautions": ["Rest", "High fluid intake", "Avoid alcohol", "Follow a liver-friendly diet"],
        "description": "Yellowing of the skin and eyes caused by elevated bilirubin levels."
    },
    "Malaria": {
        "specialist": "Infectious Disease Specialist",
        "severity": "Moderate to Severe",
        "precautions": ["Take antimalarial medication", "Use mosquito nets", "Use repellents", "Remove standing water"],
        "description": "A mosquito-borne infectious disease causing fever and chills."
    },
    "Chicken pox": {
        "specialist": "Dermatologist/General Physician",
        "severity": "Mild to Moderate",
        "precautions": ["Isolate from others", "Avoid scratching", "Take antivirals if prescribed", "Calamine lotion for relief"],
        "description": "A highly contagious viral infection causing an itchy blister-like rash."
    },
    "Dengue": {
        "specialist": "Infectious Disease Specialist",
        "severity": "Moderate to Severe",
        "precautions": ["Stay hydrated", "Rest", "Avoid NSAIDs", "Monitor platelet count"],
        "description": "A mosquito-borne viral infection causing high fever, severe headache, and joint pain."
    },
    "Typhoid": {
        "specialist": "Infectious Disease Specialist",
        "severity": "Moderate to Severe",
        "precautions": ["Drink safe water", "Eat properly cooked food", "Take prescribed antibiotics", "Vaccination"],
        "description": "A bacterial infection caused by Salmonella typhi, spread through contaminated food and water."
    },
    "hepatitis A": {
        "specialist": "Hepatologist/Gastroenterologist",
        "severity": "Moderate",
        "precautions": ["Rest", "Avoid alcohol", "Drink clean water", "Vaccination"],
        "description": "A liver infection caused by the hepatitis A virus spread through contaminated food or water."
    },
    "Hepatitis B": {
        "specialist": "Hepatologist",
        "severity": "Moderate to Severe",
        "precautions": ["Get vaccinated", "Practice safe sex", "Don't share needles", "Regular liver tests"],
        "description": "A viral infection attacking the liver, which can cause both acute and chronic disease."
    },
    "Hepatitis C": {
        "specialist": "Hepatologist",
        "severity": "Moderate to Severe",
        "precautions": ["Don't share needles", "Practice safe sex", "Avoid alcohol", "Take antiviral medications"],
        "description": "A viral infection that causes liver inflammation, sometimes leading to serious liver damage."
    },
    "Hepatitis D": {
        "specialist": "Hepatologist",
        "severity": "Severe",
        "precautions": ["Vaccination against Hepatitis B", "Avoid sharing needles", "Regular monitoring", "Avoid alcohol"],
        "description": "A serious liver disease caused by the hepatitis D virus (HDV), which requires hepatitis B co-infection."
    },
    "Hepatitis E": {
        "specialist": "Hepatologist/General Physician",
        "severity": "Moderate",
        "precautions": ["Drink boiled water", "Eat cooked food", "Maintain hygiene", "Rest and stay hydrated"],
        "description": "A liver disease caused by the hepatitis E virus, spread mainly through contaminated water."
    },
    "Alcoholic hepatitis": {
        "specialist": "Hepatologist/Addiction Specialist",
        "severity": "Severe",
        "precautions": ["Stop alcohol consumption immediately", "Nutritional support", "Medical treatment", "Regular liver monitoring"],
        "description": "Liver inflammation caused by drinking too much alcohol."
    },
    "Tuberculosis": {
        "specialist": "Pulmonologist/Infectious Disease Specialist",
        "severity": "Severe",
        "precautions": ["Complete antibiotic course (DOTS)", "Wear masks", "Isolate during active phase", "Get tested if exposed"],
        "description": "A serious infectious disease mainly affecting the lungs, caused by Mycobacterium tuberculosis."
    },
    "Common Cold": {
        "specialist": "General Physician",
        "severity": "Mild",
        "precautions": ["Rest", "Stay hydrated", "Take OTC cold medicine", "Wash hands frequently"],
        "description": "A viral infection of the upper respiratory tract, primarily the nose."
    },
    "Pneumonia": {
        "specialist": "Pulmonologist",
        "severity": "Moderate to Severe",
        "precautions": ["Complete antibiotic course", "Rest", "Stay hydrated", "Vaccination"],
        "description": "An infection that inflames air sacs in one or both lungs, which may fill with fluid."
    },
    "Dimorphic hemmorhoids(piles)": {
        "specialist": "Proctologist/Colorectal Surgeon",
        "severity": "Mild to Moderate",
        "precautions": ["High-fiber diet", "Stay hydrated", "Avoid straining", "Sitz baths"],
        "description": "Swollen veins in the lowest part of the rectum and anus."
    },
    "Heart attack": {
        "specialist": "Cardiologist",
        "severity": "Critical",
        "precautions": ["Call emergency services immediately", "Aspirin if not allergic", "Rest", "CPR if needed"],
        "description": "A medical emergency where blood flow to part of the heart is blocked."
    },
    "Varicose veins": {
        "specialist": "Vascular Surgeon",
        "severity": "Mild to Moderate",
        "precautions": ["Elevate legs", "Exercise regularly", "Wear compression stockings", "Avoid prolonged standing"],
        "description": "Enlarged, twisted veins visible just under the surface of the skin."
    },
    "Hypothyroidism": {
        "specialist": "Endocrinologist",
        "severity": "Moderate",
        "precautions": ["Take thyroid medication as prescribed", "Regular blood tests", "Eat iodine-rich foods", "Exercise"],
        "description": "A condition in which the thyroid gland doesn't produce enough thyroid hormone."
    },
    "Hyperthyroidism": {
        "specialist": "Endocrinologist",
        "severity": "Moderate",
        "precautions": ["Avoid excess iodine", "Take prescribed antithyroid drugs", "Regular checkups", "Monitor heart rate"],
        "description": "A condition in which the thyroid gland is overactive and produces too much thyroid hormone."
    },
    "Hypoglycemia": {
        "specialist": "Endocrinologist/General Physician",
        "severity": "Moderate to Severe",
        "precautions": ["Eat regular meals", "Carry glucose tablets", "Monitor blood sugar", "Avoid skipping meals"],
        "description": "A condition in which blood sugar (glucose) level is too low."
    },
    "Osteoarthritis": {
        "specialist": "Rheumatologist/Orthopedist",
        "severity": "Moderate",
        "precautions": ["Exercise regularly", "Maintain healthy weight", "Use joint protection", "Physical therapy"],
        "description": "A degenerative joint disease that occurs when protective cartilage wears down over time."
    },
    "Arthritis": {
        "specialist": "Rheumatologist",
        "severity": "Moderate",
        "precautions": ["Exercise gently", "Apply hot/cold packs", "Take prescribed medications", "Physical therapy"],
        "description": "Inflammation of joints causing pain and stiffness."
    },
    "(vertigo) Paroymsal Positional Vertigo": {
        "specialist": "ENT Specialist/Neurologist",
        "severity": "Mild to Moderate",
        "precautions": ["Epley maneuver", "Move slowly", "Avoid caffeine", "Stay hydrated"],
        "description": "A sudden sensation of spinning or dizziness triggered by head position changes."
    },
    "Acne": {
        "specialist": "Dermatologist",
        "severity": "Mild",
        "precautions": ["Cleanse skin gently", "Avoid touching face", "Use non-comedogenic products", "Consult dermatologist"],
        "description": "A skin condition that occurs when hair follicles become plugged with oil and dead skin cells."
    },
    "Urinary tract infection": {
        "specialist": "Urologist/General Physician",
        "severity": "Mild to Moderate",
        "precautions": ["Drink plenty of water", "Urinate frequently", "Take prescribed antibiotics", "Maintain hygiene"],
        "description": "An infection in any part of the urinary system — kidneys, bladder, ureters, and urethra."
    },
    "Psoriasis": {
        "specialist": "Dermatologist",
        "severity": "Moderate",
        "precautions": ["Moisturize skin", "Avoid triggers", "Take prescribed medication", "Manage stress"],
        "description": "A skin disease that causes red, itchy scaly patches, most commonly on the knees, elbows, and scalp."
    },
    "Impetigo": {
        "specialist": "Dermatologist/General Physician",
        "severity": "Mild",
        "precautions": ["Keep wounds clean", "Avoid touching sores", "Take prescribed antibiotics", "Wash hands frequently"],
        "description": "A highly contagious bacterial skin infection causing red sores or blisters."
    },
}

# Symptom to index mapping (from training dataset)
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

# Hindi to English symptom translation
HINDI_SYMPTOM_MAP = {
    "बुखार": "high_fever", "तेज बुखार": "high_fever", "हल्का बुखार": "mild_fever",
    "सिरदर्द": "headache", "खांसी": "cough", "उल्टी": "vomiting",
    "मतली": "nausea", "थकान": "fatigue", "दस्त": "diarrhoea",
    "पेट दर्द": "abdominal_pain", "जोड़ों का दर्द": "joint_pain",
    "त्वचा पर चकत्ते": "skin_rash", "खुजली": "itching", "सांस लेने में कठिनाई": "breathlessness",
    "छाती में दर्द": "chest_pain", "कमर दर्द": "back_pain", "चक्कर": "dizziness",
    "कमजोरी": "fatigue", "भूख न लगना": "loss_of_appetite", "पेशाब में जलन": "burning_micturition",
    "त्वचा का पीला होना": "yellowish_skin", "आंखों का पीला होना": "yellowing_of_eyes",
    "वजन कम होना": "weight_loss", "पसीना": "sweating", "ठंड लगना": "chills",
    "नाक बहना": "runny_nose", "गले में दर्द": "throat_irritation",
    "मांसपेशियों में दर्द": "muscle_pain", "कब्ज": "constipation",
    "सूजन": "swelling_joints", "बेहोशी": "coma",
}

# Load model at module level (once)
_model = None
_label_encoder = None

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "label_encoder.pkl")


def load_model():
    """Load the trained model and label encoder from disk."""
    global _model, _label_encoder
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        _model = joblib.load(MODEL_PATH)
        _label_encoder = joblib.load(ENCODER_PATH)
        return True
    return False


def normalize_symptoms(symptoms: List[str], language: str = "en") -> List[str]:
    """
    Normalize symptom strings:
    - Translate Hindi symptoms to English
    - Replace spaces with underscores
    - Convert to lowercase
    """
    normalized = []
    for sym in symptoms:
        sym_stripped = sym.strip().lower()
        # Check Hindi translation first
        if language == "hi" or any(ord(c) > 127 for c in sym):
            if sym_stripped in HINDI_SYMPTOM_MAP:
                normalized.append(HINDI_SYMPTOM_MAP[sym_stripped])
                continue
        # English normalization
        normalized.append(sym_stripped.replace(" ", "_"))
    return normalized


def predict_disease(symptoms: List[str], language: str = "en") -> Dict:
    """
    Predict disease from symptom list using the ML model.
    Falls back to rule-based matching if model not available.
    """
    normalized = normalize_symptoms(symptoms, language)

    if _model is not None and _label_encoder is not None:
        # Build feature vector
        feature_vector = np.zeros(len(ALL_SYMPTOMS))
        for sym in normalized:
            if sym in ALL_SYMPTOMS:
                feature_vector[ALL_SYMPTOMS.index(sym)] = 1

        probabilities = _model.predict_proba([feature_vector])[0]
        predicted_idx = np.argmax(probabilities)
        confidence = float(probabilities[predicted_idx])
        predicted_disease = _label_encoder.inverse_transform([predicted_idx])[0]
    else:
        # Rule-based fallback
        predicted_disease, confidence = rule_based_prediction(normalized)

    meta = DISEASE_META.get(predicted_disease, {
        "specialist": "General Physician",
        "severity": "Unknown",
        "precautions": ["Consult a doctor for proper diagnosis and treatment."],
        "description": "Please consult a qualified medical professional for an accurate diagnosis.",
    })

    return {
        "predicted_disease": predicted_disease,
        "confidence_score": round(confidence * 100, 1),
        "severity": meta["severity"],
        "specialist": meta["specialist"],
        "precautions": meta["precautions"],
        "description": meta["description"],
        "disclaimer": (
            "⚕️ IMPORTANT: This prediction is generated by an AI model for informational purposes only. "
            "It is NOT a medical diagnosis. Only a qualified doctor can diagnose and treat medical conditions. "
            "If you are experiencing severe symptoms, please seek immediate medical attention."
        ),
    }


def rule_based_prediction(symptoms: List[str]) -> Tuple[str, float]:
    """Simple rule-based fallback when ML model is not available."""
    # Symptom → disease mapping (simplified)
    rules = {
        "hepatitis": ["yellowish_skin", "yellowing_of_eyes", "dark_urine", "acute_liver_failure"],
        "Dengue": ["high_fever", "pain_behind_the_eyes", "joint_pain", "skin_rash", "headache"],
        "Malaria": ["high_fever", "chills", "sweating", "vomiting", "headache"],
        "Typhoid": ["high_fever", "fatigue", "vomiting", "diarrhoea", "abdominal_pain"],
        "Diabetes": ["polyuria", "excessive_hunger", "fatigue", "weight_loss", "irregular_sugar_level"],
        "Hypertension": ["headache", "chest_pain", "dizziness", "fatigue"],
        "Common Cold": ["runny_nose", "cough", "congestion", "throat_irritation", "mild_fever"],
        "Migraine": ["headache", "nausea", "vomiting", "blurred_and_distorted_vision"],
        "Urinary tract infection": ["burning_micturition", "bladder_discomfort", "foul_smell_of_urine"],
        "Pneumonia": ["cough", "high_fever", "breathlessness", "chest_pain", "phlegm"],
        "Bronchial Asthma": ["breathlessness", "cough", "chest_pain", "fatigue"],
        "Chicken pox": ["skin_rash", "itching", "high_fever", "fatigue", "blister"],
        "Acne": ["skin_rash", "pus_filled_pimples", "blackheads"],
        "Fungal infection": ["itching", "skin_rash", "nodal_skin_eruptions"],
        "Arthritis": ["joint_pain", "swelling_joints", "movement_stiffness", "muscle_pain"],
    }

    best_match = "Common Cold"
    best_score = 0

    for disease, disease_symptoms in rules.items():
        matches = sum(1 for s in symptoms if s in disease_symptoms)
        score = matches / max(len(disease_symptoms), 1)
        if score > best_score:
            best_score = score
            best_match = disease

    # Confidence: scaled between 0.45 and 0.85 for rule-based
    confidence = max(0.45, min(0.85, 0.4 + best_score * 0.45))
    return best_match, confidence


# Initialize model on import
load_model()
