<template>
  <a-config-provider
    :locale="locale"
    :theme="{
      token: {
        colorPrimary: '#faad14',
      },
    }"
  >
    <App v-if="privacyAccepted" />
    
    <a-modal
      v-model:visible="showPrivacyModal"
      title="隐私政策同意"
      :maskClosable="false"
      :keyboard="false"
      :closable="false"
      @cancel="handleReject"
      @ok="handleAccept"
      cancelText="不同意"
      okText="同意"
    >
      <p>欢迎使用我们的应用！在使用之前，请仔细阅读我们的隐私政策。</p>
      <p>我们重视您的隐私权并致力于保护您的个人信息。我们的隐私政策说明了我们如何收集、使用和保护您的信息。</p>
      <p>
        您可以点击
        <a @click="openPrivacyPolicy" class="privacy-link">《隐私政策》</a>
        查看完整的隐私政策。
      </p>
      <p>继续使用本应用即表示您同意我们的隐私政策条款。如果您不同意这些条款，请停止使用本应用。</p>
    </a-modal>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import App from "./App.vue";

dayjs.locale("zh-cn");

const locale = ref(zhCN);
const showPrivacyModal = ref(false);
const privacyAccepted = ref(false);

const PRIVACY_KEY = 'privacy_accepted_v1';

onMounted(() => {
  const hasAccepted = localStorage.getItem(PRIVACY_KEY);
  if (hasAccepted === 'true') {
    privacyAccepted.value = true;
  } else {
    showPrivacyModal.value = true;
  }
});

const handleAccept = () => {
  localStorage.setItem(PRIVACY_KEY, 'true');
  privacyAccepted.value = true;
  showPrivacyModal.value = false;
};

const handleReject = () => {
  // 安卓环境下，通过 Android 接口关闭应用
  if (window.Android) {
    window.Android.finishApp();
  } else {
    window.close();
  }
};

const openPrivacyPolicy = () => {
  // 安卓环境下，通过 Android 接口打开浏览器
  if (window.Android) {
    window.Android.openBrowser('https://apis.leping.fun/pri/worker-timer.html');
  } else {
    window.open('https://apis.leping.fun/pri/worker-timer.html', '_system');
  }
};
</script>

<style scoped>
.privacy-link {
  color: #1890ff;
  cursor: pointer;
}
</style>
