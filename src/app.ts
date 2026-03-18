import createGame from "./game"
import { h } from "./helpers/html"
import { subscribe, proxy } from "valtio/vanilla"

const gameState = proxy(createGame())

const reactVillian = () => {
  const { player, villian } = gameState;

  const hpPercent = gameState.villian.Health / villian.MaxHealth * 100;

  console.log(hpPercent)

  if (hpPercent < 50) {
    const inc = 5
    villian.Health += inc

    gameState.log.push({
      name: "villian_heal",
      value: inc
    })

    return;
  }

  player.Health -= villian.AttackPower;

  gameState.log.push({
    name: "villian_attack",
    value: villian.AttackPower
  });
}

const handleAttack = () => {
  const { player, villian } = gameState
  villian.Health -= player.AttackPower

  if (villian.Health <= 0) {
    // won game
    return;
  }

  gameState.log.push({
    name: "player_attack",
    value: player.AttackPower
  })

  player.Energy += 1
  // villian reacts
}

const handleHeal = () => {
  const { player } = gameState

  gameState.player.HealPower = Math.min(player.MaxHealth, player.Health + player.HealPower);
  gameState.player.Energy -= 5

  gameState.log.push({
    name: "player_heal",
    value: player.HealPower
  })
}

const handleCharge = () => {
  const { player } = gameState

  const inc = 5
  player.Energy += inc

  gameState.log.push({
    name: "player_charge",
    value: inc
  });
}

const renderPlayer = () => {
  const { player } = gameState
  const playerUI = {
    hp: document.querySelector<HTMLDivElement>('#player-health')!,
    energy: document.querySelector<HTMLDivElement>('#player-energy')!,
    attack: document.querySelector<HTMLDivElement>('#player-ap')!
  }

  playerUI.hp.innerText = `HP: ${player.Health} / ${player.MaxHealth}`
  playerUI.energy.innerText = `Energy: ${player.Energy}`
  playerUI.attack.innerText = `Attack: ${player.AttackPower}`
}

const renderVillian = () => {
  const { villian } = gameState

  const villianUI = {
    hp: document.querySelector<HTMLDivElement>('#villian-health')!,
    energy: document.querySelector<HTMLDivElement>('#villian-energy')!,
    attack: document.querySelector<HTMLDivElement>('#villian-ap')!
  }

  villianUI.hp.innerText = `HP: ${villian.Health} / ${villian.MaxHealth}`
  villianUI.energy.innerText = `Energy: ${villian.Energy}`
  villianUI.attack.innerText = `Attack: ${villian.Energy}`
}

const renderBattleLog = () => {
  const battleLog = document.querySelector<HTMLUListElement>('#log-content')!;
  battleLog.innerHTML = '';

  const { log } = gameState;

  const listItems = log.map((item, i) => {
    return h('li', null, `${i} - ${item.name}`)
  }).reverse();

  battleLog.append(...listItems);
}

const render = () => {
  console.log('rendered')

  renderPlayer()
  renderVillian()
  renderBattleLog()
}

export default () => {
  const attackBtn = document.querySelector<HTMLButtonElement>('#attack')!
  const healBtn = document.querySelector<HTMLButtonElement>('#heal')!
  const chargeBtn = document.querySelector<HTMLButtonElement>('#charge')!

  attackBtn.addEventListener('click', (e) => {
    e.preventDefault();

    console.log('attack')

    handleAttack()
    reactVillian()
  });

  healBtn.addEventListener('click', (e) => {
    e.preventDefault();

    console.log('heal')

    handleHeal()
    reactVillian()
  });

  chargeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    handleCharge()
    reactVillian()
  });

  render()
  subscribe(gameState, render)
};
