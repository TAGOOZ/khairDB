-- Update medical assistance values
UPDATE assistance_details
SET details = jsonb_set(
  details,
  '{type_of_medical_assistance_needed}',
  (
    SELECT jsonb_agg(
      CASE value::text
        WHEN '"Medical Checkup"' THEN '"medicalCheckup"'
        WHEN '"Lab Tests"' THEN '"labTests"'
        WHEN '"X-rays/Scans"' THEN '"xraysAndScans"'
        WHEN '"Surgeries"' THEN '"surgeries"'
        ELSE value
      END
    )
    FROM jsonb_array_elements(details->'type_of_medical_assistance_needed') AS t(value)
  )
)
WHERE assistance_type = 'medical_help'
AND details->>'type_of_medical_assistance_needed' IS NOT NULL;

-- Update medical assistance frequency
UPDATE assistance_details
SET details = jsonb_set(
  details,
  '{medication_distribution_frequency}',
  to_jsonb(
    CASE details->>'medication_distribution_frequency'
      WHEN 'Monthly' THEN 'monthly'
      WHEN 'Intermittent' THEN 'intermittent'
      ELSE details->>'medication_distribution_frequency'
    END
  )
)
WHERE assistance_type = 'medical_help'
AND details->>'medication_distribution_frequency' IS NOT NULL;

-- Update medical assistance cost
UPDATE assistance_details
SET details = jsonb_set(
  details,
  '{estimated_cost_of_treatment}',
  to_jsonb(
    CASE details->>'estimated_cost_of_treatment'
      WHEN 'Able' THEN 'able'
      WHEN 'Unable' THEN 'unable'
      WHEN 'Partially' THEN 'partially'
      ELSE details->>'estimated_cost_of_treatment'
    END
  )
)
WHERE assistance_type = 'medical_help'
AND details->>'estimated_cost_of_treatment' IS NOT NULL;

-- Update food assistance values
UPDATE assistance_details
SET details = jsonb_set(
  details,
  '{type_of_food_assistance_needed}',
  (
    SELECT jsonb_agg(
      CASE value::text
        WHEN '"Ready-made meals"' THEN '"readyMeals"'
        WHEN '"Non-ready meals"' THEN '"nonReadyMeals"'
        ELSE value
      END
    )
    FROM jsonb_array_elements(details->'type_of_food_assistance_needed') AS t(value)
  )
)
WHERE assistance_type = 'food_assistance'
AND details->>'type_of_food_assistance_needed' IS NOT NULL;

-- Update education level values
UPDATE assistance_details
SET details = jsonb_set(
  details,
  '{family_education_level}',
  to_jsonb(
    CASE details->>'family_education_level'
      WHEN 'Higher Education' THEN 'universityEducation'
      WHEN 'Intermediate Education' THEN 'intermediateEducation'
      WHEN 'Literate' THEN 'literate'
      WHEN 'Illiterate' THEN 'illiterate'
      ELSE details->>'family_education_level'
    END
  )
)
WHERE assistance_type = 'education_assistance'
AND details->>'family_education_level' IS NOT NULL;

-- Update educational needs values
UPDATE assistance_details
SET details = jsonb_set(
  details,
  '{children_educational_needs}',
  (
    SELECT jsonb_agg(
      CASE value::text
        WHEN '"Tuition Fees"' THEN '"tuitionFees"'
        WHEN '"School Uniforms"' THEN '"uniforms"'
        WHEN '"Books"' THEN '"books"'
        WHEN '"Supplies"' THEN '"supplies"'
        WHEN '"Tutoring"' THEN '"tutoring"'
        ELSE value
      END
    )
    FROM jsonb_array_elements(details->'children_educational_needs') AS t(value)
  )
)
WHERE assistance_type = 'education_assistance'
AND details->>'children_educational_needs' IS NOT NULL;

-- Update household appliances values
UPDATE assistance_details
SET details = jsonb_set(
  details,
  '{household_appliances}',
  (
    SELECT jsonb_agg(
      CASE value::text
        WHEN '"Stove"' THEN '"stove"'
        WHEN '"Manual Washing Machine"' THEN '"manualWashingMachine"'
        WHEN '"Automatic Washing Machine"' THEN '"automaticWashingMachine"'
        WHEN '"Refrigerator"' THEN '"refrigerator"'
        WHEN '"Fan"' THEN '"fan"'
        WHEN '"TV"' THEN '"tv"'
        ELSE value
      END
    )
    FROM jsonb_array_elements(details->'household_appliances') AS t(value)
  )
)
WHERE assistance_type = 'shelter_assistance'
AND details->>'household_appliances' IS NOT NULL;

-- Update housing values
UPDATE assistance_details
SET details = jsonb_set(
  details,
  '{type_of_housing}',
  to_jsonb(
    CASE details->>'type_of_housing'
      WHEN 'Owned' THEN 'owned'
      WHEN 'New Rental' THEN 'newRental'
      WHEN 'Old Rental' THEN 'oldRental'
      ELSE details->>'type_of_housing'
    END
  )
)
WHERE assistance_type = 'shelter_assistance'
AND details->>'type_of_housing' IS NOT NULL;

UPDATE assistance_details
SET details = jsonb_set(
  details,
  '{housing_condition}',
  to_jsonb(
    CASE details->>'housing_condition'
      WHEN 'Healthy' THEN 'healthy'
      WHEN 'Moderate' THEN 'moderate'
      WHEN 'Unhealthy' THEN 'unhealthy'
      ELSE details->>'housing_condition'
    END
  )
)
WHERE assistance_type = 'shelter_assistance'
AND details->>'housing_condition' IS NOT NULL; 