export interface User {
  id: string; username: string; email: string; createdAt: string;
}

export interface Card {
  id: string; title: string; description: string; columnId: string; position: number; createdAt: string; updatedAt: string;
}

export interface Column {
  id: string; title: string; boardId?: string; position: number; cards: Card[];
}

export interface Board {
  id: string; title: string; ownerId?: string; createdAt?: string; columns: Column[];
}

export interface WSMessage {
  type: 'board:update' | 'board:delete' | 'card:move' | 'card:update' | 'card:create' | 'card:delete';
  payload: unknown;
}
