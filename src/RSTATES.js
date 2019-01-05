const RSTATES = {
  init: '', // 组件初始状态
  pulling: 'pulling', // 下拉状态
  enough: 'pullingenough', // 下拉并且已经满足阈值
  refreshing: 'refreshing', // 刷新中（加载数据中）
  refreshed: 'refreshed', // 完成刷新动作
  reset: 'reset', // 恢复默认状态
  loading: 'loading', // 加载中
};

export default RSTATES;
