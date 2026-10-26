import { useMemo, type KeyboardEvent } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PuzzleEvent } from '../lib/types';
import { categoryIcon } from '../lib/icons';
import { ArrowIcon } from './Icons';

interface BoardProps {
  events: Record<string, PuzzleEvent>;
  order: string[];
  onChange: (order: string[]) => void;
  announce: (message: string) => void;
}

const INSTRUCTIONS_ID = 'card-instructions';

const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

export function Board({ events, order, onChange, announce }: BoardProps) {
  // A small distance threshold lets taps on the move buttons through without starting a drag.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const total = order.length;

  const positionOf = (id: UniqueIdentifier) => order.indexOf(String(id)) + 1;
  const titleOf = (id: UniqueIdentifier) => events[String(id)]?.title ?? '';

  const accessibility = useMemo(
    () => ({
      screenReaderInstructions: { draggable: 'Use the up and down arrow keys to move this card.' },
      announcements: {
        onDragStart: ({ active }: { active: { id: UniqueIdentifier } }) => `Picked up ${titleOf(active.id)}.`,
        onDragOver: () => undefined,
        onDragEnd: () => undefined,
        onDragCancel: ({ active }: { active: { id: UniqueIdentifier } }) => `Cancelled moving ${titleOf(active.id)}.`,
      },
    }),
    [events],
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= total || from === to) return;
    const id = order[from];
    onChange(arrayMove(order, from, to));
    announce(`Moved ${events[id].title} to position ${to + 1} of ${total}.`);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    move(positionOf(active.id) - 1, positionOf(over.id) - 1);
  };

  return (
    <div className="board">
      <p className="axis-label" aria-hidden="true">Earliest</p>
      <p id={INSTRUCTIONS_ID} className="visually-hidden">
        Use the up and down arrow keys, or the move buttons, to reorder this card. Earliest event goes at the top.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[verticalOnly]} accessibility={accessibility}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="stack" aria-label="Events, earliest at the top">
            {order.map((id, index) => (
              <SortableCard key={id} event={events[id]} index={index} total={total} onMove={move} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <p className="axis-label" aria-hidden="true">Latest</p>
    </div>
  );
}

interface SortableCardProps {
  event: PuzzleEvent;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
}

function SortableCard({ event, index, total, onMove }: SortableCardProps) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: event.id });
  const icon = categoryIcon(event.category);

  const onKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.target !== e.currentTarget) return;
    const to = { ArrowUp: index - 1, ArrowDown: index + 1, Home: 0, End: total - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    onMove(index, to);
  };

  return (
    <li
      ref={setNodeRef}
      className={`card card-sortable${isDragging ? ' dragging' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-id={event.id}
      tabIndex={0}
      aria-label={`${event.title}. Position ${index + 1} of ${total}.`}
      aria-describedby={INSTRUCTIONS_ID}
      onKeyDown={onKeyDown}
      {...listeners}
    >
      <span className="card-hole" aria-hidden="true" />
      {icon && <span className="card-icon" aria-hidden="true">{icon}</span>}
      <span className="card-title">{event.title}</span>
      <span className="card-moves">
        <button
          type="button"
          className="move-button"
          tabIndex={-1}
          aria-label={`Move ${event.title} earlier`}
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
        >
          <ArrowIcon direction="up" />
        </button>
        <button
          type="button"
          className="move-button"
          tabIndex={-1}
          aria-label={`Move ${event.title} later`}
          disabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
        >
          <ArrowIcon direction="down" />
        </button>
      </span>
    </li>
  );
}
