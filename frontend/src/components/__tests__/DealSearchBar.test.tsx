/**
 * Component tests for DealSearchBar
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { DealSearchBar } from '../../components/deals/DealSearchBar';

describe('DealSearchBar', () => {
  it('should render search input', () => {
    const onChange = vi.fn();
    render(<DealSearchBar value="" onChange={onChange} />);
    
    expect(screen.getByPlaceholderText(/search deals/i)).toBeInTheDocument();
  });

  it('should call onChange with debounced value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DealSearchBar value="" onChange={onChange} />);
    
    const input = screen.getByPlaceholderText(/search deals/i);
    await user.type(input, 'test search');
    
    // Wait for debounce (300ms)
    await new Promise(resolve => setTimeout(resolve, 350));
    
    expect(onChange).toHaveBeenCalledWith('test search');
  });

  it('should display initial value', () => {
    const onChange = vi.fn();
    render(<DealSearchBar value="initial search" onChange={onChange} />);
    
    expect(screen.getByPlaceholderText(/search deals/i)).toHaveValue('initial search');
  });
});

