![Logo](../../admin/futterautomat.png)
# ioBroker.futterautomat

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## 用于 ioBroker 的 futterautomat 适配器

用于（改装的）自动喂食器的控制。适配器按计划将最多 **5 个可自由选择的开关**（现有的 ioBroker
对象）打开，并在可配置的时长后再次关闭（“喂食”）。可选地会考虑空气温度和水温，并根据地理坐标
计算太阳位置，以避免在夜间喂食。

### 功能

* 最多 5 个开关，每个都可自由命名（= 各自的配置选项卡）。
* 每个开关有两种喂食模式：
  * **固定时间**（例如 08:00 和 18:00）。
  * **时间窗口内的间隔**（例如 08:00 至 18:00 之间每 60 分钟）。
* 每个开关可配置**以秒为单位的喂食时长**。
* **温度阻止**：当水温和/或气温低于或高于可自由设置的阈值时阻止喂食。
* 通过日出/日落进行**夜间保护**，并带有可配置的偏移（早晨/傍晚）。
* 每个开关的**手动触发**（`feedNow`）以及带有可选时长的**“立即喂食”按钮**；可选择忽略所有阻止条件。
* 每个开关的**开关监控**：验证开关是否确实打开和关闭（需要能回报其状态的开关，`ack=true`），
  并可选择 **Telegram 通知**（喂食成功 / 无法执行 / 关闭故障）。

### 配置

**“常规设置”选项卡**
* **位置（必填）**：使用系统设置*或*单独设置——通过地址搜索和在 OpenStreetMap 地图上的标记
  （无需 API 密钥）。
* **太阳窗口**：日出后/日落前的偏移（分钟）。
* **温度来源**：启用气温和水温并选择相应对象。
* **开关**：添加开关（最多 5 个）、命名、选择对象、激活。

**每个开关的选项卡**（动态创建，以开关名称标注）
* 模式（固定时间 / 间隔）、时间或时间窗口 + 间隔、喂食时长、温度阻止、夜间/手动选项、开关监控、
  Telegram 通知、手动喂食按钮。

### 数据点

全局：
* `info.connection` – 适配器运行中 / 配置有效
* `airTemperature`、`waterTemperature` – 当前测得的温度
* `sunrise`、`sunset` – 计算得到的时间

每个开关在 `switches.<id>.` 下：
* `feedingActive` – 正在喂食
* `lastFeeding`、`nextFeeding` – 上次 / 下次喂食
* `blocked`、`blockReason` – 当前是否被阻止 + 原因
* `lastResult`、`error` – 上次尝试的结果 + 故障标志
* `feedNow` – 手动触发（可写）

> 提示：地址搜索/地理编码（Nominatim）和地图瓦片需要访问互联网。地理编码在适配器后端运行；
> 实例必须处于运行状态。

---

📖 [主文档（英文）](../../README.md)
