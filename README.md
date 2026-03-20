# Uric Acid Tracker 🏥

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/uric-acid-tracker/uric-acid-tracker?style=flat)](https://github.com/uric-acid-tracker/uric-acid-tracker/stargazers)
[![GitHub license](https://img.shields.io/github/license/uric-acid-tracker/uric-acid-tracker)](https://github.com/uric-acid-tracker/uric-acid-tracker/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/uric-acid-tracker/uric-acid-tracker/releases)

</div>

## 📱 应用介绍

尿酸指数记录 (Uric Acid Tracker) 是一款专为痛风患者和高尿酸血症人群设计的健康追踪 Web 应用。帮助您轻松记录每日尿酸数值，追踪健康趋势。

## ✨ 功能特点

### 核心功能
- 📝 **每日尿酸记录** - 支持快速记录尿酸数值、日期、时间和备注
- 🔄 **单位切换** - 支持 mg/dL 和 μmol/L 两种单位无缝切换
- 📈 **趋势图表** - 直观展示 7天/30天/90天/全部 趋势变化
- 📊 **数据统计** - 显示最新记录、7日平均、30日平均等统计信息

### 数据管理
- 💾 **本地存储** - 数据存储在浏览器本地 LocalStorage，隐私安全
- 📤 **数据导出** - 支持 CSV 和 JSON 格式导出备份
- 🗑️ **数据管理** - 支持编辑和删除历史记录
- 🔍 **搜索过滤** - 支持按备注搜索历史记录

### 用户体验
- 📱 **响应式设计** - 完美支持手机、平板、电脑端
- 🌐 **PWA 支持** - 可添加到主屏幕，离线使用
- 🎨 **现代界面** - 简洁美观的 UI 设计
- 🔔 **即时反馈** - 友好的提示消息

## 🖥️ 技术栈

- **前端框架**: HTML5 + Vanilla JavaScript (ES6+)
- **图表库**: Chart.js 4.4.1
- **样式**: 原生 CSS3 (支持 CSS 变量)
- **存储**: LocalStorage
- **PWA**: Service Worker + Web App Manifest

## 🚀 快速开始

### 直接使用 (推荐)
1. 克隆或下载本项目
2. 使用任意 Web 服务器运行（如 Live Server、http-server 等）
3. 或直接在浏览器中打开 `index.html`

```bash
# 使用 Python 启动简单服务器
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000
```

### PWA 安装
1. 在手机浏览器中打开应用
2. 点击「添加到主屏幕」
3. 即可像原生应用一样使用

## 📂 项目结构

```
uric-acid-tracker/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   └── app.js         # 应用逻辑
├── assets/
│   └── icon.svg       # 应用图标
├── sw.js              # Service Worker (PWA)
├── manifest.json      # PWA 配置
├── README.md          # 说明文档
└── LICENSE            # MIT 许可证
```

## 📖 使用说明

### 记录尿酸值
1. 在首页「记录尿酸值」区域
2. 选择日期（默认为今天）
3. 选择时间（可选）
4. 输入尿酸数值
5. 添加备注（可选）
6. 点击「保存记录」

### 查看趋势
1. 在「趋势图表」区域
2. 选择时间范围：7天/30天/90天/全部
3. 图表会自动更新显示

### 导出数据
1. 滚动到页面底部「数据导出」区域
2. 选择「导出 CSV」或「导出 JSON」
3. 文件会自动下载到本地

### 切换单位
1. 点击顶部的单位切换按钮
2. 可选择 mg/dL 或 μmol/L
3. 所有数据和界面会自动转换

## 📊 参考范围

| 性别 | 正常范围 (mg/dL) | 正常范围 (μmol/L) |
|------|-----------------|-------------------|
| 男性 | 3.4 - 7.0 | 202 - 416 |
| 女性 | 2.4 - 6.0 | 143 - 357 |

> ⚠️ 注意：本应用仅供参考，不能替代专业医疗建议。如有健康问题，请咨询医生。

## 📸 截图

### 桌面端
![Desktop Screenshot](screenshots/desktop.png)

### 移动端
![Mobile Screenshot](screenshots/mobile.png)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 了解详情。

## 🙏 致谢

- [Chart.js](https://www.chartjs.org/) - 优秀的图表库
- [Google Fonts](https://fonts.google.com/) - 字体资源

---

<div align="center">

Made with ❤️ for better health

</div>
