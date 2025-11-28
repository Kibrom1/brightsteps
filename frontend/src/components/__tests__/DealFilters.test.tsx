/**
 * Component tests for DealFilters
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { DealFilters } from '../../components/deals/DealFilters';
import type { DealFilters as DealFiltersType } from '../../types';

describe('DealFilters', () => {
  const mockFilters: DealFiltersType = {};
  const mockOnChange = vi.fn();
  const mockOnReset = vi.fn();

  it('should render filter component', () => {
    render(
      <DealFilters
        filters={mockFilters}
        onChange={mockOnChange}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText(/filters/i)).toBeInTheDocument();
    expect(screen.getByText(/property type/i)).toBeInTheDocument();
  });

  it('should toggle property type filter', async () => {
    const user = userEvent.setup();
    render(
      <DealFilters
        filters={mockFilters}
        onChange={mockOnChange}
        onReset={mockOnReset}
      />
    );

    const singleFamilyButton = screen.getByRole('button', { name: /single family/i });
    await user.click(singleFamilyButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should show reset button when filters are active', () => {
    const filtersWithPropertyType: DealFiltersType = {
      property_type: ['single_family'],
    };

    render(
      <DealFilters
        filters={filtersWithPropertyType}
        onChange={mockOnChange}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText(/reset filters/i)).toBeInTheDocument();
  });

  it('should call onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    const filtersWithPropertyType: DealFiltersType = {
      property_type: ['single_family'],
    };

    render(
      <DealFilters
        filters={filtersWithPropertyType}
        onChange={mockOnChange}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText(/reset filters/i);
    await user.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should update city filter', async () => {
    const user = userEvent.setup();
    render(
      <DealFilters
        filters={mockFilters}
        onChange={mockOnChange}
        onReset={mockOnReset}
      />
    );

    const cityInput = screen.getByPlaceholderText(/city/i);
    await user.type(cityInput, 'San Francisco');

    expect(mockOnChange).toHaveBeenCalled();
  });
});

