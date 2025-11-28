/**
 * Component tests for Skeleton components
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Skeleton, SkeletonText, SkeletonCard } from '../../components/ui/Skeleton';

describe('Skeleton', () => {
  it('should render skeleton with default styles', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('bg-gray-200', 'animate-pulse');
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should apply width and height styles', () => {
    const { container } = render(<Skeleton width={100} height={50} />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.width).toBe('100px');
    expect(skeleton.style.height).toBe('50px');
  });
});

describe('SkeletonText', () => {
  it('should render specified number of lines', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll('.bg-gray-200');
    expect(lines.length).toBe(3);
  });
});

describe('SkeletonCard', () => {
  it('should render card skeleton', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow');
  });
});

