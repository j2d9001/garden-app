import { useState, useEffect } from 'react';
import NorthBlockVertical from './NorthBlockVertical';
import NorthwestBlock from './NorthwestBlock';
import SouthwestBlock from './SouthwestBlock';
import SouthBlockVertical from './SouthBlockVertical';
import { supabase } from '../supabaseClient';

const TOTAL = 189;

function rowToLocal(row) {
  return {
    assignee:  row.assignee  || '',
    occupancy: row.occupancy_status,
    payment:   row.payment_status,
    flagged:   row.flagged   || false,
    notes:     row.notes     || '',
  };
}

function localToRow(id, data) {
  return {
    id,
    assignee:         data.assignee || null,
    occupancy_status: data.occupancy,
    payment_status:   data.payment,
    flagged:          data.flagged,
    notes:            data.notes || null,
  };
}

export default function GardenMap() {
  const [plotData, setPlotData] = useState({});
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [tooltip,  setTooltip]  = useState(null);

  useEffect(() => {
    async function fetchPlots() {
      const { data, error } = await supabase.from('plots').select('*');
      if (error) {
        setError(error.message);
      } else {
        const mapped = {};
        for (const row of data) mapped[row.id] = rowToLocal(row);
        setPlotData(mapped);
      }
      setLoading(false);
    }
    fetchPlots();
  }, []);

  async function handleUpdate(id, data) {
    setPlotData(prev => ({ ...prev, [id]: data }));
    await supabase.from('plots').upsert(localToRow(id, data));
  }

  async function handleClear(id) {
    setPlotData(prev => { const n = { ...prev }; delete n[id]; return n; });
    await supabase.from('plots').upsert({
      id, assignee: null, occupancy_status: 'available', payment_status: 'unpaid', flagged: false, notes: null,
    });
  }

  function handleHover(id, x, y, assignee) {
    setTooltip({ id, x, y, assignee });
  }

  function handleHoverEnd() {
    setTooltip(null);
  }

  if (loading) return <div>Loading...</div>;
  if (error)   return <div>Error: {error}</div>;

  const assigned  = Object.values(plotData).filter(d => d.occupancy === 'assigned').length;
  const flagged   = Object.values(plotData).filter(d => d.flagged === true).length;
  const available = TOTAL - assigned;

  return (
    <div className="gm-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');

        * { box-sizing: border-box; }

        .gm-root {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #d4c9b0;
          background-image:
            repeating-linear-gradient(0deg,  transparent, transparent 19px, rgba(80,55,20,0.09) 19px, rgba(80,55,20,0.09) 20px),
            repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(80,55,20,0.06) 19px, rgba(80,55,20,0.06) 20px);
          padding: 20px 24px 32px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        /* ── Masthead ── */
        .gm-masthead {
          background: #1a2e0c;
          border: 2px solid #0d1a06;
          border-bottom: none;
          padding: 14px 28px 12px;
          text-align: center;
          position: relative;
        }
        .gm-masthead::before, .gm-masthead::after {
          content: '◆';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: #c8a84a;
          opacity: 0.85;
        }
        .gm-masthead::before { left: 14px; }
        .gm-masthead::after  { right: 14px; }
        .gm-title {
          margin: 0;
          font-family: 'IM Fell English', 'Georgia', serif;
          font-size: 30px;
          font-weight: normal;
          color: #e8dfc8;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .gm-subtitle {
          margin: 4px 0 0;
          font-family: 'Courier New', monospace;
          font-size: 9px;
          color: #8faa60;
          letter-spacing: 0.26em;
          text-transform: uppercase;
        }
        .gm-masthead-rule {
          border: none;
          border-top: 1px solid rgba(200,168,74,0.35);
          margin: 8px 0 0;
        }

        /* ── Ledger ── */
        .gm-ledger {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: #f0e9d8;
          border: 2px solid #0d1a06;
          border-top: 1.5px solid #3a5820;
          border-bottom: 3px solid #0d1a06;
          box-shadow: 3px 4px 0 #0d1a06;
          margin-bottom: 16px;
        }
        .gm-ledger-cell {
          padding: 10px 18px;
          border-right: 1px solid #9aae78;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .gm-ledger-cell:last-child { border-right: none; }
        .gm-ledger-label {
          font-family: 'Courier New', monospace;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #4a6a28;
        }
        .gm-ledger-value {
          font-family: 'Georgia', serif;
          font-size: 30px;
          font-weight: bold;
          color: #1a2e0c;
          line-height: 1;
        }
        .gm-ledger-cell.gm-available { background: rgba(140,185,90,0.10); }
        .gm-ledger-cell.gm-available .gm-ledger-value { color: #2e5a10; }
        .gm-ledger-cell.gm-assigned  { background: rgba(58,106,16,0.14); border-left: 3px solid #5a9020; }
        .gm-ledger-cell.gm-assigned  .gm-ledger-value { color: #3a6a10; }
        .gm-ledger-cell.gm-flagged   { background: rgba(180,80,0,0.09);  border-left: 3px solid #b05010; }
        .gm-ledger-cell.gm-flagged   .gm-ledger-value { color: #8a3800; }

        /* ── Map frame: fills remaining viewport height ── */
        .gm-map-frame {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          border: 2px solid #0d1a06;
          box-shadow: 3px 4px 0 #0d1a06;
          background: #f0e9d8;
          padding: 12px;
          overflow: hidden;
        }

        /* ── 4-column horizontal row ──
             Proportional fr columns match each block's natural SVG width:
             SBV(320) | SWB(480) | NWB(520) | NBV(512)
             Everything scales uniformly to fill the frame width.
        ── */
        .gm-grid {
          display: grid;
          /* minmax(0, Nfr) pins each track's minimum to 0 so no column
             can grow beyond its fr share when side panel content overflows */
          grid-template-columns: minmax(0,320fr) minmax(0,480fr) minmax(0,520fr) minmax(0,512fr);
          gap: 4px;
          align-items: start;
        }

        .gm-block-wrap { display: flex; flex-direction: column; min-width: 0; }

        .gm-block-label {
          font-family: 'Courier New', monospace;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #6a8840;
          margin-bottom: 2px;
          padding-left: 2px;
        }

        /* ── Block roots fill their grid column width; min-width:0 prevents
             the flex root from forcing the grid cell wider ── */
        .gm-grid .nbv-root,
        .gm-grid .nwb-root,
        .gm-grid .swb-root,
        .gm-grid .sbv-root {
          width: 100%;
          min-width: 0;
        }

        /* ── Block SVG wrappers fill their column width ── */
        .gm-grid .nbv-wrap,
        .gm-grid .nwb-wrap,
        .gm-grid .swb-wrap,
        .gm-grid .sbv-wrap {
          padding: 6px !important;
          box-shadow: none !important;
          width: 100%;
        }

        /* ── SVGs scale to column width; height follows aspect ratio ── */
        .gm-grid svg {
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
          display: block;
        }

        /* ── Larger base font for plot labels ── */
        .gm-grid .section text { font-size: 11px !important; }
        .gm-grid .cap-letter   { font-size: 17px !important; }
        .gm-grid .cap-num      { font-size:  9px !important; }
        .gm-grid .plot-assignee {
          font-size: 8px !important;
          opacity: 0.85;
          font-style: italic;
        }

        /* ── Plot hover cursor ── */
        .gm-grid [data-testid="plot"] { cursor: pointer; }

        /* ── Floating HTML tooltip — renders above everything ── */
        .gm-tooltip {
          position: fixed;
          pointer-events: none;
          z-index: 99999;
          background: #1a2e0c;
          border: 1px solid rgba(200,168,74,0.55);
          border-radius: 4px;
          padding: 10px 20px 12px;
          box-shadow: 0 6px 28px rgba(0,0,0,0.55);
          white-space: nowrap;
          transform: translate(18px, -50%);
        }
        .gm-tooltip-id {
          font-family: 'IM Fell English', 'Georgia', serif;
          font-size: 36px;
          font-weight: normal;
          color: #e8dfc8;
          letter-spacing: 0.06em;
          line-height: 1;
        }
        .gm-tooltip-assignee {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          color: #8faa60;
          margin-top: 6px;
          letter-spacing: 0.05em;
        }
      `}</style>

      <header className="gm-masthead">
        <h1 className="gm-title">Garden Plot Map</h1>
        <p className="gm-subtitle">Community Garden &mdash; Plot Registry &mdash; 2026</p>
        <hr className="gm-masthead-rule" />
      </header>

      <div className="gm-ledger">
        <div className="gm-ledger-cell">
          <span className="gm-ledger-label">Total Plots</span>
          <span data-testid="global-stat-total" className="gm-ledger-value">{TOTAL}</span>
        </div>
        <div className="gm-ledger-cell gm-available">
          <span className="gm-ledger-label">Available</span>
          <span data-testid="global-stat-available" className="gm-ledger-value">{available}</span>
        </div>
        <div className="gm-ledger-cell gm-assigned">
          <span className="gm-ledger-label">Assigned</span>
          <span data-testid="global-stat-assigned" className="gm-ledger-value">{assigned}</span>
        </div>
        <div className="gm-ledger-cell gm-flagged">
          <span className="gm-ledger-label">Flagged</span>
          <span data-testid="global-stat-flagged" className="gm-ledger-value">{flagged}</span>
        </div>
      </div>

      <div className="gm-map-frame">
        <div className="gm-grid">
          <div className="gm-block-wrap">
            <div className="gm-block-label">South — I J K</div>
            <SouthBlockVertical plotData={plotData} onUpdate={handleUpdate} onClear={handleClear} onHover={handleHover} onHoverEnd={handleHoverEnd} />
          </div>
          <div className="gm-block-wrap">
            <div className="gm-block-label">Southwest — P O N</div>
            <SouthwestBlock plotData={plotData} onUpdate={handleUpdate} onClear={handleClear} onHover={handleHover} onHoverEnd={handleHoverEnd} />
          </div>
          <div className="gm-block-wrap">
            <div className="gm-block-label">Northwest — Q R S T</div>
            <NorthwestBlock plotData={plotData} onUpdate={handleUpdate} onClear={handleClear} onHover={handleHover} onHoverEnd={handleHoverEnd} />
          </div>
          <div className="gm-block-wrap">
            <div className="gm-block-label">North — Z Y X W V</div>
            <NorthBlockVertical plotData={plotData} onUpdate={handleUpdate} onClear={handleClear} onHover={handleHover} onHoverEnd={handleHoverEnd} />
          </div>
        </div>
      </div>

      {tooltip && (
        <div className="gm-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="gm-tooltip-id">{tooltip.id}</div>
          {tooltip.assignee && (
            <div className="gm-tooltip-assignee">{tooltip.assignee}</div>
          )}
        </div>
      )}
    </div>
  );
}
