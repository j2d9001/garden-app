import { useState } from 'react';

const SECTIONS = [
  { letter: 'V', total: 7 },
  { letter: 'W', total: 9 },
  { letter: 'X', total: 13 },
  { letter: 'Y', total: 15 },
  { letter: 'Z', total: 19 },
];

const PLOT_W    = 44;   // width of each individual plot cell
const PLOT_H    = 36;   // height of each regular plot row
const CAP_H     = 50;   // height of the upward-pointing triangle cap
const GAP       = 8;    // horizontal gap between sections
const LEFT_PAD  = 20;
const TOP_PAD   = 20;
const BOT_PAD   = 20;

const MAX_ROWS  = (19 - 1) / 2;                          // 9, from Z
const BOTTOM_Y  = TOP_PAD + MAX_ROWS * PLOT_H + CAP_H;  // common bottom edge
const SVG_W     = LEFT_PAD + SECTIONS.length * (2 * PLOT_W + GAP) - GAP + LEFT_PAD;
const SVG_H     = BOTTOM_Y + BOT_PAD;

const STATUS_COLORS = {
  available: '#d6e8c8',
  assigned:  '#8fbe5a',
};

const DEFAULT_DATA = { assignee: '', occupancy: 'available', payment: 'unpaid', notes: '', flagged: false };

function Section({ letter, total, sectionX, selectedId, onSelect, plotData, onHover, onHoverEnd }) {
  const rows      = (total - 1) / 2;
  const plotsTopY = BOTTOM_Y - rows * PLOT_H;
  const capTopY   = plotsTopY - CAP_H;
  const capMidX   = sectionX + PLOT_W;
  const capId     = `${letter}-${total}`;
  const capData   = plotData[capId] || DEFAULT_DATA;
  const capFill   = STATUS_COLORS[capData.occupancy] || STATUS_COLORS.available;

  const capPoints = [
    `${capMidX},${capTopY}`,
    `${sectionX},${plotsTopY}`,
    `${sectionX + 2 * PLOT_W},${plotsTopY}`,
  ].join(' ');

  const plots = [];
  for (let j = 0; j < rows; j++) {
    const y       = plotsTopY + j * PLOT_H;
    const rowNum  = rows - j;                   // row 1 at bottom, row `rows` at top
    const leftId  = `${letter}-${2 * rowNum - 1}`;
    const rightId = `${letter}-${2 * rowNum}`;
    const leftData  = plotData[leftId]  || DEFAULT_DATA;
    const rightData = plotData[rightId] || DEFAULT_DATA;

    plots.push(
      <g key={`L${j}`} data-testid="plot" onClick={e => onSelect(leftId, e.clientX, e.clientY)} onMouseEnter={e => onHover(leftId, e.clientX, e.clientY, leftData.assignee)} onMouseLeave={onHoverEnd} style={{ cursor: 'pointer' }}>
        <rect
          x={sectionX} y={y} width={PLOT_W} height={PLOT_H}
          fill={STATUS_COLORS[leftData.occupancy] || STATUS_COLORS.available}
          stroke={selectedId === leftId ? '#1a3a0a' : '#5a7a3a'}
          strokeWidth={selectedId === leftId ? '2.5' : '1.5'}
        />
        <text x={sectionX + PLOT_W / 2} y={y + (leftData.assignee ? 11 : PLOT_H / 2)}
          textAnchor="middle" dominantBaseline="middle" className="plot-id">
          {leftId}
        </text>
        {leftData.assignee && (
          <text x={sectionX + PLOT_W / 2} y={y + 26}
            textAnchor="middle" dominantBaseline="middle" className="plot-assignee">
            {leftData.assignee}
          </text>
        )}
        {leftData.flagged && (
          <g data-testid="flagged-icon" transform={`translate(${sectionX + PLOT_W - 11}, ${y + 3})`} style={{ pointerEvents: 'none' }}>
            <polygon points="5,0 10,9 0,9" fill="#e07b2a" />
            <text x="5" y="8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white">!</text>
          </g>
        )}
      </g>
    );
    plots.push(
      <g key={`R${j}`} data-testid="plot" onClick={e => onSelect(rightId, e.clientX, e.clientY)} onMouseEnter={e => onHover(rightId, e.clientX, e.clientY, rightData.assignee)} onMouseLeave={onHoverEnd} style={{ cursor: 'pointer' }}>
        <rect
          x={sectionX + PLOT_W} y={y} width={PLOT_W} height={PLOT_H}
          fill={STATUS_COLORS[rightData.occupancy] || STATUS_COLORS.available}
          stroke={selectedId === rightId ? '#1a3a0a' : '#5a7a3a'}
          strokeWidth={selectedId === rightId ? '2.5' : '1.5'}
        />
        <text x={sectionX + PLOT_W + PLOT_W / 2} y={y + (rightData.assignee ? 11 : PLOT_H / 2)}
          textAnchor="middle" dominantBaseline="middle" className="plot-id">
          {rightId}
        </text>
        {rightData.assignee && (
          <text x={sectionX + PLOT_W + PLOT_W / 2} y={y + 26}
            textAnchor="middle" dominantBaseline="middle" className="plot-assignee">
            {rightData.assignee}
          </text>
        )}
        {rightData.flagged && (
          <g data-testid="flagged-icon" transform={`translate(${sectionX + 2 * PLOT_W - 11}, ${y + 3})`} style={{ pointerEvents: 'none' }}>
            <polygon points="5,0 10,9 0,9" fill="#e07b2a" />
            <text x="5" y="8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white">!</text>
          </g>
        )}
      </g>
    );
  }

  return (
    <g className={`section section-${letter}`}>
      {/* Cap plot — upward triangle */}
      <g data-testid="plot" onClick={e => onSelect(capId, e.clientX, e.clientY)} onMouseEnter={e => onHover(capId, e.clientX, e.clientY, capData.assignee)} onMouseLeave={onHoverEnd} style={{ cursor: 'pointer' }}>
        <polygon
          points={capPoints}
          fill={capFill}
          stroke={selectedId === capId ? '#1a3a0a' : '#5a7a3a'}
          strokeWidth={selectedId === capId ? '2.5' : '1.5'}
        />
        <text x={capMidX} y={capTopY + CAP_H * 0.42}
          textAnchor="middle" dominantBaseline="middle" className="cap-letter">
          {letter}
        </text>
        <text x={capMidX} y={capTopY + CAP_H * 0.72}
          textAnchor="middle" dominantBaseline="middle" className="cap-num">
          {capId}
        </text>
        {capData.assignee && (
          <text x={capMidX} y={capTopY + CAP_H * 0.90}
            textAnchor="middle" dominantBaseline="middle" className="plot-assignee">
            {capData.assignee}
          </text>
        )}
        {capData.flagged && (
          <g data-testid="flagged-icon" transform={`translate(${sectionX + 2 * PLOT_W - 11}, ${plotsTopY + 3})`} style={{ pointerEvents: 'none' }}>
            <polygon points="5,0 10,9 0,9" fill="#e07b2a" />
            <text x="5" y="8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white">!</text>
          </g>
        )}
      </g>
      {plots}
    </g>
  );
}

function SidePanel({ plotId, saved, onSave, onCancel, onClear, pos }) {
  const [draft, setDraft] = useState({ ...saved });

  const PANEL_W = 268;
  const PANEL_H = 260;
  const rawLeft = pos.x + 16 + PANEL_W > window.innerWidth ? pos.x - PANEL_W - 8 : pos.x + 16;
  const rawTop  = pos.y + PANEL_H > window.innerHeight ? pos.y - PANEL_H : pos.y - 20;
  const left = Math.max(8, rawLeft);
  const top  = Math.max(8, rawTop);

  function set(field, value) {
    setDraft(prev => ({ ...prev, [field]: value }));
  }

  return (
    <aside data-testid="side-panel" className="nbv-panel" style={{ left, top }}>
      <h2 className="nbv-panel-title">{plotId}</h2>
      <form onSubmit={e => { e.preventDefault(); onSave(draft); }}>
        <div className="nbv-field-row">
          <label htmlFor="nbv-occupancy">Occupancy</label>
          <select id="nbv-occupancy" value={draft.occupancy}
            onChange={e => set('occupancy', e.target.value)}>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
          </select>
        </div>
        <div className="nbv-field-row">
          <label htmlFor="nbv-flagged">Flagged</label>
          <input id="nbv-flagged" type="checkbox" checked={draft.flagged || false}
            onChange={e => set('flagged', e.target.checked)} />
        </div>
        <div className="nbv-field-row">
          <label htmlFor="nbv-assignee">Assignee</label>
          <input id="nbv-assignee" type="text" value={draft.assignee}
            onChange={e => set('assignee', e.target.value)} />
        </div>
        <div className="nbv-field-row">
          <label htmlFor="nbv-payment">Payment</label>
          <select id="nbv-payment" value={draft.payment}
            onChange={e => set('payment', e.target.value)}>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div className="nbv-field-row">
          <label htmlFor="nbv-notes">Notes</label>
          <input id="nbv-notes" type="text" value={draft.notes}
            onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="nbv-actions">
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="button" onClick={onClear}>Clear</button>
        </div>
      </form>
    </aside>
  );
}

export default function NorthBlockVertical({
  plotData = {},
  onUpdate = () => {},
  onClear  = () => {},
  onHover  = () => {},
  onHoverEnd = () => {},
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPos, setSelectedPos] = useState({ x: 0, y: 0 });

  function handleSelect(id, x, y) { setSelectedId(id); setSelectedPos({ x, y }); }
  function handleSave(draft) { onUpdate(selectedId, draft); setSelectedId(null); }
  function handleCancel()    { setSelectedId(null); }
  function handleClear()     { onClear(selectedId); setSelectedId(null); }

  const savedForSelected = selectedId ? (plotData[selectedId] || DEFAULT_DATA) : null;

  return (
    <div className="nbv-root">
      <style>{`
        .nbv-root {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        .nbv-wrap {
          background: #f5f0e8;
          display: inline-block;
          padding: 0;
          flex-shrink: 0;
        }
        .nbv-wrap svg { display: block; }
        .nbv-wrap .section text {
          fill: #2d4a1a;
          font-size: 11px;
          font-family: 'Courier New', monospace;
          pointer-events: none;
        }
        .nbv-wrap .plot-assignee {
          font-size: 8px;
          fill: #1a3a0a;
          font-style: italic;
          pointer-events: none;
        }
        .nbv-wrap .cap-letter {
          font-size: 17px !important;
          font-weight: bold;
          font-family: 'Georgia', serif !important;
          fill: #1a3a0a !important;
        }
        .nbv-wrap .cap-num { font-size: 9px !important; }

        /* ── Side panel ── */
        .nbv-panel {
          position: fixed;
          z-index: 10000;
          background: #f5f0e8;
          border: 1.5px solid #5a7a3a;
          border-radius: 4px;
          padding: 20px 24px;
          min-width: 220px;
          box-shadow: 0 4px 24px rgba(60,40,10,0.28);
        }
        .nbv-panel-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-family: 'Georgia', serif;
          color: #1a3a0a;
          border-bottom: 1px solid #5a7a3a;
          padding-bottom: 8px;
        }
        .nbv-field-row {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 6px;
          align-items: center;
          margin-bottom: 10px;
        }
        .nbv-field-row label {
          font-size: 10px;
          font-family: 'Courier New', monospace;
          color: #5a7a3a;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .nbv-field-row input, .nbv-field-row select {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #2d4a1a;
          background: #ede8dc;
          border: 1px solid #5a7a3a;
          border-radius: 2px;
          padding: 3px 6px;
        }
        .nbv-actions { display: flex; gap: 8px; margin-top: 14px; }
        .nbv-actions button {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          padding: 4px 12px;
          border: 1.5px solid #5a7a3a;
          border-radius: 2px;
          background: #d6e8c8;
          color: #1a3a0a;
          cursor: pointer;
        }
        .nbv-actions button:hover { background: #8fbe5a; }
      `}</style>

      <div className="nbv-wrap">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          height={SVG_H}
          overflow="visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#f5f0e8" />
          {SECTIONS.map((sec, i) => (
            <Section
              key={sec.letter}
              letter={sec.letter}
              total={sec.total}
              sectionX={LEFT_PAD + i * (2 * PLOT_W + GAP)}
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
