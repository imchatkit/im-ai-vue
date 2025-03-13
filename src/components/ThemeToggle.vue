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
    // 初始化为浅色主题
    this.isDarkMode = false;
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.add('light-mode');
    localStorage.setItem('theme-preference', 'light');
  },
  methods: {
    toggleTheme() {
      const newTheme = this.isDarkMode ? 'dark' : 'light';
      document.documentElement.classList.remove('light-mode', 'dark-mode');
      document.documentElement.classList.add(`${newTheme}-mode`);
      localStorage.setItem('theme-preference', newTheme);
    }
  }
};
</script>