import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccountPerformance } from '../../AccountPerformance';

describe('AccountPerformance Component', () => {
  it('renders performance dashboard', () => {
    render(<AccountPerformance />);
    expect(screen.getByText(/Performance/i)).toBeInTheDocument();
  });

  it('displays metrics', () => {
    const { container } = render(<AccountPerformance />);
    const metrics = container.querySelectorAll('[class*="metric"]');
    expect(metrics.length).toBeGreaterThan(0);
  });

  it('shows charts', () => {
    const { container } = render(<AccountPerformance />);
    const charts = container.querySelectorAll('.recharts-wrapper');
    expect(charts.length).toBeGreaterThan(0);
  });
});
