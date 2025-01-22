<template>
  <div class="header z100">
    <div>工时概览</div>
    <a-button
      style="color: #fff"
      type="text"
      :icon="h(SettingOutlined)"
      @click="onOpenEdit"
    />
  </div>
  <div class="h58px"></div>

  <div class="flex flex-justify-between p10px pl20px pr20px flex-items-center">
    <a-button
      type="text"
      :icon="h(LeftOutlined)"
      @click="calendarValue = calendarValue.subtract(1, 'month')"
    />
    <span
      >{{ calendarValue?.format("YYYY-MM-DD") }}
      <a-tag
        v-if="sumCurrentDay > 0"
        :color="sumCurrentDay > qualifiedTime ? 'green' : 'orange'"
        >{{ sumCurrentDay.toFixed(1) + "小时" }}</a-tag
      ></span
    >
    <a-button
      type="text"
      :icon="h(RightOutlined)"
      @click="calendarValue = calendarValue.add(1, 'month')"
    />
  </div>
  <a-calendar
    v-model:value="calendarValue"
    :fullscreen="false"
    @change="onPanelChange"
  >
    <template #dateCellRender="{ current }">
      <a-badge
        v-if="(getAllDayByDate(current)?.sum ?? 0) > qualifiedTime"
        :color="'green'"
        dot
      ></a-badge>
    </template>
  </a-calendar>

  <div class="today">
    <a-button
      type="dashed"
      shape="circle"
      size="large"
      @click="calendarValue = new (dayjs as any)()"
      >今</a-button
    >
  </div>
  <div class="add">
    <a-button
      type="primary"
      shape="circle"
      size="large"
      :icon="h(PlusOutlined)"
      @click="onAdd"
    ></a-button>
  </div>
  <div class="h75px fixed bg-white z100 bottom-0 w100%"></div>
  <a-divider />

  <div class="list">
    <div
      v-for="item in currentDayDs"
      class="item flex flex-justify-between mb10px!"
    >
      <div>
        <a-date-picker
          inputReadOnly
          v-model:value="item.start"
          :bordered="false"
          show-time
          format="HH:mm:ss"
          placeholder="进入时间"
        />
        ~
        <a-date-picker
          inputReadOnly
          v-model:value="item.end"
          :bordered="false"
          show-time
          format="HH:mm:ss"
          placeholder="离开时间"
        />
        <span class="font-size-14px">
          {{ formatDiff(item.start, item.end) }}
        </span>
      </div>
      <a-popconfirm
        title="确定删除？"
        ok-text="是"
        cancel-text="否"
        placement="topRight"
        @confirm="onDelItem(item.id)"
        v-if="item.start || item.end"
      >
        <a-button type="text" :icon="h(DeleteOutlined)" />
      </a-popconfirm>
      <a-button
        v-else
        type="text"
        :icon="h(DeleteOutlined)"
        @click="onDelItem(item.id)"
      />
    </div>
  </div>

  <a-modal v-model:open="showEdit" title="设置" @ok="onSaveEdit">
    <a-input-number
      style="width: 100%"
      addon-before="工作时长"
      addon-after="小时"
      :min="1"
      placeholder="请输入要求的工作时长"
      v-model:value="qualifiedTimeInput"
    />
    <div class="setting-item">
      <a @click="openPrivacyPolicy" class="privacy-link">《隐私政策》</a>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import { ref, h, watch, nextTick, onMounted, computed } from "vue";
import dayjs, { type Dayjs } from "dayjs";
import { v4 as uid } from "uuid";
import {
  PlusOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const DS_STORAGE_KEY = "___ds";
const Qualified_Time_KEY = "___qualifiedTime";
const calendarValue = ref<Dayjs>(new (dayjs as any)());
const ds = ref<
  {
    id: string;
    start?: Dayjs;
    end?: Dayjs;
  }[]
>([]);
const showEdit = ref(false);
const qualifiedTime = ref(8);
const qualifiedTimeInput = ref(0);
const allDays = ref<
  {
    date: Dayjs;
    sum?: number;
  }[]
>([]);
const currentDayDs = computed(() => {
  return ds.value.filter(
    (v) => !v.start || v.start?.isSame(calendarValue.value, "day")
  );
});
const sumCurrentDay = computed(() => {
  return currentDayDs.value.reduce((acc, cur) => {
    const diff = cur.end?.diff(cur.start, "hour", true);
    return acc + (diff && diff > 0 ? diff : 0);
  }, 0);
});

const onPanelChange = (value: Dayjs) => {
  console.log("Panel Select:", value.format("YYYY-MM-DD"));
};

const onDelItem = (id: string) => {
  console.log("onDelItem", id);
  const index = ds.value.findIndex((v) => v.id === id);

  if (index > -1) ds.value.splice(index, 1);
};

const onAdd = () => {
  ds.value.push({
    id: uid(),
  });
  nextTick(() => {
    document
      .querySelector(".list .item:last-child")
      ?.scrollIntoView({ behavior: "smooth" });
  });
};

const onSaveEdit = () => {
  if (!qualifiedTimeInput.value || qualifiedTimeInput.value < 1) {
    message.warning("请输入正确的工作时长");

    return;
  }
  localStorage.setItem(Qualified_Time_KEY, qualifiedTimeInput.value + "");
  qualifiedTime.value = qualifiedTimeInput.value;
  showEdit.value = false;
};

const onOpenEdit = () => {
  qualifiedTimeInput.value = qualifiedTime.value;
  showEdit.value = true;
};

const formatDiff = (start?: Dayjs, end?: Dayjs): string => {
  const diff = start && end ? end.diff(start, "hour", true) : 0;
  return diff > 0 ? diff.toFixed(1) + "小时" : "";
};

const getAllDays = (yearMonth: string): Dayjs[] => {
  const startDate = dayjs(`${yearMonth}-01`);
  const endDate = startDate.endOf("month");

  const allDatesInMonth = [];
  for (let day = 1; day <= endDate.date(); day++) {
    allDatesInMonth.push(dayjs(`${yearMonth}-${day}`));
  }

  return allDatesInMonth;
};

const getAllDayByDate = (date: Dayjs) => {
  return allDays.value.find((v) => v.date.isSame(date, "day"));
};

const openPrivacyPolicy = () => {
  if (window.Android) {
    window.Android.openBrowser("https://apis.leping.fun/pri/worker-timer.html");
  } else {
    window.open("https://apis.leping.fun/pri/worker-timer.html", "_system");
  }
};

onMounted(() => {
  try {
    ds.value = JSON.parse(localStorage.getItem(DS_STORAGE_KEY)!).map(
      (v: { start: number; end: number }) => ({
        ...v,
        start: v.start ? dayjs(v.start) : undefined,
        end: v.end ? dayjs(v.end) : undefined,
      })
    );
    console.log("r-ds", ds.value);
  } catch (error) {}
  try {
    qualifiedTime.value =
      Number(localStorage.getItem(Qualified_Time_KEY)!) || 10;
  } catch (error) {}
});

watch(
  () => ds,
  (value) => {
    console.log("w-ds", value);
    localStorage.setItem(
      DS_STORAGE_KEY,
      JSON.stringify(
        value.value.map((v) => ({
          ...v,
          start: v.start?.valueOf(),
          end: v.end?.valueOf(),
        }))
      )
    );
  },
  { deep: true }
);

watch(
  [calendarValue, ds],
  ([cValue, dsValue]) => {
    allDays.value = getAllDays(cValue.format("YYYY-MM")).map((it) => ({
      date: it,
    }));
    dsValue.forEach((v) => {
      if (v.start && v.end) {
        const index = allDays.value.findIndex((it) =>
          it.date.isSame(v.start, "day")
        );

        if (index > -1) {
          allDays.value[index].sum =
            (allDays.value[index].sum || 0) + v.end.diff(v.start, "hour", true);
        }
      }
    });
  },
  { deep: true, immediate: true }
);
</script>

<style scoped lang="less">
.add {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}
.today {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 1000;
}
.list {
  padding-bottom: 75px;

  .item {
    margin: 0 20px;
    background-color: #efefef;
    padding: 5px 10px;
    border-radius: 5px;
    :deep(.ant-picker) {
      width: 110px;
    }
  }
}
.header {
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  position: static;
  --AppBar-background: #ad6800;
  --AppBar-color: #fff;
  background-color: var(--AppBar-background);
  color: var(--AppBar-color);
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 50px;
  margin-bottom: 8px;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
}

:deep(.ant-picker-calendar-header) {
  display: none;
}
:deep(.ant-badge-status-text) {
  display: none;
}
:deep(*) {
  user-select: none;
}

.drawer-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.privacy-link {
  color: #1890ff;
  cursor: pointer;
}

.privacy-link:hover {
  text-decoration: underline;
}

.setting-item {
  margin-top: 16px;
}
</style>
