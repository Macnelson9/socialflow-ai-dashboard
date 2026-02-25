import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VerificationBadge } from '../../VerificationBadge';

describe('VerificationBadge Component', () => {
  it('renders verified badge', () => {
    render(<VerificationBadge isVerified={true} platform="twitter" />);
    expect(screen.getByTitle(/Verified/i)).toBeInTheDocument();
  });

  it('renders unverified state', () => {
    render(<VerificationBadge isVerified={false} platform="twitter" />);
    const badge = screen.queryByTitle(/Verified/i);
    expect(badge).not.toBeInTheDocument();
  });

  it('displays platform-specific badge', () => {
    const { container } = render(<VerificationBadge isVerified={true} platform="instagram" />);
    expect(container.querySelector('[class*="badge"]')).toBeTruthy();
  });
});
