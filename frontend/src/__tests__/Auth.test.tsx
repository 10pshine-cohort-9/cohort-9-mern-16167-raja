import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom'; // <-- NEW: Injects toBeInTheDocument types!
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Helper function to wrap components in a Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Authentication Components', () => {

  describe('Login Component', () => {
    it('renders the login form correctly', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('updates state when typing in the email field', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText(/you@example\.com/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      expect(emailInput.value).toBe('test@test.com');
    });
  });

  describe('Register Component', () => {
    it('renders the registration form correctly', () => {
      renderWithRouter(<Register />);
      
      expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
      
      // FIX 1: Matches your actual UI placeholder
      expect(screen.getByPlaceholderText(/muhammad ali/i)).toBeInTheDocument();
      
      expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
      
      // FIX 2: Matches your actual button text
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('updates state when typing in the password field', () => {
      renderWithRouter(<Register />);
      
      const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'SuperSecret123!' } });
      
      expect(passwordInput.value).toBe('SuperSecret123!');
    });
  });

});