import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/game';

describe('smoke', () => {
  it('initial state created', () => {
    const state = createInitialState();
    expect(state.status).toBe('playing');
    expect(state.player.hp).toBe(100);
    expect(state.villain.hp).toBe(100);
  });
});
