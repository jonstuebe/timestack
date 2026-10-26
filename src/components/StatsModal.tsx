import type { Stats } from '../lib/storage';
import { averageScore } from '../lib/storage';
import { Modal } from './Modal';

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  currentStreak: number;
  latestScore: number | null;
}

export function StatsModal({ open, onClose, stats, currentStreak, latestScore }: StatsModalProps) {
  const max = Math.max(1, ...stats.distribution);
  const avg = averageScore(stats);
  const tiles = [
    { label: 'Played', value: stats.played },
    { label: 'Average score', value: stats.played ? avg.toFixed(1) : '–' },
    { label: 'Current streak', value: currentStreak },
    { label: 'Max streak', value: stats.maxStreak },
  ];

  return (
    <Modal title="Statistics" open={open} onClose={onClose}>
      <dl className="stat-tiles">
        {tiles.map((t) => (
          <div key={t.label} className="stat-tile">
            <dt>{t.label}</dt>
            <dd>{t.value}</dd>
          </div>
        ))}
      </dl>
      <h3 className="section-label">Score distribution</h3>
      <ol className="distribution" reversed>
        {stats.distribution
          .map((count, score) => ({ count, score }))
          .reverse()
          .map(({ count, score }) => (
            <li key={score} className="dist-row">
              <span className="dist-label">{score}</span>
              <span className="dist-track">
                <span
                  className={`dist-bar${score === latestScore ? ' dist-latest' : ''}`}
                  style={{ width: `${Math.max(8, (count / max) * 100)}%` }}
                  aria-label={`Score ${score}: ${count} ${count === 1 ? 'game' : 'games'}${score === latestScore ? ', your latest score' : ''}`}
                >
                  {count}
                </span>
              </span>
            </li>
          ))}
      </ol>
    </Modal>
  );
}
