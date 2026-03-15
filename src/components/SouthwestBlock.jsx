import { useState } from 'react';

const SECTIONS = [
  { letter: 'P', total: 15 },
  { letter: 'O', total: 11 },
  { letter: 'N', total: 9 },
];

const PLOT_W = 60;
const PLOT_H = 35;
const SECTION_H = PLOT_H * 2;
const GAP = 8;
const CAP_W = 90;
const RIGHT_EDGE = 460;
const TOP_PAD = 24;

const STATUS_COLORS = {
  available: '#d6e8c8',
  assigned:  '#8fbe5a',
};

const DEFAULT_DATA = { assignee: '', occupancy: 'available', payment: 'unpaid', notes: '', flagged: false };

function Section({ letter, total, y, selectedId, onSelect, plotData, onHover, onHoverEnd }) {
  const regular = total - 1;
  const cols = regular / 2;
  const leftEdge = RIGHT_EDGE - cols * PLOT_W;
  const capApexX = leftEdge - CAP_W;
  const capMidY = y + SECTION_H / 2;
  const capId = `${letter}-${total}`;

  const capPoints = [
    `${leftEdge},${y}`,
    `${leftEdge},${y + SECTION_H}`,
    `${capApexX},${capMidY}`,
  ].join(' ');

  const capData = plotData[capId] || DEFAULT_DATA;
  const capFill = STATUS_COLORS[capData.occupancy] || STATUS_COLORS.available;

  const regularPlots = [];
  for (let c = 0; c < cols; c++) {
    const x = RIGHT_EDGE - (c + 1) * PLOT_W;
    const bottomId = `${letter}-${2 * c + 1}`;
    const topId    = `${letter}-${2 * c + 2}`;
    const topData  = plotData[topId]    || DEFAULT_DATA;
    const botData  = plotData[bottomId] || DEFAULT_DATA;

    regularPlots.push(
      <g key={`top-${c}`} data-testid="plot" onClick={e => onSelect(topId, e.clientX, e.clientY)} onMouseEnter={e => onHover(topId, e.clientX, e.clientY, topData.assignee)} onMouseLeave={onHoverEnd} style={{ cursor: 'pointer' }}>
        <rect
          x={x} y={y} width={PLOT_W} height={PLOT_H}
          fill={STATUS_COLORS[topData.occupancy] || STATUS_COLORS.available}
          stroke={selectedId === topId ? '#1a3a0a' : '#5a7a3a'}
          strokeWidth={selectedId === topId ? '2.5' : '1.5'}
        />
        <text x={x + PLOT_W / 2} y={y + (topData.assignee ? 11 : PLOT_H / 2)} textAnchor="middle" dominantBaseline="middle">
          {topId}
        </text>
        {topData.assignee && (
          <text x={x + PLOT_W / 2} y={y + 25} textAnchor="middle" dominantBaseline="middle" className="plot-assignee">
            {topData.assignee}
          </text>
        )}
        {topData.flagged && (
          <g data-testid="flagged-icon" transform={`translate(${x + PLOT_W - 11}, ${y + 3})`} style={{ pointerEvents: 'none' }}>
            <polygon points="5,0 10,9 0,9" fill="#e07b2a" />
            <text x="5" y="8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white">!</text>
          </g>
        )}
      </g>
    );
    regularPlots.push(
      <g key={`bot-${c}`} data-testid="plot" onClick={e => onSelect(bottomId, e.clientX, e.clientY)} onMouseEnter={e => onHover(bottomId, e.clientX, e.clientY, botData.assignee)} onMouseLeave={onHoverEnd} style={{ cursor: 'pointer' }}>
        <rect
          x={x} y={y + PLOT_H} width={PLOT_W} height={PLOT_H}
          fill={STATUS_COLORS[botData.occupancy] || STATUS_COLORS.available}
          stroke={selectedId === bottomId ? '#1a3a0a' : '#5a7a3a'}
          strokeWidth={selectedId === bottomId ? '2.5' : '1.5'}
        />
        <text x={x + PLOT_W / 2} y={y + PLOT_H + (botData.assignee ? 11 : PLOT_H / 2)} textAnchor="middle" dominantBaseline="middle">
          {bottomId}
        </text>
        {botData.assignee && (
          <text x={x + PLOT_W / 2} y={y + PLOT_H + 25} textAnchor="middle" dominantBaseline="middle" className="plot-assignee">
            {botData.assignee}
          </text>
        )}
        {botData.flagged && (
          <g data-testid="flagged-icon" transform={`translate(${x + PLOT_W - 11}, ${y + PLOT_H + 3})`} style={{ pointerEvents: 'none' }}>
            <polygon points="5,0 10,9 0,9" fill="#e07b2a" />
            <text x="5" y="8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white">!</text>
          </g>
        )}
      </g>
    );
  }

  return (
    <g className={`section section-${letter}`}>
      <g data-testid="plot" onClick={e => onSelect(capId, e.clientX, e.clientY)} onMouseEnter={e => onHover(capId, e.clientX, e.clientY, capData.assignee)} onMouseLeave={onHoverEnd} style={{ cursor: 'pointer' }}>
        <polygon
          points={capPoints}
          fill={capFill}
          stroke={selectedId === capId ? '#1a3a0a' : '#5a7a3a'}
          strokeWidth={selectedId === capId ? '2.5' : '1.5'}
        />
        <text x={capApexX + CAP_W * 0.72} y={capMidY} textAnchor="middle" dominantBaseline="middle" className="cap-letter">
          {letter}
        </text>
        <text x={capApexX + CAP_W * 0.72} y={capMidY + 13} textAnchor="middle" dominantBaseline="middle" className="cap-num">
          {capId}
        </text>
        {capData.assignee && (
          <text x={capApexX + CAP_W * 0.72} y={capMidY + 25} textAnchor="middle" dominantBaseline="middle" className="plot-assignee">
            {capData.assignee}
          </text>
        )}
        {capData.flagged && (
          <g data-testid="flagged-icon" transform={`translate(${leftEdge - 11}, ${y + 3})`} style={{ pointerEvents: 'none' }}>
            <polygon points="5,0 10,9 0,9" fill="#e07b2a" />
            <text x="5" y="8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white">!</text>
          </g>
        )}
      </g>
      {regularPlots}
    </g>
  );
}

function SidePanel({ plotId, saved, onSave, onCancel, onClear, pos }) {
  const [draft, setDraft] = useState({ ...saved });
  function set(field, value) { setDraft(prev => ({ ...prev, [field]: value })); }

  const PANEL_W = 268;
  const PANEL_H = 260;
  const rawLeft = pos.x + 16 + PANEL_W > window.innerWidth ? pos.x - PANEL_W - 8 : pos.x + 16;
  const rawTop  = pos.y + PANEL_H > window.innerHeight ? pos.y - PANEL_H : pos.y - 20;
  const left = Math.max(8, rawLeft);
  const top  = Math.max(8, rawTop);

  return (
    <aside data-testid="side-panel" className="swb-side-panel" style={{ left, top }}>
      <h2 className="swb-panel-title">{plotId}</h2>
      <form onSubmit={e => { e.preventDefault(); onSave(draft); }}>
        <div className="swb-field-row">
          <label htmlFor="swb-occupancy">Occupancy</label>
          <select id="swb-occupancy" value={draft.occupancy}
            onChange={e => set('occupancy', e.target.value)}>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
          </select>
        </div>
        <div className="swb-field-row">
          <label htmlFor="swb-flagged">Flagged</label>
          <input id="swb-flagged" type="checkbox" checked={draft.flagged || false}
            onChange={e => set('flagged', e.target.checked)} />
        </div>
        <div className="swb-field-row">
          <label htmlFor="swb-assignee">Assignee</label>
          <input id="swb-assignee" type="text" value={draft.assignee}
            onChange={e => set('assignee', e.target.value)} />
        </div>
        <div className="swb-field-row">
          <label htmlFor="swb-payment">Payment</label>
          <select id="swb-payment" value={draft.payment}
            onChange={e => set('payment', e.target.value)}>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div className="swb-field-row">
          <label htmlFor="swb-notes">Notes</label>
          <input id="swb-notes" type="text" value={draft.notes}
            onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="swb-panel-actions">
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="button" onClick={onClear}>Clear</button>
        </div>
      </form>
    </aside>
  );
}

export default function SouthwestBlock({ plotData = {}, onUpdate = () => {}, onClear = () => {}, onHover = () => {}, onHoverEnd = () => {} }) {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPos, setSelectedPos] = useState({ x: 0, y: 0 });

  const totalHeight = TOP_PAD + SECTIONS.length * SECTION_H + (SECTIONS.length - 1) * GAP + 24;
  const svgWidth = RIGHT_EDGE + 20;

  function handleSelect(id, x, y) { setSelectedId(id); setSelectedPos({ x, y }); }

  function handleSave(draft) {
    onUpdate(selectedId, draft);
    setSelectedId(null);
  }

  function handleCancel() { setSelectedId(null); }

  function handleClear() {
    onClear(selectedId);
    setSelectedId(null);
  }

  const savedForSelected = selectedId ? (plotData[selectedId] || DEFAULT_DATA) : null;

  return (
    <div className="swb-root">
      <style>{`
        .swb-root {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        .swb-wrap {
          background: #f5f0e8;
          display: inline-block;
          padding: 20px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .swb-wrap svg { display: block; }
        .swb-wrap .section text {
          fill: #2d4a1a;
          font-size: 11px;
          font-family: 'Courier New', monospace;
          pointer-events: none;
        }
        .swb-wrap .cap-letter {
          font-size: 17px !important;
          font-weight: bold;
          font-family: 'Georgia', serif !important;
          fill: #1a3a0a !important;
        }
        .swb-wrap .cap-num { font-size: 9px !important; }
        .swb-side-panel {
          position: fixed;
          z-index: 10000;
          background: #f5f0e8;
          border: 1.5px solid #5a7a3a;
          border-radius: 4px;
          padding: 20px 24px;
          min-width: 220px;
          box-shadow: 0 4px 24px rgba(60,40,10,0.28);
        }
        .swb-panel-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-family: 'Georgia', serif;
          color: #1a3a0a;
          border-bottom: 1px solid #5a7a3a;
          padding-bottom: 8px;
        }
        .swb-field-row {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 6px;
          align-items: center;
          margin-bottom: 10px;
        }
        .swb-field-row label {
          font-size: 10px;
          font-family: 'Courier New', monospace;
          color: #5a7a3a;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .swb-field-row input, .swb-field-row select {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #2d4a1a;
          background: #ede8dc;
          border: 1px solid #5a7a3a;
          border-radius: 2px;
          padding: 3px 6px;
        }
        .swb-panel-actions { display: flex; gap: 8px; margin-top: 14px; }
        .swb-panel-actions button {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          padding: 4px 12px;
          border: 1.5px solid #5a7a3a;
          border-radius: 2px;
          background: #d6e8c8;
          color: #1a3a0a;
          cursor: pointer;
        }
        .swb-panel-actions button:hover { background: #8fbe5a; }
      `}</style>
      <div className="swb-wrap">
        <svg
          viewBox={`-${CAP_W} 0 ${svgWidth + CAP_W} ${totalHeight}`}
          width={svgWidth + CAP_W}
          height={totalHeight}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x={0} y={0} width={svgWidth} height={totalHeight} fill="#f5f0e8" />
          {SECTIONS.map((sec, i) => (
            <Section
              key={sec.letter}
              letter={sec.letter}
              total={sec.total}
              y={TOP_PAD + i * (SECTION_H + GAP)}
              selectedId={selectedId}
              onSelect={handleSelect}
              plotData={plotData}
              onHover={onHover}
              onHoverEnd={onHoverEnd}
            />
          ))}
        </svg>
      </div>
      {selectedId && (
        <SidePanel
          key={selectedId}
          plotId={selectedId}
          saved={savedForSelected}
          onSave={handleSave}
          onCancel={handleCancel}
          onClear={handleClear}
          pos={selectedPos}
        />
      )}
    </div>
  );
}
