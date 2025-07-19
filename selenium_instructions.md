# Web Form Automation for Individual Submissions

This script uses Selenium to automate filling out individual forms directly in the browser, mimicking human interactions.

## Setup Instructions

### 1. Install Python Requirements
```bash
pip install -r selenium_requirements.txt
```

### 2. Install Chrome Browser
The script uses Chrome browser. Make sure you have Chrome installed on your system.

### 3. Chrome Driver
The webdriver-manager package automatically downloads and manages the correct ChromeDriver version for your Chrome browser.

## Usage

### Basic Usage
```bash
python web_form_automation.py
```
This will:
- Open Chrome browser
- Navigate to the default URL (http://localhost:3000/individuals)
- Click the "Add Individual" button
- Fill all form fields with random fake data
- Click "Save Individual" button

### Options

Submit multiple individuals:
```bash
python web_form_automation.py -n 5
```

Specify a different URL:
```bash
python web_form_automation.py -u https://yourdomain.com/individuals
```

Provide login credentials (if required):
```bash
python web_form_automation.py -e user@example.com -p yourpassword
```

Run in headless mode (no visible browser window):
```bash
python web_form_automation.py --headless
```

Combined example:
```bash
python web_form_automation.py -n 10 -u https://yourdomain.com/individuals -e admin@example.com -p securepassword --headless
```

## How It Works

The script:

1. Opens a browser session
2. Navigates to the individuals page
3. Handles login if credentials are provided
4. Clicks the "Add Individual" button
5. Fills all form fields with randomized data:
   - Personal information (name, ID, DOB, etc.)
   - Contact information
   - Employment details
   - Medical assistance needs
   - Shelter information
   - And more
6. Scrolls down to ensure the "Save Individual" button is visible
7. Clicks the save button
8. Waits for submission to complete
9. Repeats if more than one individual is requested

## Human-like Behavior

The script mimics human behavior by:
- Adding random delays between keystrokes
- Adding pauses between actions
- Scrolling naturally through the form
- Adding randomness to form field values

## Troubleshooting

If you encounter errors:

1. Check that the URL is correct and accessible
2. Verify your login credentials if applicable
3. Check console output for specific error messages
4. Try running without headless mode to see what's happening visually
5. Ensure your internet connection is stable

## Notes

- This script is for testing purposes only
- It respects HTML form structure and field names
- It's designed to be resistant to minor UI changes 