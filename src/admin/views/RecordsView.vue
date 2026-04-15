<script setup lang="ts">
import { NDataTable, NCard, NTag } from 'naive-ui'
import { useGameStore } from '../../stores/game'
import type { GameRecord } from '../../stores/game'
import { onMounted, h } from 'vue'

const gameStore = useGameStore()

onMounted(() => {
  gameStore.loadRecords()
})

const columns = [
  {
    title: '游戏名称',
    key: 'gameName',
  },
  {
    title: '获胜者',
    key: 'winner',
    render(row: GameRecord) {
      return h(
        NTag,
        {
          type: row.winner === '平局' ? 'default' : 'success',
        },
        { default: () => row.winner },
      )
    },
  },
  {
    title: '总步数',
    key: 'moves',
  },
  {
    title: '时长',
    key: 'duration',
    render(row: GameRecord) {
      const minutes = Math.floor(row.duration / 60)
      const seconds = row.duration % 60
      return `${minutes}分${seconds}秒`
    },
  },
  {
    title: '时间',
    key: 'timestamp',
    render(row: GameRecord) {
      return new Date(row.timestamp).toLocaleString()
    },
  },
]
</script>

<template>
  <n-card title="游戏历史记录">
    <n-data-table :columns="columns" :data="gameStore.records" :pagination="{ pageSize: 10 }" />
  </n-card>
</template>
