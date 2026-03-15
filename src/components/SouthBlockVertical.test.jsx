import { render, screen, fireEvent } from '@testing-library/react';
import SouthBlockVertical from './SouthBlockVertical';

describe('SouthBlockVertical', () => {
  test('renders all 3 section letters I J K', () => {
    render(<SouthBlockVertical />);
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  test('renders 47 total plots', () => {
    render(<SouthBlockVertical />);
    expect(screen.getAllByTestId('plot')).toHaveLength(47);
  });

  test('clicking a plot opens the side panel with the correct plot ID', () => {
    render(<SouthBlockVertical />);
    const plotI1 = screen.getByText('I-1').closest('[data-testid="plot"]');
    fireEvent.click(plotI1);
    expect(screen.getByTestId('side-panel')).toBeInTheDocument();
    expect(screen.getByText('I-1', { selector: 'h2' })).toBeInTheDocument();
  });
});
