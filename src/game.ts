export interface Entity {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
}

export interface LogEntry {
  turn: number;
  actor: 'player' | 'villain' | 'system';
  action: 'attack' | 'heal' | 'charge' | 'special' | 'miss' | 'invalid';
  value?: number;
  message: string;
}

export interface GameState {
  player: Entity;
  villain: Entity;
  log: LogEntry[];
  turn: number;
  status: 'playing' | 'player_won' | 'villain_won';
}

export type PlayerAction =
  | { type: 'PLAYER_ATTACK' }
  | { type: 'PLAYER_HEAL' }
  | { type: 'PLAYER_CHARGE' }
  | { type: 'PLAYER_SPECIAL' };

export interface RNG {
  range: (min: number, max: number) => number;
  chance: (probability: number) => boolean;
}

export const createRandomRng = (): RNG => ({
  range: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  chance: (probability) => Math.random() < probability,
});

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const initialEntity = (): Entity => ({
  hp: 100,
  maxHp: 100,
  energy: 0,
  maxEnergy: 20,
});

export const createInitialState = (): GameState => ({
  player: initialEntity(),
  villain: initialEntity(),
  log: [],
  turn: 1,
  status: 'playing',
});

type VillainDecision =
  | { type: 'VILLAIN_HEAL'; heal: number }
  | { type: 'VILLAIN_ATTACK'; damage: number }
  | { type: 'VILLAIN_MISS' };

const villainAction = (state: GameState, rng: RNG): VillainDecision => {
  const hpPercent = state.villain.hp / state.villain.maxHp;

  if (hpPercent < 0.5 && rng.chance(0.5)) {
    return { type: 'VILLAIN_HEAL', heal: rng.range(5, 10) };
  }

  const roll = rng.range(1, 100);
  if (roll <= 10) {
    return { type: 'VILLAIN_MISS' };
  }

  const baseDamage = rng.range(5, 12);
  if (roll <= 25) {
    return { type: 'VILLAIN_ATTACK', damage: baseDamage * 2 };
  }

  return { type: 'VILLAIN_ATTACK', damage: baseDamage };
};

const withLog = (state: GameState, entries: LogEntry[]): GameState => ({
  ...state,
  log: [...state.log, ...entries],
});

export const processTurn = (state: GameState, action: PlayerAction, rng: RNG): GameState => {
  if (state.status !== 'playing') {
    return state;
  }

  let next: GameState = {
    ...state,
    player: { ...state.player },
    villain: { ...state.villain },
    log: [...state.log],
  };
  const turnLogs: LogEntry[] = [];

  if (action.type === 'PLAYER_ATTACK') {
    const damage = rng.range(4, 8);
    next.villain.hp = clamp(next.villain.hp - damage, 0, next.villain.maxHp);
    next.player.energy = clamp(next.player.energy + 2, 0, next.player.maxEnergy);
    turnLogs.push({
      turn: state.turn,
      actor: 'player',
      action: 'attack',
      value: damage,
      message: `Вы наносите ${damage} урона.`,
    });
  }

  if (action.type === 'PLAYER_HEAL') {
    if (next.player.energy < 3) {
      turnLogs.push({
        turn: state.turn,
        actor: 'system',
        action: 'invalid',
        message: 'Недостаточно энергии для лечения (нужно 3).',
      });
      return withLog(next, turnLogs);
    }

    const healAmount = rng.range(6, 10);
    next.player.energy -= 3;
    next.player.hp = clamp(next.player.hp + healAmount, 0, next.player.maxHp);
    turnLogs.push({
      turn: state.turn,
      actor: 'player',
      action: 'heal',
      value: healAmount,
      message: `Вы восстанавливаете ${healAmount} HP.`,
    });
  }

  if (action.type === 'PLAYER_CHARGE') {
    const gain = rng.range(6, 10);
    next.player.energy = clamp(next.player.energy + gain, 0, next.player.maxEnergy);
    turnLogs.push({
      turn: state.turn,
      actor: 'player',
      action: 'charge',
      value: gain,
      message: `Вы заряжаете ${gain} энергии.`,
    });
  }

  if (action.type === 'PLAYER_SPECIAL') {
    if (next.player.energy < 10) {
      turnLogs.push({
        turn: state.turn,
        actor: 'system',
        action: 'invalid',
        message: 'Недостаточно энергии для special-атаки (нужно 10).',
      });
      return withLog(next, turnLogs);
    }

    const damage = rng.range(10, 20);
    next.player.energy -= 10;
    next.villain.hp = clamp(next.villain.hp - damage, 0, next.villain.maxHp);
    turnLogs.push({
      turn: state.turn,
      actor: 'player',
      action: 'special',
      value: damage,
      message: `Special-атака наносит ${damage} урона!`,
    });
  }

  if (next.villain.hp <= 0) {
    return withLog({ ...next, status: 'player_won' }, turnLogs);
  }

  const enemyDecision = villainAction(next, rng);
  if (enemyDecision.type === 'VILLAIN_HEAL') {
    const healAmount = enemyDecision.heal ?? 0;
    next.villain.hp = clamp(next.villain.hp + healAmount, 0, next.villain.maxHp);
    turnLogs.push({
      turn: state.turn,
      actor: 'villain',
      action: 'heal',
      value: healAmount,
      message: `Злодей лечится на ${healAmount} HP.`,
    });
  }

  if (enemyDecision.type === 'VILLAIN_MISS') {
    turnLogs.push({
      turn: state.turn,
      actor: 'villain',
      action: 'miss',
      message: 'Злодей промахнулся.',
    });
  }

  if (enemyDecision.type === 'VILLAIN_ATTACK') {
    const damage = enemyDecision.damage ?? 0;
    next.player.hp = clamp(next.player.hp - damage, 0, next.player.maxHp);
    turnLogs.push({
      turn: state.turn,
      actor: 'villain',
      action: 'attack',
      value: damage,
      message: `Злодей наносит ${damage} урона.`,
    });
  }

  const status = next.player.hp <= 0 ? 'villain_won' : 'playing';

  return withLog(
    {
      ...next,
      status,
      turn: state.turn + 1,
    },
    turnLogs,
  );
};
