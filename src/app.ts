import type { Entity } from "./game/entity"
import { h } from "./helpers/html"

// let appContainer: HTMLDivElement

const createButton = (text: string): HTMLButtonElement => {
  const btn = document.createElement('button')
  btn.innerText = text

  return btn
}

// const createStartButton = () => createButton('Start')
const createAttackButton = () => createButton('Attack')
const createHealButton = () => createButton('Heal')
const createChargeButton = () => createButton('Charge')

const startGame = () => {
  const player: Entity = {
    Health: 40,
    MaxHealth: 40,
    AttackPower: 10,
    Energy: 30,
    HealPower: 10
  }

  const villian: Entity = {
    Health: 60,
    MaxHealth: 60,
    AttackPower: 15,
    Energy: 0,
    HealPower: 15
  }
}

export default (container: HTMLElement) => {
  container.innerHTML = 'INITED'

  const h1 = h('h1', { class: "jopa" }, "JOPA")

  h1.className

  // const startBtn = createStartButton()
  // container.appendChild(startBtn)

  const actionButtons = [
    createAttackButton(),
    createHealButton(),
    createChargeButton(),
  ]

  container.append(...actionButtons)
}
