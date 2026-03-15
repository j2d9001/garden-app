import { render, screen, fireEvent } from '@testing-library/react';
import GardenMap from './GardenMap';

test('renders section letters from all four blocks', () => {
  render(<GardenMap />);
  expect(screen.getByText('Z')).toBeInTheDocument();
  expect(screen.getByText('Q')).toBeInTheDocument();
  expect(screen.getByText('P')).toBeInTheDocument();
  expect(screen.getByText('I')).toBeInTheDocument();
});

test('global stats bar shows 189 total plots', () => {
  render(<GardenMap />);
  expect(screen.getByTestId('global-stat-total')).toHaveTextContent('189');
});

test('a plot can be assigned and flagged simultaneously', () => {
  render(<GardenMap />);
  const z1 = screen.getByText('Z-1').closest('[data-testid="plot"]');
  fireEvent.click(z1, { clientX: 400, clientY: 400 });
  fireEvent.change(screen.getByLabelText('Occupancy'), { target: { value: 'assigned' } });
  fireEvent.click(screen.getByLabelText('Flagged'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  const rect = screen.getByText('Z-1').closest('[data-testid="plot"]').querySelector('rect');
  expect(rect).toHaveAttribute('fill', '#8fbe5a');
  expect(screen.getByTestId('flagged-icon')).toBeInTheDocument();
});

test('flagged stat counts plots with flagged true regardless of occupancy status', () => {
  render(<GardenMap />);

  // Flag an available plot
  const z1 = screen.getByText('Z-1').closest('[data-testid="plot"]');
  fireEvent.click(z1, { clientX: 400, clientY: 400 });
  fireEvent.click(screen.getByLabelText('Flagged'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  // Assign and flag a second plot
  const z2 = screen.getByText('Z-2').closest('[data-testid="plot"]');
  fireEvent.click(z2, { clientX: 400, clientY: 400 });
  fireEvent.change(screen.getByLabelText('Occupancy'), { target: { value: 'assigned' } });
  fireEvent.click(screen.getByLabelText('Flagged'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(screen.getByTestId('global-stat-flagged')).toHaveTextContent('2');
  expect(screen.getByTestId('global-stat-assigned')).toHaveTextContent('1');
});

test('saving a plot as assigned in any block updates global stats bar', () => {
  render(<GardenMap />);
  const z1 = screen.getByText('Z-1').closest('[data-testid="plot"]');
  fireEvent.click(z1);
  fireEvent.change(screen.getByLabelText('Occupancy'), { target: { value: 'assigned' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByTestId('global-stat-assigned')).toHaveTextContent('1');
});
