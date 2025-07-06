# Fake Individual Data Generator

This Python script generates fake data for testing the individuals form in the application. It can create realistic test data with all fields populated randomly.

## Setup

### Prerequisites
- Python 3.6+
- pip (Python package manager)

### Installation

1. Clone or download this repository

2. Install the required packages:
```bash
pip install faker requests
```

## Usage

The script can be used in several ways:

### Generate a single individual and display the data
```bash
python generate_fake_individuals.py
```

### Generate multiple individuals
```bash
python generate_fake_individuals.py -n 10
```

### Save generated data to a file
```bash
python generate_fake_individuals.py -n 5 -o individuals.json
```

### Submit data directly to the API
```bash
python generate_fake_individuals.py -n 3 -s -u http://your-api-url/api/individuals
```

### Submit with authentication
```bash
python generate_fake_individuals.py -s -t "your-jwt-token"
```

## Command Line Options

- `-n, --number`: Number of individuals to generate (default: 1)
- `-o, --output`: Output JSON file path to save generated data
- `-s, --submit`: Submit the generated data to the API
- `-u, --url`: API URL for submission (default: http://localhost:3000/api/individuals)
- `-t, --token`: JWT token for authentication

## Example Output

The script generates data for all fields including:
- Personal information (name, ID, DOB, gender, marital status)
- Contact information
- Employment details
- Medical assistance needs
- Food assistance
- Marriage assistance
- Debt assistance
- Education assistance
- Shelter assistance
- Family members and children

## Customization

You can customize the data generation logic in the `generate_fake_individual()` function to match your specific requirements or to add new fields.

## Notes

- This script is for testing purposes only
- The generated data uses randomized values from the Faker library
- Make sure to update the API_URL constant at the top of the script if you're submitting to an API 