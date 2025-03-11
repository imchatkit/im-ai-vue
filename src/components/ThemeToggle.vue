<template>
  <div class="theme-toggle-label">
    <span class="light-icon">☀️</span>
    <label class="theme-toggle">
      <input type="checkbox" v-model="isDarkMode" @change="toggleTheme">
      <span class="theme-toggle-slider"></span>
    </label>
    <span class="dark-icon">🌙</span>
  </div>
</template>

<script>
export default {
  name: 'ThemeToggle',
  data() {
    return {
      isDarkMode: false
    };
  },
  mounted() {
    // 初始化主题状态
    this.isDarkMode = this.getCurrentTheme() === 'dark';
    // 监听系统主题变化
    this.setupSystemThemeListener();
  },
  methods: {
    toggleTheme() {
      const newTheme = this.isDarkMode ? 'dark' : 'light';
      document.documentElement.classList.remove('light-mode', 'dark-mode');
      document.documentElement.classList.add(`${newTheme}-mode`);
      localStorage.setItem('theme-preference', newTheme);
    },
    getCurrentTheme() {
      // 优先使用用户保存的偏好
      const savedTheme = localStorage.getItem('theme-preference');
      if (savedTheme) {
        return savedTheme;
      }
      
      // 否则使用系统偏好
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    setupSystemThemeListener() {
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme-preference')) {
          this.isDarkMode = e.matches;
          this.toggleTheme();
        }
      });
    }
  }
};
</script>