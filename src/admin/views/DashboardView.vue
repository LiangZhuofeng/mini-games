<script setup lang="ts">
import { NGrid, NGridItem, NStatistic, NCard, NSpace } from 'naive-ui'
import { useGameStore } from '../../stores/game'
import { onMounted, computed } from 'vue'

const gameStore = useGameStore()

onMounted(() => {
  gameStore.loadRecords()
})

const totalGames = computed(() => gameStore.records.length)
const totalDuration = computed(() => {
  const seconds = gameStore.records.reduce((acc, r) => acc + r.duration, 0)
  return Math.floor(seconds / 60)
})
const averageMoves = computed(() => {
  if (totalGames.value === 0) return 0
  const totalMoves = gameStore.records.reduce((acc, r) => acc + r.moves, 0)
  return (totalMoves / totalGames.value).toFixed(1)
})
</script>

<template>
  <n-space vertical size="large">
    <n-grid :cols="3" :x-gap="12">
      <n-grid-item>
        <n-card>
          <n-statistic label="总局数" :value="totalGames">
            <template #suffix>局</template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card>
          <n-statistic label="总游戏时长" :value="totalDuration">
            <template #suffix>分钟</template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card>
          <n-statistic label="平均步数" :value="averageMoves">
            <template #suffix>步/局</template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card title="欢迎回来">
      这里是小游戏平台的管理后台，您可以查看游戏统计数据和详细的历史记录。
    </n-card>
  </n-space>
</template>
