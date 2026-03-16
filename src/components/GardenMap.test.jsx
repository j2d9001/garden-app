import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import GardenMap from './GardenMap';

vi.mock('../supabaseClient', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '../supabaseClient';

beforeEach(() => {
  supabase.from.mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
  });
});

// --- new tests (should fail before implementation) ---

test('GardenMap shows a loading state while data is being fetched', () => {
  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
  });
  render(<GardenMap />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('GardenMap renders the map after data loads successfully', async () => {
  render(<GardenMap />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(await screen.findByText('Z')).toBeInTheDocument();
});

// --- existing tests (updated to async findByText) ---

test('renders section letters from all four blocks', async () => {
  render(<GardenMap />);
  expect(await screen.findByText('Z')).toBeInTheDocument();
  expect(screen.getByText('Q')).toBeInTheDocument();
  expect(screen.getByText('P')).toBeInTheDocument();
  expect(screen.getByText('I')).toBeInTheDocument();
});

test('global stats bar shows 189 total plots', async () => {
  render(<GardenMap />);
  await screen.findByText('Z');
  expect(screen.getByTestId('global-stat-total')).toHaveTextContent('189');
});

test('a plot can be assigned and flagged simultaneously', async () => {
  render(<GardenMap />);
  const z1 = (await screen.findByText('Z-1')).closest('[data-testid="plot"]');
  fireEvent.click(z1, { clientX: 400, clientY: 400 });
  fireEvent.change(screen.getByLabelText('Occupancy'), { target: { value: 'assigned' } });
  fireEvent.click(screen.getByLabelText('Flagged'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  const rect = screen.getByText('Z-1').closest('[data-testid="plot"]').querySelector('rect');
  expect(rect).toHaveAttribute('fill', '#8fbe5a');
  expect(screen.getByTestId('flagged-icon')).toBeInTheDocument();
});

test('flagged stat counts plots with flagged true regardless of occupancy status', async () => {
  render(<GardenMap />);

  const z1 = (await screen.findByText('Z-1')).closest('[data-testid="plot"]');
  fireEvent.click(z1, { clientX: 400, clientY: 400 });
  fireEvent.click(screen.getByLabelText('Flagged'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  const z2 = screen.getByText('Z-2').closest('[data-testid="plot"]');
  fireEvent.click(z2, { clientX: 400, clientY: 400 });
  fireEvent.change(screen.getByLabelText('Occupancy'), { target: { value: 'assigned' } });
  fireEvent.click(screen.getByLabelText('Flagged'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(screen.getByTestId('global-stat-flagged')).toHaveTextContent('2');
  expect(screen.getByTestId('global-stat-assigned')).toHaveTextContent('1');
});

test('saving a plot as assigned in any block updates global stats bar', async () => {
  render(<GardenMap />);
  const z1 = (await screen.findByText('Z-1')).closest('[data-testid="plot"]');
  fireEvent.click(z1);
  fireEvent.change(screen.getByLabelText('Occupancy'), { target: { value: 'assigned' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByTestId('global-stat-assigned')).toHaveTextContent('1');
});
