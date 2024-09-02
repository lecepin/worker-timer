import { createApp } from "vue";
import Antd from "ant-design-vue";

import "ant-design-vue/dist/reset.css";
import "virtual:uno.css";

import "./style.css";
import Wrap from "./Wrap.vue";

createApp(Wrap).use(Antd).mount("#app");
