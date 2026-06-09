import { create } from 'zustand';
import { api } from '../lib/api';
import type { Card, Column, Board } from '../types';

interface BoardState {
  board: Board | null;
  loading: boolean;
  loadBoard: (id: string) => Promise<void>;
  addCard: (title: string, description: string, columnId: string) => Promise<void>;
  moveCard: (cardId: string, columnId: string, position: number) => Promise<void>;
  deleteCard: (cardId: string) => void;
  setBoard: (board: Board) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  loading: false,
  loadBoard: async (id) => {
    set({ loading: true });
    const board = await api.boards.get(id);
    set({ board, loading: false });
  },
  addCard: async (title, description, columnId) => {
    const card = await api.cards.create({ title, description, columnId });
    const board = get().board;
    if (!board) return;
    const columns = board.columns.map((col) =>
      col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
    );
    set({ board: { ...board, columns } });
  },
  moveCard: async (cardId, columnId, position) => {
    await api.cards.move(cardId, columnId, position);
    const board = get().board;
    if (!board) return;
    let movedCard: Card | null = null;
    const withoutCard = board.columns.map((col) => {
      const idx = col.cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) { movedCard = col.cards[idx]; return { ...col, cards: col.cards.filter((_, i) => i !== idx) }; }
      return col;
    });
    if (!movedCard) return;
    const columns = withoutCard.map((col) =>
      col.id === columnId ? { ...col, cards: [...col.cards.slice(0, position), { ...movedCard!, columnId }, ...col.cards.slice(position)] } : col
    );
    set({ board: { ...board, columns } });
  },
  deleteCard: (cardId) => {
    const board = get().board;
    if (!board) return;
    const columns = board.columns.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== cardId) }));
    set({ board: { ...board, columns } });
    api.cards.delete(cardId).catch(() => {});
  },
  setBoard: (board) => set({ board }),
}));
