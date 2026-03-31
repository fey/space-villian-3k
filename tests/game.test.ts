import { describe, expect, it } from 'vitest';
import { createInitialState, processTurn, type RNG, type PlayerAction } from '../src/game';

const scriptedRng = (values: number[], chances: boolean[] = []): RNG => {
  const valueQueue = [...values];
  const chanceQueue = [...chances];

  return {
    range: (min, max) => {
      const next = valueQueue.shift();
      if (next === undefined) {
        throw new Error('RNG range queue exhausted');
      }

      if (next < min || next > max) {
        throw new Error(`RNG value ${next} outside [${min}, ${max}]`);
      }

      return next;
    },
    chance: () => {
      const next = chanceQueue.shift();
      if (next === undefined) {
        throw new Error('RNG chance queue exhausted');
      }
      return next;
    },
  };
};

const runTurn = (action: PlayerAction, values: number[], chances: boolean[] = []) =>
  processTurn(createInitialState(), action, scriptedRng(values, chances));

describe('game engine', () => {
  it('PLAYER_ATTACK наносит 4-8 урона и дает +2 энергии', () => {
    const state = runTurn(
      { type: 'PLAYER_ATTACK' },
      [7, 5, 9], // player dmg, villain roll, villain dmg
    );

    expect(state.villain.hp).toBe(93);
    expect(state.player.energy).toBe(2);
    expect(state.player.hp).toBe(100);
    expect(state.log[0].action).toBe('attack');
    expect(state.log[0].value).toBe(7);
  });

  it('PLAYER_HEAL тратит 3 энергии и лечит игрока, но не выше max hp', () => {
    const initial = createInitialState();
    initial.player.hp = 95;
    initial.player.energy = 5;

    const state = processTurn(initial, { type: 'PLAYER_HEAL' }, scriptedRng([10, 26, 6]));

    expect(state.player.energy).toBe(2);
    expect(state.player.hp).toBe(94); // clamp(95+10)-6 villain attack
    expect(state.log[0].action).toBe('heal');
    expect(state.log[0].value).toBe(10);
  });

  it('PLAYER_HEAL при недостатке энергии не делает ход врага', () => {
    const state = runTurn({ type: 'PLAYER_HEAL' }, []);

    expect(state.turn).toBe(1);
    expect(state.player.hp).toBe(100);
    expect(state.log).toHaveLength(1);
    expect(state.log[0].action).toBe('invalid');
  });

  it('PLAYER_CHARGE дает 6-10 энергии с ограничением по максимуму', () => {
    const initial = createInitialState();
    initial.player.energy = 18;

    const state = processTurn(initial, { type: 'PLAYER_CHARGE' }, scriptedRng([10, 5, 8]));

    expect(state.player.energy).toBe(20);
    expect(state.log[0].action).toBe('charge');
    expect(state.log[0].value).toBe(10);
  });

  it('PLAYER_SPECIAL тратит 10 энергии и наносит 10-20 урона', () => {
    const initial = createInitialState();
    initial.player.energy = 12;

    const state = processTurn(initial, { type: 'PLAYER_SPECIAL' }, scriptedRng([15, 5, 8]));

    expect(state.player.energy).toBe(2);
    expect(state.villain.hp).toBe(85);
    expect(state.log[0].action).toBe('special');
    expect(state.log[0].value).toBe(15);
  });

  it('враг лечится при hp < 50% и успешном chance', () => {
    const initial = createInitialState();
    initial.villain.hp = 48;

    const state = processTurn(
      initial,
      { type: 'PLAYER_CHARGE' },
      scriptedRng([6, 7], [true]),
    );

    expect(state.villain.hp).toBe(55);
    expect(state.log[1].actor).toBe('villain');
    expect(state.log[1].action).toBe('heal');
  });

  it('враг может промахнуться', () => {
    const state = runTurn({ type: 'PLAYER_ATTACK' }, [4, 9]);

    expect(state.player.hp).toBe(100);
    expect(state.log[1].action).toBe('miss');
  });

  it('крит врага удваивает урон', () => {
    const state = runTurn({ type: 'PLAYER_ATTACK' }, [4, 20, 6]);

    expect(state.player.hp).toBe(88);
    expect(state.log[1].value).toBe(12);
  });

  it('игра завершается победой игрока до хода врага', () => {
    const initial = createInitialState();
    initial.villain.hp = 5;

    const state = processTurn(initial, { type: 'PLAYER_ATTACK' }, scriptedRng([8]));

    expect(state.status).toBe('player_won');
    expect(state.log).toHaveLength(1);
    expect(state.turn).toBe(1);
  });
});
