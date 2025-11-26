/**
 * Component tests for CapRatePerDealChart
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { CapRatePerDealChart } from '../CapRatePerDealChart';
import { mockDeals } from '../../../test/mockData';

describe('CapRatePerDealChart', () => {
  it('should render chart with deals data', () => {
    const { container } = render(<CapRatePerDealChart deals={mockDeals} />);
    
    // Chart should render (Recharts creates SVG)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should show message when no cap rate data available', () => {
    const dealsWithoutAnalytics = mockDeals.map(deal => ({
      ...deal,
      snapshot_of_analytics_result: undefined,
    }));

    render(<CapRatePerDealChart deals={dealsWithoutAnalytics} />);
    
    expect(screen.getByText(/no cap rate data available/i)).toBeInTheDocument();
  });

  it('should handle empty deals array', () => {
    render(<CapRatePerDealChart deals={[]} />);
    
    expect(screen.getByText(/no cap rate data available/i)).toBeInTheDocument();
  });
});

