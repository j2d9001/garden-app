import { render, screen, fireEvent } from '@testing-library/react';
import NorthBlockVertical from './NorthBlockVertical';

describe('NorthBlockVertical', () => {
  test('renders all 5 section letters Z Y X W V', () => {
    render(<NorthBlockVertical />);
    expect(screen.getByText('Z')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('V')).toBeInTheDocument();
  });

  test('renders 63 total plots', () => {
    render(<NorthBlockVertical />);
    expect(screen.getAllByTestId('plot')).toHaveLength(63);
  });

  test('clicking a plot opens the side panel with the correct plot ID', () => {
    render(<NorthBlockVertical />);
    const plotZ1 = screen.getByText('Z-1').closest('[data-testid="plot"]');
    fireEvent.click(plotZ1);
    expect(screen.getByTestId('side-panel')).toBeInTheDocument();
    expect(screen.getByText('Z-1', { selector: 'h2' })).toBeInTheDocument();
  });

  test('cap plot uses the same available color as regular plots', () => {
    render(<NorthBlockVertical />);
    const capGroup = screen.getByText('Z-19').closest('[data-testid="plot"]');
    const polygon = capGroup.querySelector('polygon');
    expect(polygon).toHaveAttribute('fill', '#d6e8c8');
  });

  test('flagged icon appears on a plot when flagged is true', () => {
    const plotData = { 'Z-1': { assignee: '', occupancy: 'available', payment: 'unpaid', notes: '', flagged: true } };
    render(<NorthBlockVertical plotData={plotData} />);
    expect(screen.getAllByTestId('flagged-icon')).toHaveLength(1);
  });

  test('side panel has Flagged checkbox that can be checked', () => {
    render(<NorthBlockVertical />);
    const plot = screen.getByText('Z-1').closest('[data-testid="plot"]');
    fireEvent.click(plot, { clientX: 200, clientY: 300 });
    const checkbox = screen.getByLabelText('Flagged');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('side panel appears near the clicked plot position', () => {
    render(<NorthBlockVertical />);
    const plotZ1 = screen.getByText('Z-1').closest('[data-testid="plot"]');
    fireEvent.click(plotZ1, { clientX: 200, clientY: 300 });
    const panel = screen.getByTestId('side-panel');
    expect(panel.style.left).not.toBe('');
    expect(panel.style.top).not.toBe('');
  });
});
