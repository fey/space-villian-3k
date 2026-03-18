interface Entity {
  Health: number,
  MaxHealth: number,
  Energy: number,
  AttackPower: number,
  HealPower: number,
}

interface LogItem {
  name: 'player_attack' | 'player_heal' | 'player_charge' | 'villian_heal' | 'villian_attack',
  value: number
}

const createGame = () => {
  const initialHealth = 100;

  const player: Entity = {
    Health: initialHealth,
    MaxHealth: initialHealth,
    AttackPower: 10,
    Energy: 20,
    HealPower: 5
  };

  const villian: Entity = {
    Health: initialHealth,
    MaxHealth: initialHealth,
    AttackPower: 10,
    Energy: 20,
    HealPower: 5
  };

  const data: {
    player: Entity,
    villian: Entity,
    log: LogItem[]
  } = {
    player,
    villian,
    log: []
  };

  return data;
}

export default createGame;
