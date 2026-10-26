import { Modal } from './Modal';

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal title="How to play" open={open} onClose={onClose}>
      <p className="lede">Put five historical events in order, earliest at the top.</p>
      <ul className="help-list">
        <li>Slide the cards along the rod, or focus one and use the arrow keys or the arrow buttons.</li>
        <li>You get <strong>one try</strong> per day. Press <strong>Lock it in</strong> when you're sure.</li>
        <li>Each card is then stamped with its date, and its hole shows how you did:</li>
      </ul>
      <div className="help-legend">
        <p><span className="swatch result-correct" aria-hidden="true"><span className="card-hole" /></span> Filled: right place (1 point)</p>
        <p><span className="swatch result-close" aria-hidden="true"><span className="card-hole" /></span> Half: one slot off</p>
        <p><span className="swatch result-far" aria-hidden="true"><span className="card-hole" /></span> Hollow: two or more slots off</p>
      </div>
      <p>A new Timestack arrives at midnight. Everyone gets the same five cards.</p>
      <button type="button" className="primary-button" onClick={onClose}>
        Let's play
      </button>
    </Modal>
  );
}
