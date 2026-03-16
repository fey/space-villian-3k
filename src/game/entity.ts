export interface Entity {
  Health: Number,
  MaxHealth: Number,
  Energy: Number,
  AttackPower: Number,
  HealPower: Number,
}

export interface Attack {
  (target: Entity): void
}

export interface Heal {
  (): void
}

export interface Charge {
  (): void
}
