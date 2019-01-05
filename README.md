# [ridingwind scrolllist](https://github.com/LinQinTao/ridingwind-scrolllist.git)

# 当前版本 1.0.0-alpha.1

# 简介
1. React插件
2. 只依赖 react/react-dom
3. 支持代码动态调起刷新和加载更多（组件将展示刷新和加载更多样式）
4. **支持移动触摸设备（上拉加载，下拉刷新），PC设备滚动加载更多**

# 使用说明

1. 安装

```sh
npm install --save ridingwind-scrolllist
```

2. demo

```js
import { RidingWindScrollList, RSTATES } from 'ridingwind-scrolllist';

class Demo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hasMore: true,
      currentState: RSTATES.init,
      datas: new Array(15).fill('-'), // 测试代码
      index: 5, // 测试代码
    };
  }

  executeFunc = (currentState) => {
    if (currentState === this.state.currentState) {
      return false;
    }

    if (currentState === RSTATES.refreshing) {
      // 刷新
      this.handRefreshing();
    } else if (currentState === RSTATES.loading) {
      // 加载更多
      this.handLoadMore();
    } else {
      this.setState({
        currentState,
      });
    }
  };

  handRefreshing = () => {
    if (RSTATES.refreshing === this.state.currentState) {
      return false;
    }

    setTimeout(() => {
      this.setState({
        hasMore: true,
        currentState: RSTATES.refreshed,
      });
    }, 3000);

    this.setState({
      currentState: RSTATES.refreshing,
    });
  };

  handLoadMore = () => {
    if (RSTATES.loading === this.state.currentState) {
      return false;
    }
    // 无更多内容则不执行后面逻辑
    if (!this.state.hasMore) {
      return;
    }

    setTimeout(() => {
      if (this.state.index === 0) {
        // 测试代码
        this.setState({
          currentState: RSTATES.reset, // 必须
          hasMore: false,
        });
      } else {
        this.setState({
          datas: this.state.datas.concat(new Array(15).fill('-')), // 测试代码
          currentState: RSTATES.reset, // 必须
          index: this.state.index - 1, // 测试代码
        });
      }
    }, 3000);

    this.setState({
      currentState: RSTATES.loading,
    });
  };

  render() {
    const { currentState, hasMore, datas } = this.state;

    return (
      <div>
        <RidingWindScrollList
          id="list"
          pullDownSpace={80}
          actionSpaceBottom={300}
          currentState={currentState}
          hasMore={hasMore}
          executeFunc={this.executeFunc}
        >
          {
            datas.map((item, index) => (
              <div
                key={index}
                className={styles.item}
              >
                <div className={styles.itemText}>
                  <div className={styles.itemTextTit}>
                    {index}: {item}国家税务总局：要将税收工作重大决策部署落实到位
                    国家税务总局：要将税收工作重大决策部署落实到位
                  </div>
                  <div className={styles.itemTextInfo}>新浪财经</div>
                </div>
              </div>
            ))
          }
        </RidingWindScrollList>
      </div>
    );
  }
}

export default Demo;

```

# 参数说明：

| 参数             | 说明                                          | 类型   | 备注                  |
| ---------------- | --------------------------------------------- | ------ | --------------------- |
| id           | id                                  | String | isRequired            |
| currentState     | 当前状态                                  | String   | isRequired            |
| executeFunc          | 执行的方法                        | func   |            isRequired           |
| hasMore          | 是否还有更多内容可以加载                | Boolean   |            isRequired           |
| pullDownSpace       | 下拉距离是否满足要求                 | Number    |      isRequired                 |
| actionSpaceBottom   | 距离底部多少距离触发加载更多                  | Number    |       isRequired        |


# STATS list

| 属性       | 值               | 说明                 |
| ---------- | ---------------- | -------------------- |
| init       | ''               | 组件初始状态         |
| pulling    | 'pulling'        | 下拉状态             |
| enough     | 'pullingenough' | 下拉并且已经满足阈值 |
| refreshing | 'refreshing'     | 刷新中（加载数据中） |
| refreshed  | 'refreshed'      | 完成刷新动作         |
| reset      | 'reset'          | 恢复默认状态         |
| loading    | 'loading'        | 加载中               |

init/reset -> pulling -> enough -> refreshing -> refreshed -> reset

init/reset -> pulling -> reset

init/reset -> loading -> reset
