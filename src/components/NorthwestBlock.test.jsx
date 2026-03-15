import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NorthwestBlock from './NorthwestBlock';

function NorthwestBlockWithState() {
  const [plotData, setPlotData] = useState({});
  return (
    <NorthwestBlock
      plotData={plotData}
      onUpdate={(id, data) => setPlotData(prev => ({ ...prev, [id]: data }))}
      onClear={(id) => setPlotData(prev => { const n = { ...prev }; delete n[id]; return n; })}
    />
  );
}

function clickPlot(label) {
  const el = screen.getByText(label).closest('[data-testid="plot"]');
  fireEvent.click(el);
}

test('renders all 4 section letters Q R S T', () => {
  render(<NorthwestBlockWithState />);
  expect(screen.getByText('Q')).toBeInTheDocument();
  expect(screen.getByText('R')).toBeInTheDocument();
  expect(screen.getByText('S')).toBeInTheDocument();
  expect(screen.getByText('T')).toBeInTheDocument();
});

test('renders 44 total plots across all sections', () => {
  render(<NorthwestBlockWithState />);
  expect(screen.getAllByTestId('plot')).toHaveLength(44);
});

test('clicking a plot opens the side panel with the correct plot ID', () => {
  render(<NorthwestBlockWithState />);
  expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument();
  clickPlot('Q-1');
  const panel = screen.getByTestId('side-panel');
  expect(panel).toBeInTheDocument();
  expect(panel).toHaveTextContent('Q-1');
});
