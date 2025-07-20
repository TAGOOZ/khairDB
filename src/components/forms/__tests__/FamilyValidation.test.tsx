/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FamilyMembersStep } from '../individual/FamilyMembersStep';
import { individualSchema, IndividualFormData } from '../../../schemas/individualSchema';

// Mock the translation context
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en'
  })
}));

// Mock the translation utils
jest.mock('../../../utils/translations', () => ({
  safeTrans: (t: any, key: string) => key
}));

// Mock the Child Removal Modal
jest.mock('../individual/ChildRemovalModal', () => ({
  ChildRemovalModal: () => <div data-testid="child-removal-modal">Child Removal Modal</div>
}));

// Mock UI components
jest.mock('../../ui/Tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>
}));

jest.mock('../../ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}));

const mockFamilies = [
  { id: 'family-1', name: 'Smith Family', district: 'Downtown', phone: '123-456-7890', address: '123 Main St', status: 'green' as const },
  { id: 'family-2', name: 'Johnson Family', district: 'Uptown', phone: '098-765-4321', address: '456 Oak Ave', status: 'green' as const }
];

// Test wrapper component
function TestWrapper({ children, initialData = {} }: { children: React.ReactNode; initialData?: Partial<IndividualFormData> }) {
  const formMethods = useForm<IndividualFormData>({
    resolver: zodResolver(individualSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      id_number: '',
      date_of_birth: '',
      gender: 'male',
      marital_status: 'single',
      phone: '',
      district: '',
      family_id: null,
      new_family_name: undefined,
      address: '',
      description: '',
      job: '',
      employment_status: 'no_salary',
      salary: null,
      needs: [],
      additional_members: [],
      children: [],
      hashtags: [],
      ...initialData
    },
    mode: 'onChange'
  });

  return (
    <FormProvider {...formMethods}>
      {children}
    </FormProvider>
  );
}

describe('Family Validation', () => {
  it('should show family selection interface', () => {
    render(
      <TestWrapper>
        <FamilyMembersStep families={mockFamilies} />
      </TestWrapper>
    );

    expect(screen.getByText('familyInformation')).toBeInTheDocument();
    expect(screen.getByText('selectExistingFamily')).toBeInTheDocument();
    expect(screen.getByText('createNewFamily')).toBeInTheDocument();
  });

  it('should display family options in dropdown', () => {
    render(
      <TestWrapper>
        <FamilyMembersStep families={mockFamilies} />
      </TestWrapper>
    );

    const familySelect = screen.getByDisplayValue('');
    expect(familySelect).toBeInTheDocument();
    
    // Check that families are available as options
    fireEvent.click(familySelect);
    expect(screen.getByText('Smith Family')).toBeInTheDocument();
    expect(screen.getByText('Johnson Family')).toBeInTheDocument();
  });

  it('should clear new family name when existing family is selected', async () => {
    render(
      <TestWrapper initialData={{ new_family_name: 'Test Family' }}>
        <FamilyMembersStep families={mockFamilies} />
      </TestWrapper>
    );

    const familySelect = screen.getByDisplayValue('');
    const newFamilyInput = screen.getByDisplayValue('Test Family');

    // Select an existing family
    fireEvent.change(familySelect, { target: { value: 'family-1' } });

    await waitFor(() => {
      expect(newFamilyInput).toHaveValue('');
    });
  });

  it('should clear family selection when new family name is entered', async () => {
    render(
      <TestWrapper initialData={{ family_id: 'family-1' }}>
        <FamilyMembersStep families={mockFamilies} />
      </TestWrapper>
    );

    const familySelect = screen.getByDisplayValue('family-1');
    const newFamilyInput = screen.getByPlaceholderText('enterFamilyName');

    // Enter a new family name
    fireEvent.change(newFamilyInput, { target: { value: 'New Family' } });

    await waitFor(() => {
      expect(familySelect).toHaveValue('');
    });
  });

  it('should show requirement message when family members exist', () => {
    render(
      <TestWrapper initialData={{ children: [{ first_name: 'John', last_name: 'Doe', date_of_birth: '2010-01-01', gender: 'boy' }] }}>
        <FamilyMembersStep families={mockFamilies} />
      </TestWrapper>
    );

    expect(screen.getByText('familyRequiredWhenMembers')).toBeInTheDocument();
  });

  it('should show error styling when family is required but not provided', () => {
    render(
      <TestWrapper initialData={{ 
        children: [{ first_name: 'John', last_name: 'Doe', date_of_birth: '2010-01-01', gender: 'boy' }]
      }}>
        <FamilyMembersStep families={mockFamilies} />
      </TestWrapper>
    );

    const familySelect = screen.getByDisplayValue('');
    const newFamilyInput = screen.getByPlaceholderText('enterFamilyName');

    // Both should have error styling when family is required but not provided
    expect(familySelect).toHaveClass('border-red-500');
    expect(newFamilyInput).toHaveClass('border-red-500');
  });
});

describe('Individual Schema Validation', () => {
  it('should validate family requirement for children', async () => {
    const testData: IndividualFormData = {
      first_name: 'John',
      last_name: 'Doe',
      id_number: '12345678901234',
      date_of_birth: '1990-01-01',
      gender: 'male',
      marital_status: 'married',
      phone: '123-456-7890',
      district: 'Downtown',
      family_id: null,
      new_family_name: undefined,
      address: '123 Main St',
      description: 'Test description',
      job: 'Engineer',
      employment_status: 'has_salary',
      salary: 50000,
      needs: [],
      additional_members: [],
      children: [
        {
          first_name: 'Jane',
          last_name: 'Doe',
          date_of_birth: '2010-01-01',
          gender: 'girl'
        }
      ],
      hashtags: []
    };

    const result = individualSchema.safeParse(testData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('family_id');
      expect(result.error.issues[0].message).toContain('Please select an existing family or create a new one');
    }
  });

  it('should validate family requirement for additional members', async () => {
    const testData: IndividualFormData = {
      first_name: 'John',
      last_name: 'Doe',
      id_number: '12345678901234',
      date_of_birth: '1990-01-01',
      gender: 'male',
      marital_status: 'married',
      phone: '123-456-7890',
      district: 'Downtown',
      family_id: null,
      new_family_name: undefined,
      address: '123 Main St',
      description: 'Test description',
      job: 'Engineer',
      employment_status: 'has_salary',
      salary: 50000,
      needs: [],
      additional_members: [
        {
          name: 'Jane Doe',
          date_of_birth: '1992-01-01',
          gender: 'female',
          role: 'spouse',
          relation: 'wife'
        }
      ],
      children: [],
      hashtags: []
    };

    const result = individualSchema.safeParse(testData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('family_id');
      expect(result.error.issues[0].message).toContain('Please select an existing family or create a new one');
    }
  });

  it('should accept valid data with family_id', async () => {
    const testData: IndividualFormData = {
      first_name: 'John',
      last_name: 'Doe',
      id_number: '12345678901234',
      date_of_birth: '1990-01-01',
      gender: 'male',
      marital_status: 'married',
      phone: '123-456-7890',
      district: 'Downtown',
      family_id: 'family-1',
      new_family_name: undefined,
      address: '123 Main St',
      description: 'Test description',
      job: 'Engineer',
      employment_status: 'has_salary',
      salary: 50000,
      needs: [],
      additional_members: [],
      children: [
        {
          first_name: 'Jane',
          last_name: 'Doe',
          date_of_birth: '2010-01-01',
          gender: 'girl'
        }
      ],
      hashtags: []
    };

    const result = individualSchema.safeParse(testData);
    expect(result.success).toBe(true);
  });

  it('should accept valid data with new_family_name', async () => {
    const testData: IndividualFormData = {
      first_name: 'John',
      last_name: 'Doe',
      id_number: '12345678901234',
      date_of_birth: '1990-01-01',
      gender: 'male',
      marital_status: 'married',
      phone: '123-456-7890',
      district: 'Downtown',
      family_id: null,
      new_family_name: 'New Family',
      address: '123 Main St',
      description: 'Test description',
      job: 'Engineer',
      employment_status: 'has_salary',
      salary: 50000,
      needs: [],
      additional_members: [],
      children: [
        {
          first_name: 'Jane',
          last_name: 'Doe',
          date_of_birth: '2010-01-01',
          gender: 'girl'
        }
      ],
      hashtags: []
    };

    const result = individualSchema.safeParse(testData);
    expect(result.success).toBe(true);
  });

  it('should reject empty new_family_name', async () => {
    const testData: IndividualFormData = {
      first_name: 'John',
      last_name: 'Doe',
      id_number: '12345678901234',
      date_of_birth: '1990-01-01',
      gender: 'male',
      marital_status: 'married',
      phone: '123-456-7890',
      district: 'Downtown',
      family_id: null,
      new_family_name: '   ',
      address: '123 Main St',
      description: 'Test description',
      job: 'Engineer',
      employment_status: 'has_salary',
      salary: 50000,
      needs: [],
      additional_members: [],
      children: [
        {
          first_name: 'Jane',
          last_name: 'Doe',
          date_of_birth: '2010-01-01',
          gender: 'girl'
        }
      ],
      hashtags: []
    };

    const result = individualSchema.safeParse(testData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const familyNameError = result.error.issues.find(issue => issue.path.includes('new_family_name'));
      expect(familyNameError?.message).toBe('Family name cannot be empty');
    }
  });

  it('should reject both family_id and new_family_name provided', async () => {
    const testData: IndividualFormData = {
      first_name: 'John',
      last_name: 'Doe',
      id_number: '12345678901234',
      date_of_birth: '1990-01-01',
      gender: 'male',
      marital_status: 'married',
      phone: '123-456-7890',
      district: 'Downtown',
      family_id: 'family-1',
      new_family_name: 'New Family',
      address: '123 Main St',
      description: 'Test description',
      job: 'Engineer',
      employment_status: 'has_salary',
      salary: 50000,
      needs: [],
      additional_members: [],
      children: [
        {
          first_name: 'Jane',
          last_name: 'Doe',
          date_of_birth: '2010-01-01',
          gender: 'girl'
        }
      ],
      hashtags: []
    };

    const result = individualSchema.safeParse(testData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const familyError = result.error.issues.find(issue => issue.path.includes('family_id'));
      expect(familyError?.message).toBe('Please choose either an existing family or create a new one, not both');
    }
  });
});