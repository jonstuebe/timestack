import { Modal } from './Modal';

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal title="How to play" open={open} onClose={onClose}>
      <p className="lede">Put five historical events in order, earliest at the top.</p>
      <ul className="help-list">
        <li>Drag the cards, or focus one and use the arrow keys or the ▲ ▼ buttons.</li>
        <li>You get <strong>one try</strong> per day. Press <strong>Lock it in</strong> when you're sure.</li>
        <li>Each card then flips to show its date.</li>
      </ul>
      <div className="help-legend">
        <p><span className="swatch result-correct" aria-hidden="true" /> Correct position (1 point)</p>
        <p><span className="swatch result-close" aria-hidden="true" /> One slot off</p>
        <p><span className="swatch result-far" aria-hidden="true" /> Two or more slots off</p>
      </div>
      <p>A new Timestack arrives every day at midnight. Everyone gets the same puzzle.</p>
      <button type="button" className="primary-button" onClick={onClose}>
        Let's play
      </button>
    </Modal>
  );
}
