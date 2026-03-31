import { subscribe, proxy } from 'valtio/vanilla';
import { h } from './helpers/html';
import { createInitialState, createRandomRng, processTurn, type PlayerAction } from './game';

const rng = createRandomRng();
const gameState = proxy(createInitialState());

const renderPlayer = () => {
  const { player } = gameState;
  const playerUI = {
    hp: document.querySelector<HTMLDivElement>('#player-health')!,
    energy: document.querySelector<HTMLDivElement>('#player-energy')!,
    attack: document.querySelector<HTMLDivElement>('#player-ap')!,
  };

  playerUI.hp.innerText = `HP: ${player.hp} / ${player.maxHp}`;
  playerUI.energy.innerText = `Energy: ${player.energy}`;
  playerUI.attack.innerText = 'Attack: 4-8';
};

const renderVillain = () => {
  const { villain } = gameState;

  const villainUI = {
    hp: document.querySelector<HTMLDivElement>('#villian-health')!,
    energy: document.querySelector<HTMLDivElement>('#villian-energy')!,
    attack: document.querySelector<HTMLDivElement>('#villian-ap')!,
  };

  villainUI.hp.innerText = `HP: ${villain.hp} / ${villain.maxHp}`;
  villainUI.energy.innerText = `Energy: ${villain.energy}`;
  villainUI.attack.innerText = 'Attack: 5-12';
};

const renderBattleLog = () => {
  const battleLog = document.querySelector<HTMLUListElement>('#log-content')!;
  battleLog.innerHTML = '';

  const listItems = gameState.log
    .map((item, i) => h('li', null, `${i + 1}. ${item.message}`))
    .reverse();

  battleLog.append(...listItems);
};

const renderStatus = () => {
  const attackBtn = document.querySelector<HTMLButtonElement>('#attack')!;
  const healBtn = document.querySelector<HTMLButtonElement>('#heal')!;
  const chargeBtn = document.querySelector<HTMLButtonElement>('#charge')!;

  const ended = gameState.status !== 'playing';
  attackBtn.disabled = ended;
  healBtn.disabled = ended;
  chargeBtn.disabled = ended;
};

const render = () => {
  renderPlayer();
  renderVillain();
  renderBattleLog();
  renderStatus();
};

const dispatch = (action: PlayerAction) => {
  const next = processTurn(gameState, action, rng);
  Object.assign(gameState, next);
};

export default () => {
  const attackBtn = document.querySelector<HTMLButtonElement>('#attack')!;
  const healBtn = document.querySelector<HTMLButtonElement>('#heal')!;
  const chargeBtn = document.querySelector<HTMLButtonElement>('#charge')!;

  attackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dispatch({ type: 'PLAYER_ATTACK' });
  });

  healBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dispatch({ type: 'PLAYER_HEAL' });
  });

  chargeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dispatch({ type: 'PLAYER_CHARGE' });
  });

  render();
  subscribe(gameState, render);
};
