<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">IM即时通讯</h2>
        <h3 class="mt-2 text-center text-xl text-gray-600">{{ isLoginMode ? '账号登录' : '用户注册' }}</h3>
      </div>
      
      <div class="mt-8 space-y-6">
        <!-- 注册表单 -->
        <template v-if="!isLoginMode">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="nickname" class="sr-only">昵称</label>
              <input
                id="nickname"
                v-model="registerForm.nickname"
                name="nickname"
                type="text"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="请输入昵称"
              />
            </div>
            
            <div>
              <label for="attributes" class="sr-only">个人简介</label>
              <input
                id="attributes"
                v-model="registerForm.attributes"
                name="attributes"
                type="text"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="个人简介（可选）"
              />
            </div>
          </div>
          
          <div>
            <button
              @click="handleRegister"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <!-- 加载图标 -->
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? '注册中...' : '注册' }}
            </button>
          </div>
        </template>
        
        <!-- 登录表单 -->
        <template v-else>
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="userId" class="sr-only">用户ID</label>
              <input
                id="userId"
                v-model="loginForm.userId"
                name="userId"
                type="text"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="请输入用户ID"
              />
            </div>
          </div>
          
          <div>
            <button
              @click="handleLogin"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <!-- 加载图标 -->
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
        </template>
        
        <!-- 错误消息 -->
        <div v-if="errorMessage" class="text-red-500 text-center text-sm">
          {{ errorMessage }}
        </div>
        
        <!-- 切换登录/注册模式 -->
        <div class="text-center text-sm">
          <a @click="toggleMode" class="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
            {{ isLoginMode ? '没有账号？去注册' : '已有账号？去登录' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ApiService } from '../modules/http-client';

const router = useRouter();

// 状态变量
const isLoginMode = ref(true);
const loading = ref(false);
const errorMessage = ref('');

// 表单数据
const loginForm = reactive({
  userId: ''
});

const registerForm = reactive({
  nickname: '',
  attributes: ''
});

// 切换登录/注册模式
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  errorMessage.value = '';
};

// 登录处理
const handleLogin = async () => {
  // 表单验证
  if (!loginForm.userId.trim()) {
    errorMessage.value = '请输入用户ID';
    return;
  }
  
  try {
    loading.value = true;
    errorMessage.value = '';
    
    // 调用登录API
    await ApiService.login(loginForm.userId);
    
    // 登录成功，跳转到主页
    router.push('/');
  } catch (error) {
    console.error('登录失败:', error);
    errorMessage.value = error.message || '登录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 注册处理
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.nickname.trim()) {
    errorMessage.value = '请输入昵称';
    return;
  }
  
  try {
    loading.value = true;
    errorMessage.value = '';
    
    // 调用注册API
    const result = await ApiService.register(
      registerForm.nickname,
      registerForm.attributes
    );
    
    // 注册成功后显示用户ID并切换到登录模式
    alert(`注册成功！您的用户ID是：${result.userId}，请保存此ID用于登录`);
    loginForm.userId = result.userId;
    isLoginMode.value = true;
  } catch (error) {
    console.error('注册失败:', error);
    errorMessage.value = error.message || '注册失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};
</script> 