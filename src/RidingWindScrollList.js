/* eslint-disable max-len,consistent-return */
import React from 'react';
import RSTATES from './RSTATES';
import styles from './ridingWindScrollList.css';

/**
 * RidingWindScrollList
 * @author RidingWind
 * @param {String} id (isRequired): id
 * @param {String} currentState (isRequired): 当前状态
 * @param {func} executeFunc (isRequired): 执行的方法
 * @param {Boolean} hasMore (isRequired): 是否还有更多内容可以加载
 * @param {Number} pullDownSpace (isRequired): 下拉距离是否满足要求
 * @param {Number} actionSpaceBottom (isRequired): 距离底部多少距离触发加载更多
 * @param {Jsx} HeadDOM: 自定义顶部刷新组件
 * @param {Jsx} FooterDOM: 自定义底部刷新组件
 */

function addEventFunc(obj, type, fn) {
  const RWDOM = obj;
  if (RWDOM.attachEvent) {
    // 兼容ie
    RWDOM[`e${type}${fn}`] = fn;
    RWDOM[type + fn] = function () { RWDOM[`e${type}${fn}`](window.event); };
    RWDOM.attachEvent(`on${type}`, RWDOM[type + fn]);
  } else { RWDOM.addEventListener(type, fn, false, { passive: false }); }
}

function removeEventFunc(obj, type, fn) {
  const RWDOM = obj;
  if (RWDOM.detachEvent) {
    // 兼容ie
    RWDOM.detachEvent(`on${type}`, RWDOM[type + fn]);
    RWDOM[type + fn] = null;
  } else { RWDOM.removeEventListener(type, fn, false); }
}

export default class RidingWindScrollList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageWidth: document.body.clientWidth,
      pullDistance: 0,

      beforeHeight: 0,
      scollLoading: true,
    };
  }

  componentDidMount() {
    const { pullDownSpace, actionSpaceBottom, id } = this.props;
    this[`${id}_defaultConfig`] = {
      container: this[`${id}_container`],
      offsetScrollTop: 1,
      pullDownSpace,
      actionSpaceBottom,
    };

    if (this.state.pageWidth <= 780) {
      // 移动端
      addEventFunc(this[`${id}_container`], 'touchstart', this.onTouchStart);
      addEventFunc(this[`${id}_container`], 'touchmove', this.onTouchMove);
      addEventFunc(this[`${id}_container`], 'touchend', this.onTouchEnd);
    } else {
      // PC
      addEventFunc(this[`${id}_container`], 'scroll', this.scrollFunc);
    }
  }

  componentWillUnmount() {
    const { id } = this.props;
    if (this.state.pageWidth <= 780) {
      // 移动端
      removeEventFunc(this[`${id}_container`], 'touchstart', this.onTouchStart);
      removeEventFunc(this[`${id}_container`], 'touchmove', this.onTouchMove);
      removeEventFunc(this[`${id}_container`], 'touchend', this.onTouchEnd);
    } else {
      // PC
      removeEventFunc(this[`${id}_container`], 'scroll', this.scrollFunc);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { executeFunc } = this.props;
    if (nextProps.currentState === RSTATES.refreshed) {
      setTimeout(() => {
        executeFunc(RSTATES.reset);
      }, 1000);
    }
  }

  getScrollTopFunc = () => {
    const { id } = this.props;
    if (this[`${id}_defaultConfig`].container) {
      return this[`${id}_defaultConfig`].container.scrollTop;
    }
    return 0;
  }

  setScrollTop = (value) => {
    const { id } = this.props;
    let newVal = value;
    if (this[`${id}_defaultConfig`].container) {
      const scrollH = this[`${id}_defaultConfig`].container.scrollHeight;
      if (value < 0) { newVal = 0; }
      if (value > scrollH) { newVal = scrollH; }
      this[`${id}_defaultConfig`].container.scrollTop = newVal;
      return this[`${id}_defaultConfig`].container.scrollTop;
    }
    return 0;
  }

  // 拖拽的缓动公式
  easing = (distance) => {
    const b = 0;
    const d = window.screen.availHeight; // 允许拖拽的最大距离
    const c = d / 2.5; // 提示标签最大有效拖拽距离

    return (c * Math.sin((distance / d) * (Math.PI / 2))) + b;
  }

  canRefresh = () => {
    const { currentState } = this.props;
    return [RSTATES.refreshing, RSTATES.loading].indexOf(currentState) < 0;
  }

  onPullDownMove = (data) => {
    const { executeFunc, id } = this.props;
    if (!this.canRefresh()) return false;

    let loaderState;
    let diff = data[0].touchMoveY - data[0].touchStartY;
    if (diff < 0) {
      diff = 0;
    }
    diff = this.easing(diff);
    if (diff > this[`${id}_defaultConfig`].pullDownSpace) {
      loaderState = RSTATES.enough;
    } else {
      loaderState = RSTATES.pulling;
    }
    this.setState({
      pullDistance: diff,
    });
    executeFunc(loaderState);
  }

  onPullDownRefresh = () => {
    const { executeFunc, currentState } = this.props;
    if (!this.canRefresh()) return false;

    if (currentState === RSTATES.pulling) {
      this.setState({ pullDistance: 0 });
      executeFunc(RSTATES.reset);
    } else {
      this.setState({
        pullDistance: 0,
      });
      executeFunc(RSTATES.refreshing);
    }
  }

  onPullUpMove = () => {
    const { executeFunc } = this.props;
    if (!this.canRefresh()) return false;

    this.setState({
      pullDistance: 0,
    });
    executeFunc(RSTATES.loading);
  }

  scrollFunc = () => {
    // scrollHeight: 正文全文高;  offsetHeight: 可见区域高;  scrollTop: 被卷去的高;
    const { beforeHeight, scollLoading } = this.state;
    const { actionSpaceBottom } = this.props;
    const { scrollTop, offsetHeight } = this[`${this.props.id}_container`];
    const { scrollHeight } = this[`${this.props.id}_container_box`];

    if (beforeHeight === scrollHeight) {
      if (
        ((scrollHeight - offsetHeight - scrollTop) <= actionSpaceBottom) && scollLoading
      ) {
        this.setState({
          scollLoading: false,
        });
        this.onPullUpMove();
      }
    } else {
      this.setState({
        beforeHeight: scrollHeight,
        scollLoading: true,
      });
    }
  }

  onTouchStart = (event) => {
    const targetEvent = event.changedTouches[0];
    this.startX = targetEvent.clientX;
    this.startY = targetEvent.clientY;
  }

  onTouchMove = (event) => {
    const { id } = this.props;
    const scrollTop = this.getScrollTopFunc();
    const scrollH = this[`${id}_defaultConfig`].container.scrollHeight;
    const conH = this[`${id}_defaultConfig`].container.offsetHeight;
    const targetEvent = event.changedTouches[0];
    const curX = targetEvent.clientX;
    const curY = targetEvent.clientY;
    const diffX = curX - this.startX;
    const diffY = curY - this.startY;

    // 判断垂直移动距离是否大于5 && 横向移动距离小于纵向移动距离
    if (Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
      // 滚动距离小于设定值 &&回调onPullDownMove 函数，并且回传位置值
      if (diffY > 5 && scrollTop < this[`${id}_defaultConfig`].offsetScrollTop) {
        event.preventDefault();
        this.onPullDownMove([{
          touchStartY: this.startY,
          touchMoveY: curY,
        }]);
      } else if (diffY < 0 && (scrollH - scrollTop - conH) < this[`${id}_defaultConfig`].actionSpaceBottom) {
        // 滚动距离距离底部小于设定值
        // event.preventDefault();
        // this.onPullUpMove([{
        //   touchStartY: this.startY,
        //   touchMoveY: curY,
        // }]);
        this.onPullUpMove();
      }
    }
  }

  onTouchEnd = (event) => {
    const { id } = this.props;
    const scrollTop = this.getScrollTopFunc();
    const targetEvent = event.changedTouches[0];
    const curX = targetEvent.clientX;
    const curY = targetEvent.clientY;
    const diffX = curX - this.startX;
    const diffY = curY - this.startY;

    // 判断垂直移动距离是否大于5 && 横向移动距离小于纵向移动距离
    if (Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
      if (diffY > 5 && scrollTop < this[`${id}_defaultConfig`].offsetScrollTop) {
        // 回调onPullDownRefresh 函数，即满足刷新条件
        this.onPullDownRefresh();
      }
    }
  }

  render() {
    const {
      id, children, currentState, HeadDOM, hasMore,
      // FooterDOM,
    } = this.props;
    const { pullDistance } = this.state;

    const msgStyle = pullDistance ? {
      WebkitTransform: `translate3d(0, ${pullDistance}px, 0)`,
      transform: `translate3d(0, ${pullDistance}px, 0)`,
    } : null;
    const newClassName = currentState ? styles[`state_${currentState}`] : styles.ridingwind;
    const footerClassName = hasMore ? styles.pullLoadFooterDefault : styles.pullLoadFooterDefaultNomore;
    return (
      <div
        className={newClassName}
        ref={(node) => { this[`${id}_container`] = node; }}
      >
        <div className={styles.pullLoadBody} style={msgStyle}>
          <div className={styles.pullLoadHead}>
            {
             HeadDOM || (
             <div className={styles.pullLoadHeadDefault}>
               <i />
             </div>
             )
            }
          </div>

          <div ref={(node) => { this[`${id}_container_box`] = node; }}>
            { children }
          </div>

          <div className={styles.pullLoadFooter}>
            {/* {
              FooterDOM || ( */}
            <div className={footerClassName}>
              {
                currentState === RSTATES.loading ? <i /> : ''
              }
            </div>
            {/* )
            } */}
          </div>
        </div>
      </div>
    );
  }
}
