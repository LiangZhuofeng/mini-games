import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GameRecord {
  id: string
  gameId: string
  gameName: string
  playerName: string
  winner: string
  duration: number // in seconds
  timestamp: number
  moves: number
}

export const useGameStore = defineStore('game', () => {
  const records = ref<GameRecord[]>([])

  const addRecord = (record: Omit<GameRecord, 'id' | 'timestamp'>) => {
    const newRecord: GameRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    }
    records.value.unshift(newRecord)

    // Save to localStorage for persistence in this demo
    saveRecords()
  }

  const loadRecords = () => {
    const stored = localStorage.getItem('mini-games-records')
    if (stored) {
      records.value = JSON.parse(stored)
    }
  }

  const saveRecords = () => {
    localStorage.setItem('mini-games-records', JSON.stringify(records.value))
  }

  return {
    records,
    addRecord,
    loadRecords,
  }
})
