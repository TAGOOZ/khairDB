#!/usr/bin/env python3
import json
import random
import requests
from faker import Faker
from datetime import datetime, timedelta
import argparse

# Initialize Faker
fake = Faker()

# API endpoint (adjust this to your actual API endpoint)
API_URL = "http://localhost:3000/api/individuals"  # Update with your actual API URL

def generate_fake_individual():
    """Generate fake data for all fields in the individual form"""
    
    # Generate random date of birth (18-80 years old)
    dob = fake.date_of_birth(minimum_age=18, maximum_age=80).strftime("%Y-%m-%d")
    
    # Generate gender
    gender = random.choice(["male", "female"])
    
    # Generate marital status
    marital_status = random.choice(["single", "married", "widowed"])
    
    # Employment status
    employment_status = random.choice(["no_salary", "with_salary", "social_support"])
    
    # Salary only if employed
    salary = None
    if employment_status == "with_salary":
        salary = random.randint(500, 5000)
    
    # Generate random needs
    needs = []
    if random.random() > 0.5:  # 50% chance to have needs
        num_needs = random.randint(1, 3)
        for _ in range(num_needs):
            needs.append({
                "category": random.choice(["medical", "financial", "food", "shelter", "clothing", "education", "employment", "transportation", "other"]),
                "priority": random.choice(["low", "medium", "high", "urgent"]),
                "description": fake.text(max_nb_chars=100),
                "status": "pending"
            })
    
    # Generate medical help data
    medical_help = {
        "type_of_medical_assistance_needed": random.sample(["Medical Checkup", "Lab Tests", "X-rays/Scans", "Surgeries"], k=random.randint(0, 4)),
        "medication_distribution_frequency": random.choice(["", "Monthly", "Intermittent"]),
        "estimated_cost_of_treatment": random.choice(["", "Able", "Unable", "Partially"]),
        "health_insurance_coverage": random.choice([True, False]),
        "additional_details": fake.text(max_nb_chars=100) if random.random() > 0.7 else ""
    }
    
    # Generate food assistance data
    food_assistance = {
        "type_of_food_assistance_needed": random.sample(["Ready-made meals", "Non-ready meals"], k=random.randint(0, 2)),
        "food_supply_card": random.choice([True, False])
    }
    
    # Generate marriage assistance data
    marriage_assistance = {
        "marriage_support_needed": random.choice([True, False]),
        "wedding_contract_signed": random.choice([True, False]),
        "wedding_date": fake.date_this_decade().strftime("%Y-%m-%d") if random.random() > 0.5 else "",
        "specific_needs": fake.text(max_nb_chars=100) if random.random() > 0.7 else ""
    }
    
    # Generate debt assistance data
    debt_assistance = {
        "needs_debt_assistance": random.choice([True, False]),
        "debt_amount": random.randint(500, 10000),
        "household_appliances": random.choice([True, False]),
        "hospital_bills": random.choice([True, False]),
        "education_fees": random.choice([True, False]),
        "business_debt": random.choice([True, False]),
        "other_debt": random.choice([True, False])
    }
    
    # Generate education assistance data
    education_assistance = {
        "family_education_level": random.choice(["", "Higher Education", "Intermediate Education", "Literate", "Illiterate"]),
        "desire_for_education": fake.text(max_nb_chars=100) if random.random() > 0.7 else "",
        "children_educational_needs": random.sample(["Tuition Fees", "School Uniforms", "Books", "Supplies", "Tutoring"], k=random.randint(0, 5))
    }
    
    # Generate shelter assistance data
    shelter_assistance = {
        "type_of_housing": random.choice(["", "Owned", "New Rental", "Old Rental"]),
        "housing_condition": random.choice(["", "Healthy", "Moderate", "Unhealthy"]),
        "number_of_rooms": random.randint(1, 5),
        "household_appliances": random.sample(["Stove", "Manual Washing Machine", "Automatic Washing Machine", "Refrigerator", "Fan"], k=random.randint(0, 5))
    }
    
    # Generate children data
    children = []
    if random.random() > 0.5:  # 50% chance to have children
        num_children = random.randint(1, 4)
        for _ in range(num_children):
            child_dob = fake.date_of_birth(minimum_age=1, maximum_age=17).strftime("%Y-%m-%d")
            gender = random.choice(["boy", "girl"])
            children.append({
                "first_name": fake.first_name_male() if gender == "boy" else fake.first_name_female(),
                "last_name": fake.last_name(),
                "date_of_birth": child_dob,
                "gender": gender,
                "description": fake.text(max_nb_chars=50) if random.random() > 0.7 else "",
                "school_stage": random.choice(["kindergarten", "primary", "preparatory", "secondary"])
            })
    
    # Generate additional members data
    additional_members = []
    if random.random() > 0.6:  # 40% chance to have additional members
        num_members = random.randint(1, 2)
        for _ in range(num_members):
            member_gender = random.choice(["male", "female"])
            relation = ""
            if member_gender == "female":
                relation = random.choice(["wife", "sister", "mother", "mother_in_law"])
            else:
                relation = random.choice(["husband", "brother", "father", "father_in_law"])
                
            additional_members.append({
                "name": fake.name_male() if member_gender == "male" else fake.name_female(),
                "date_of_birth": fake.date_of_birth(minimum_age=18, maximum_age=80).strftime("%Y-%m-%d"),
                "gender": member_gender,
                "role": random.choice(["spouse", "sibling", "grandparent", "other"]),
                "job_title": fake.job() if random.random() > 0.5 else "",
                "phone_number": fake.phone_number() if random.random() > 0.5 else "",
                "relation": relation
            })

    # Main individual data
    individual = {
        "first_name": fake.first_name_male() if gender == "male" else fake.first_name_female(),
        "last_name": fake.last_name(),
        "id_number": fake.unique.random_number(digits=10),
        "date_of_birth": dob,
        "gender": gender,
        "marital_status": marital_status,
        "phone": fake.phone_number(),
        "district": fake.city(),
        "family_id": None,  # Not setting a family ID as we're creating new individuals
        "new_family_name": fake.last_name() if children and random.random() > 0.5 else "",
        "address": fake.address(),
        "description": fake.text(max_nb_chars=200) if random.random() > 0.7 else "",
        "job": fake.job() if random.random() > 0.5 else "",
        "employment_status": employment_status,
        "salary": salary,
        "needs": needs,
        "additional_members": additional_members,
        "children": children,
        "medical_help": medical_help,
        "food_assistance": food_assistance,
        "marriage_assistance": marriage_assistance,
        "debt_assistance": debt_assistance,
        "education_assistance": education_assistance,
        "shelter_assistance": shelter_assistance
    }
    
    return individual

def submit_individual(individual_data, api_url, headers=None):
    """Submit the individual data to the API"""
    if not headers:
        headers = {
            "Content-Type": "application/json",
            # Add any authentication headers needed here
        }
    
    try:
        response = requests.post(api_url, json=individual_data, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error submitting individual: {e}")
        return None

def main():
    """Main function to generate and submit fake individuals"""
    parser = argparse.ArgumentParser(description='Generate fake individual data and submit to API')
    parser.add_argument('-n', '--number', type=int, default=1, help='Number of fake individuals to generate')
    parser.add_argument('-o', '--output', help='Output JSON file path (if you want to save the data)')
    parser.add_argument('-s', '--submit', action='store_true', help='Submit data to API')
    parser.add_argument('-u', '--url', default=API_URL, help='API URL for submission')
    parser.add_argument('-t', '--token', help='JWT token for authentication')
    
    args = parser.parse_args()
    
    individuals = []
    for _ in range(args.number):
        individual = generate_fake_individual()
        individuals.append(individual)
        
        if args.submit:
            headers = {"Content-Type": "application/json"}
            if args.token:
                headers["Authorization"] = f"Bearer {args.token}"
            
            result = submit_individual(individual, args.url, headers)
            if result:
                print(f"Successfully submitted individual: {individual['first_name']} {individual['last_name']}")
            else:
                print(f"Failed to submit individual: {individual['first_name']} {individual['last_name']}")
    
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(individuals, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(individuals)} individuals to {args.output}")
    
    if not args.submit and not args.output:
        # If neither submit nor output, just print the first individual
        print(json.dumps(individuals[0], ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main() 