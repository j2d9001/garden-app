import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SouthwestBlock from './SouthwestBlock';

function SouthwestBlockWithState() {
  const [plotData, setPlotData] = useState({});
  return (
    <SouthwestBlock
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

test('renders all 3 section letters P O N', () => {
  render(<SouthwestBlockWithState />);
  expect(screen.getByText('P')).toBeInTheDocument();
  expect(screen.getByText('O')).toBeInTheDocument();
  expect(screen.getByText('N')).toBeInTheDocument();
});

test('renders 35 total plots across all sections', () => {
  render(<SouthwestBlockWithState />);
  expect(screen.getAllByTestId('plot')).toHaveLength(35);
});

test('clicking a plot opens the side panel with the correct plot ID', () => {
  render(<SouthwestBlockWithState />);
  expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument();
  clickPlot('P-1');
  const panel = screen.getByTestId('side-panel');
  expect(panel).toBeInTheDocument();
  expect(panel).toHaveTextContent('P-1');
});
