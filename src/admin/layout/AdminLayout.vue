<script setup lang="ts">
import { h, ref } from 'vue'
import type { Component } from 'vue'
import {
  NIcon,
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NSpace,
  NAvatar,
  NText,
} from 'naive-ui'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { DashboardOutlined, HistoryOutlined, AppstoreOutlined } from '@vicons/antd'

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: () => h(RouterLink, { to: '/' }, { default: () => '仪表盘' }),
    key: 'dashboard',
    icon: renderIcon(DashboardOutlined),
  },
  {
    label: () => h(RouterLink, { to: '/records' }, { default: () => '游戏记录' }),
    key: 'records',
    icon: renderIcon(HistoryOutlined),
  },
  {
    label: () => h('a', { href: '/' }, { default: () => '返回游戏' }),
    key: 'back-to-games',
    icon: renderIcon(AppstoreOutlined),
  },
]

const collapsed = ref(false)
const route = useRoute()
const activeKey = ref(route.name?.toString().toLowerCase() || 'dashboard')
</script>

<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="logo">
        <n-icon size="32" color="#646cff">
          <AppstoreOutlined />
        </n-icon>
        <span v-if="!collapsed" class="logo-text">游戏管理后台</span>
      </div>
      <n-menu
        v-model:value="activeKey"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
      />
    </n-layout-sider>
    <n-layout>
      <n-layout-header
        bordered
        style="
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        "
      >
        <n-space align="center">
          <n-text>管理员</n-text>
          <n-avatar
            round
            size="small"
            src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
          />
        </n-space>
      </n-layout-header>
      <n-layout-content
        content-style="padding: 24px; background-color: #f5f7f9; min-height: calc(100vh - 64px)"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid #efeff5;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}
</style>
