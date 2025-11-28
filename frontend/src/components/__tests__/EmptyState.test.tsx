/**
 * Component tests for EmptyState
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../../components/ui/EmptyState';

describe('EmptyState', () => {
  it('should render title and message', () => {
    render(
      <EmptyState
        title="No items found"
        message="Try adjusting your filters"
      />
    );
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No items"
        message="Create one"
        actionLabel="Create Item"
        onAction={onAction}
      />
    );
    
    const button = screen.getByRole('button', { name: /create item/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onAction when button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No items"
        message="Create one"
        actionLabel="Create Item"
        onAction={onAction}
      />
    );
    
    const button = screen.getByRole('button', { name: /create item/i });
    await user.click(button);
    
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should not render button when onAction is not provided', () => {
    render(
      <EmptyState
        title="No items"
        message="Nothing here"
      />
    );
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

