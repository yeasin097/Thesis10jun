import requests
import random
from faker import Faker
import json
import time
from datetime import datetime

# Initialize Faker for realistic data
fake = Faker()

# Base URL for the EHR creation endpoint
BASE_URL = "http://localhost:8000/ehr/create/nid"

# Predefined options for randomization
DIAGNOSIS_OPTIONS = {
    # Younger age (18-35): Common in children/young adults
    'young': [
        'Asthma', 'Influenza (Flu)', 'Appendicitis', 'Migraine', 'Anxiety Disorder',
        'Conjunctivitis', 'Urinary Tract Infection (UTI)', 'Gastritis', 'Bronchitis', 'Allergic Rhinitis'
    ],
    # Middle age (36-60): Chronic and lifestyle-related diseases
    'middle': [
        'Diabetes Mellitus', 'Hypertension', 'Coronary Artery Disease', 'Gout', 'Peptic Ulcer Disease',
        'Chronic Kidney Disease', 'Depression', 'Arrhythmia', 'Hyperthyroidism', 'Irritable Bowel Syndrome (IBS)'
    ],
    # Older age (61+): Age-related and degenerative diseases
    'older': [
        'Osteoporosis', 'Arthritis', 'Heart Failure', 'Stroke', 'Alzheimer’s Disease',
        'Chronic Obstructive Pulmonary Disease (COPD)', 'Cataract', 'Parkinson’s Disease', 'Prostatitis', 'Pneumonia'
    ],
    # General (all ages): Broadly applicable diseases
    'general': [
        'Tuberculosis', 'Malaria', 'Hepatitis A', 'Dengue Fever', 'Anemia',
        'Thyroiditis', 'Kidney Stones', 'Epilepsy', 'Bipolar Disorder', 'Cholecystitis'
    ]
}

MEDICATION_OPTIONS = [
    'Ranitidine 150mg', 'Chloroquine 250mg', 'Metformin 500mg', 'Amlodipine 5mg', 'Paracetamol 500mg',
    'Ibuprofen 400mg', 'Aspirin 75mg', 'Losartan 50mg', 'Atorvastatin 20mg', 'Simvastatin 40mg',
    'Omeprazole 20mg', 'Pantoprazole 40mg', 'Esomeprazole 40mg', 'Levothyroxine 100mcg', 'Methotrexate 2.5mg',
    'Prednisolone 5mg', 'Hydrocortisone 10mg', 'Salbutamol 100mcg Inhaler', 'Budesonide 200mcg Inhaler', 'Montelukast 10mg',
    'Cetirizine 10mg', 'Loratadine 10mg', 'Fexofenadine 180mg', 'Amoxicillin 500mg', 'Azithromycin 250mg',
    'Ciprofloxacin 500mg', 'Doxycycline 100mg', 'Clarithromycin 500mg', 'Metronidazole 400mg', 'Fluconazole 150mg',
    'Acyclovir 400mg', 'Valacyclovir 500mg', 'Gabapentin 300mg', 'Pregabalin 75mg', 'Amitriptyline 25mg',
    'Sertraline 50mg', 'Fluoxetine 20mg', 'Citalopram 20mg', 'Escitalopram 10mg', 'Diazepam 5mg',
    'Alprazolam 0.5mg', 'Clonazepam 0.5mg', 'Insulin Glargine 100U/mL', 'Metoprolol 50mg', 'Carvedilol 6.25mg',
    'Bisoprolol 5mg', 'Enalapril 10mg', 'Lisinopril 20mg', 'Warfarin 5mg', 'Clopidogrel 75mg',
    'Heparin 5000U', 'Furosemide 40mg', 'Spironolactone 25mg'
]

BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
ALLERGIES = ['Dust', 'Pollen', 'Peanuts', 'Shellfish', 'Penicillin', 'Latex', 'Sun', 'None']

# Fixed doctor and hospital IDs
DOCTOR_IDS = ['d0001', 'd0002', 'd0003']
HOSPITAL_IDS = ['h001', 'h002', 'h003']

def get_age_category(age):
    """Determine age category based on patient age."""
    if age <= 35:
        return 'young'
    elif age <= 60:
        return 'middle'
    else:
        return 'older'

def generate_random_ehr(nid_no):
    # Generate random date of birth and calculate age
    dob = fake.date_of_birth(minimum_age=18, maximum_age=90)
    age = (datetime.now().date() - dob).days // 365
    age_category = get_age_category(age)
    
    # Select 5-6 diseases: 3-4 from age-specific category, 2-3 from general
    age_specific_diagnoses = random.sample(DIAGNOSIS_OPTIONS[age_category], min(4, len(DIAGNOSIS_OPTIONS[age_category])))
    general_diagnoses = random.sample(DIAGNOSIS_OPTIONS['general'], min(3, len(DIAGNOSIS_OPTIONS['general'])))
    diagnoses = list(set(age_specific_diagnoses + general_diagnoses))  # Remove duplicates
    if len(diagnoses) < 5:  # Ensure at least 5 diseases
        remaining = 5 - len(diagnoses)
        all_diagnoses = [d for cat in DIAGNOSIS_OPTIONS.values() for d in cat]
        diagnoses.extend(random.sample([d for d in all_diagnoses if d not in diagnoses], remaining))
    elif len(diagnoses) > 6:  # Cap at 6 diseases
        diagnoses = random.sample(diagnoses, 6)
    
    # Randomly select 1-4 medications
    num_medications = random.randint(1, 4)
    medications = random.sample(MEDICATION_OPTIONS, num_medications)
    
    # Generate random test results
    systolic_bp = random.randint(90, 180)
    diastolic_bp = random.randint(60, 120)
    blood_pressure = f"{systolic_bp}/{diastolic_bp}"
    cholesterol = f"{random.randint(150, 300)} mg/dL"
    allergy = random.choice(ALLERGIES)
    
    # Generate a random visit date within the past 5 years for more temporal variety
    visit_date = fake.date_between(start_date="-5y", end_date="today").strftime('%Y-%m-%d')
    
    # Generate random patient details
    ehr_details = {
        "visit_date": visit_date,
        "address": fake.address().replace('\n', ', '),
        "blood_group": random.choice(BLOOD_GROUPS),
        "date_of_birth": dob.strftime('%Y-%m-%d'),
        "gender": random.choice(['Male', 'Female']),
        "diagnosis": ', '.join(diagnoses),
        "medications": medications,
        "test_results": {
            "blood_pressure": blood_pressure,
            "allergy": allergy,
            "cholesterol": cholesterol,
        },
        "notes": fake.sentence(nb_words=10) if random.random() > 0.3 else 'None'
    }
    
    # Payload for the API
    payload = {
        "doctor_id": random.choice(DOCTOR_IDS),
        "hospital_id": random.choice(HOSPITAL_IDS),
        "nid_no": str(nid_no),
        "ehr_details": json.dumps(ehr_details)
    }
    
    return payload

def create_ehr(nid_no):
    payload = generate_random_ehr(nid_no)
    try:
        response = requests.post(BASE_URL, json=payload)
        if response.status_code in (200, 201):
            print(f"Successfully created EHR for NID {nid_no}: {response.json()}")
        else:
            print(f"Failed to create EHR for NID {nid_no}: {response.status_code} - {response.text}")
    except requests.RequestException as e:
        print(f"Error creating EHR for NID {nid_no}: {e}")

def main():
    start_nid = 5000000001
    end_nid = 5000000150
    
    print(f"Generating EHRs for NIDs {start_nid} to {end_nid} with 5-6 diseases per patient...")
    
    for nid in range(start_nid, end_nid + 1):
        create_ehr(nid)
        time.sleep(0.5)  # 0.5 seconds delay between requests
    
    print("EHR generation complete!")

if __name__ == "__main__":
    main()