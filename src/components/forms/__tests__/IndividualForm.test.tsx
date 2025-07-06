/**
 * @jest-environment jsdom
 */
// @ts-nocheck - Disable TypeScript checking for this file
import React from 'react';
import { render, screen } from '@testing-library/react';
import { IndividualForm } from '../IndividualForm';

// Mock react-hook-form module
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn(cb => cb),
    formState: { errors: {} },
    reset: jest.fn(),
    watch: jest.fn(),
    setValue: jest.fn(),
    control: {}
  }),
  useFieldArray: () => ({
    fields: [],
    append: jest.fn(),
    remove: jest.fn()
  }),
  Controller: ({ render }) => render({ field: { onChange: jest.fn(), value: '' } })
}));

// Mock the translation context
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key, // Return the key as the translation
    language: 'en'
  }),
  LanguageProvider: ({ children }) => <div>{children}</div>
}));

describe('IndividualForm', () => {
  const mockOnSubmit = jest.fn();
  const mockFamilies = [
    { id: 'family-1', name: 'Test Family 1' },
    { id: 'family-2', name: 'Test Family 2' }
  ];

  it('renders the form', () => {
    render(
      <IndividualForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        families={mockFamilies} 
      />
    );
    
    // Just test that something renders - we'll add more specific tests later
    expect(document.body.textContent).toBeTruthy();
  });
}); 