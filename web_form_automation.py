#!/usr/bin/env python3
import time
import random
import argparse
from faker import Faker
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys

# Initialize Faker
fake = Faker()

def human_like_typing(element, text):
    """Type text with random delays between keystrokes to mimic human typing"""
    for char in text:
        element.send_keys(char)
        time.sleep(random.uniform(0.05, 0.2))  # Random delay between keystrokes

def human_like_delay():
    """Random delay to mimic human interaction pauses"""
    time.sleep(random.uniform(0.5, 2))

def select_dropdown_option(driver, select_element, option_value):
    """Select an option from a dropdown menu"""
    select_element.click()
    human_like_delay()
    
    # Try to find the option by value
    try:
        option = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, f"//option[@value='{option_value}']"))
        )
        option.click()
    except:
        # If not found, just select the first non-empty option
        try:
            options = select_element.find_elements(By.TAG_NAME, "option")
            for option in options:
                if option.get_attribute("value"):
                    option.click()
                    break
        except:
            pass
    
    human_like_delay()

def check_checkbox(checkbox_element, should_check=True):
    """Check or uncheck a checkbox with human-like behavior"""
    if (should_check and not checkbox_element.is_selected()) or (not should_check and checkbox_element.is_selected()):
        checkbox_element.click()
        human_like_delay()

def wait_and_find_element(driver, by, value, timeout=10, description="element"):
    """Wait for an element to be present and visible"""
    try:
        # Wait for element to be present
        element = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
        # Wait for element to be visible
        element = WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located((by, value))
        )
        # Scroll element into view
        driver.execute_script("arguments[0].scrollIntoView(true);", element)
        time.sleep(0.5)  # Small delay after scrolling
        return element
    except Exception as e:
        print(f"Could not find {description}: {str(e)}")
        raise e

def fill_individual_form(driver, form_url, login_details):
    """Fill out the individual form with fake data"""
    try:
        # Navigate to the form URL
        print(f"Navigating to {form_url}...")
        driver.get(form_url)
        
        # Wait for page to load completely
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        print("Page loaded completely")

        # Handle login first
        try:
            print("Attempting to log in...")
            
            # Try different selectors for email field
            email_selectors = [
                (By.ID, "email"),
                (By.NAME, "email"),
                (By.CSS_SELECTOR, "input[type='email']"),
                (By.XPATH, "//input[@placeholder='Email']"),
                (By.XPATH, "//input[contains(@class, 'email')]")
            ]
            
            email_field = None
            for by, selector in email_selectors:
                try:
                    email_field = wait_and_find_element(
                        driver, by, selector,
                        timeout=5,
                        description=f"email field using {by}={selector}"
                    )
                    print(f"Found email field using {by}={selector}")
                    break
                except:
                    continue
            
            if not email_field:
                raise Exception("Could not find email field with any selector")
            
            # Try different selectors for password field
            password_selectors = [
                (By.ID, "password"),
                (By.NAME, "password"),
                (By.CSS_SELECTOR, "input[type='password']"),
                (By.XPATH, "//input[@placeholder='Password']"),
                (By.XPATH, "//input[contains(@class, 'password')]")
            ]
            
            password_field = None
            for by, selector in password_selectors:
                try:
                    password_field = wait_and_find_element(
                        driver, by, selector,
                        timeout=5,
                        description=f"password field using {by}={selector}"
                    )
                    print(f"Found password field using {by}={selector}")
                    break
                except:
                    continue
            
            if not password_field:
                raise Exception("Could not find password field with any selector")
            
            # Clear fields first
            email_field.clear()
            password_field.clear()
            
            # Type credentials
            print("Entering email...")
            human_like_typing(email_field, login_details['email'])
            print("Entering password...")
            human_like_typing(password_field, login_details['password'])
            
            # Try different selectors for login button
            button_selectors = [
                (By.XPATH, "//button[@type='submit']"),
                (By.XPATH, "//button[contains(text(), 'Login')]"),
                (By.XPATH, "//button[contains(text(), 'Sign in')]"),
                (By.CSS_SELECTOR, "button[type='submit']"),
                (By.XPATH, "//button[contains(@class, 'login')]"),
                (By.XPATH, "//button[contains(@class, 'submit')]")
            ]
            
            login_button = None
            for by, selector in button_selectors:
                try:
                    login_button = wait_and_find_element(
                        driver, by, selector,
                        timeout=5,
                        description=f"login button using {by}={selector}"
                    )
                    print(f"Found login button using {by}={selector}")
                    break
                except:
                    continue
            
            if not login_button:
                raise Exception("Could not find login button with any selector")
            
            print("Clicking login button...")
            login_button.click()
            
            print("Login submitted, waiting for page to load...")
            time.sleep(5)  # Wait longer for login to process
            
            # Navigate to the form URL again after successful login
            print(f"Navigating to {form_url} after login...")
            driver.get(form_url)
            
            # Wait for page to load after navigation
            WebDriverWait(driver, 20).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            print("Page loaded after login")
            
        except Exception as e:
            print(f"Login failed: {e}")
            raise e
        
        # Wait specifically for the Add Individual button and click it
        try:
            print("Looking for Add Individual button...")
            # Try multiple possible button locators
            button_xpaths = [
                "//button[contains(text(), 'Add Individual')]",
                "//button[contains(., 'Add Individual')]",
                "//button[contains(@class, 'add')]",
                "//button[.//span[contains(text(), 'Add Individual')]]",
                "//button[contains(@title, 'Add Individual')]",
                "//a[contains(text(), 'Add Individual')]",
                "//div[contains(@class, 'button') and contains(text(), 'Add Individual')]",
                "//button[contains(@class, 'add-individual')]"
            ]
            
            add_button = None
            for xpath in button_xpaths:
                try:
                    add_button = wait_and_find_element(
                        driver, By.XPATH, xpath,
                        timeout=10,
                        description=f"Add Individual button using {xpath}"
                    )
                    break
                except:
                    continue
            
            if add_button is None:
                # Try to print all buttons on the page to help debug
                print("\nListing all buttons found on the page:")
                buttons = driver.find_elements(By.TAG_NAME, "button")
                for btn in buttons:
                    try:
                        print(f"Button text: '{btn.text}', class: '{btn.get_attribute('class')}', type: '{btn.get_attribute('type')}'")
                    except:
                        pass
                raise Exception("Could not find Add Individual button with any selector")
                
            print("Found Add Individual button, clicking...")
            add_button.click()
            print("Clicked Add Individual button")
            time.sleep(2)  # Wait for form to open
            
        except Exception as e:
            print(f"Error with Add Individual button: {e}")
            raise e

        # ----- Fill Personal Information -----
        # First Name
        first_name = fake.first_name()
        try:
            first_name_field = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.NAME, "first_name"))
            )
            human_like_typing(first_name_field, first_name)
        except:
            print("Couldn't find first name field")
        
        # Last Name
        last_name = fake.last_name()
        try:
            last_name_field = driver.find_element(By.NAME, "last_name")
            human_like_typing(last_name_field, last_name)
        except:
            print("Couldn't find last name field")
        
        # ID Number
        try:
            id_field = driver.find_element(By.NAME, "id_number")
            human_like_typing(id_field, str(fake.unique.random_number(digits=10)))
        except:
            print("Couldn't find ID number field")
        
        # Date of Birth
        try:
            dob_field = driver.find_element(By.NAME, "date_of_birth")
            dob = fake.date_of_birth(minimum_age=18, maximum_age=80).strftime("%Y-%m-%d")
            human_like_typing(dob_field, dob)
        except:
            print("Couldn't find date of birth field")
        
        # Gender
        gender = random.choice(["male", "female"])
        try:
            gender_select = driver.find_element(By.NAME, "gender")
            select_dropdown_option(driver, gender_select, gender)
        except:
            print("Couldn't find gender field")
        
        # Marital Status
        marital_status = random.choice(["single", "married", "widowed"])
        try:
            marital_select = driver.find_element(By.NAME, "marital_status")
            select_dropdown_option(driver, marital_select, marital_status)
        except:
            print("Couldn't find marital status field")
        
        # ----- Fill Contact Information -----
        # Phone
        try:
            phone_field = driver.find_element(By.NAME, "phone")
            human_like_typing(phone_field, fake.phone_number())
        except:
            print("Couldn't find phone field")
        
        # District
        try:
            district_field = driver.find_element(By.NAME, "district")
            human_like_typing(district_field, fake.city())
        except:
            print("Couldn't find district field")
        
        # Address
        try:
            address_field = driver.find_element(By.NAME, "address")
            human_like_typing(address_field, fake.address())
        except:
            print("Couldn't find address field")
        
        # Description
        try:
            description_field = driver.find_element(By.NAME, "description")
            human_like_typing(description_field, fake.text(max_nb_chars=100))
        except:
            print("Couldn't find description field")
        
        # ----- Fill Employment Information -----
        # Job
        try:
            job_field = driver.find_element(By.NAME, "job")
            human_like_typing(job_field, fake.job())
        except:
            print("Couldn't find job field")
        
        # Employment Status
        employment_status = random.choice(["no_salary", "with_salary", "social_support"])
        try:
            employment_select = driver.find_element(By.NAME, "employment_status")
            select_dropdown_option(driver, employment_select, employment_status)
        except:
            print("Couldn't find employment status field")
        
        # Salary (only if has salary)
        if employment_status == "with_salary":
            try:
                salary_field = driver.find_element(By.NAME, "salary")
                human_like_typing(salary_field, str(random.randint(500, 5000)))
            except:
                print("Couldn't find salary field")
        
        # ----- Fill Medical Help Section -----
        # Check random medical help checkboxes
        medical_options = ["Medical Checkup", "Lab Tests", "X-rays/Scans", "Surgeries"]
        for option in medical_options:
            if random.choice([True, False]):
                try:
                    xpath = f"//input[@value='{option}']"
                    checkbox = driver.find_element(By.XPATH, xpath)
                    check_checkbox(checkbox, True)
                except:
                    print(f"Couldn't find medical checkbox for {option}")
        
        # Add additional medical details
        try:
            med_details_field = driver.find_element(By.NAME, "medical_help.additional_details")
            human_like_typing(med_details_field, fake.text(max_nb_chars=50))
        except:
            print("Couldn't find medical details field")
        
        # ----- Fill Shelter Assistance Section -----
        # Type of Housing
        housing_type = random.choice(["Owned", "New Rental", "Old Rental", ""])
        try:
            housing_select = driver.find_element(By.NAME, "shelter_assistance.type_of_housing")
            select_dropdown_option(driver, housing_select, housing_type)
        except:
            print("Couldn't find housing type field")
        
        # Housing Condition
        condition = random.choice(["Healthy", "Moderate", "Unhealthy", ""])
        try:
            condition_select = driver.find_element(By.NAME, "shelter_assistance.housing_condition")
            select_dropdown_option(driver, condition_select, condition)
        except:
            print("Couldn't find housing condition field")
        
        # Number of Rooms
        try:
            rooms_field = driver.find_element(By.NAME, "shelter_assistance.number_of_rooms")
            human_like_typing(rooms_field, str(random.randint(1, 5)))
        except:
            print("Couldn't find number of rooms field")
        
        # Household Appliances
        appliances = ["Stove", "Manual Washing Machine", "Automatic Washing Machine", "Refrigerator", "Fan"]
        for appliance in appliances:
            if random.choice([True, False]):
                try:
                    xpath = f"//input[@value='{appliance}']"
                    checkbox = driver.find_element(By.XPATH, xpath)
                    check_checkbox(checkbox, True)
                except:
                    print(f"Couldn't find appliance checkbox for {appliance}")
        
        # ----- Scroll down to make sure Save button is visible -----
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        human_like_delay()
        
        # ----- Click Save Individual button -----
        try:
            save_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Save Individual')]"))
            )
            
            # Scroll to the button to make sure it's in view
            driver.execute_script("arguments[0].scrollIntoView(true);", save_button)
            time.sleep(1)
            
            # Click the button
            save_button.click()
            print(f"Submitted form for individual: {first_name} {last_name}")
            
            # Wait for submission to complete
            time.sleep(3)
            
            return True
        except Exception as e:
            print(f"Couldn't click Save Individual button: {e}")
            return False
    
    except Exception as e:
        print(f"Error filling form: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Automate form filling')
    parser.add_argument('--url', default='http://localhost:5173/individuals', help='URL of the form to fill')
    parser.add_argument('--count', type=int, default=1, help='Number of forms to fill')
    parser.add_argument('--email', default='admin@example.com', help='Login email')
    parser.add_argument('--password', default='pass1234', help='Login password')
    args = parser.parse_args()

    # Configure Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_argument('--ignore-ssl-errors')
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--allow-insecure-localhost')
    
    # Disable logging
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    
    try:
        print("Initializing Chrome WebDriver...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Set longer timeout for local development
        driver.set_page_load_timeout(60)
        
        # Setup login details
        login_details = {
            'email': args.email,
            'password': args.password
        }
        
        successful_submissions = 0
        for i in range(args.count):
            print(f"\nFilling form {i + 1} of {args.count}...")
            try:
                if fill_individual_form(driver, args.url, login_details):
                    successful_submissions += 1
                    print(f"Successfully completed form {i + 1}")
                time.sleep(2)  # Wait between submissions
            except Exception as e:
                print(f"Error filling form: {str(e)}")
                continue

        print(f"\nCompleted {successful_submissions} out of {args.count} submissions")
        
        # Keep the browser open and wait for user input
        print("\nBrowser will remain open. Press Enter to close it...")
        input()

    except Exception as e:
        print(f"Fatal error: {str(e)}")
        print("\nBrowser will remain open. Press Enter to close it...")
        input()
    finally:
        try:
            if 'driver' in locals():
                driver.quit()
        except:
            pass

if __name__ == "__main__":
    main() 