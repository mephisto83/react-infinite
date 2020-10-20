/* @flow */

import { SyntheticEvent } from "react";
import { ReactInfiniteComputedProps, ReactInfiniteProps, ReactInfiniteProvidedDefaultProps, ReactInfiniteState, ReactInfiniteUtilityFunctions } from "../typelib/component/react_infinite_types";

var React = require('react');
var PropTypes = require('prop-types');
var window = require('./utils/window');

require('./utils/establish-polyfills');
var scaleEnum = require('./utils/scaleEnum');
var infiniteHelpers = require('./utils/infiniteHelpers');
var _isFinite = require('lodash.isfinite');

var checkProps = require('./utils/checkProps');

class Infinite extends React.Component<
  ReactInfiniteProvidedDefaultProps,
  ReactInfiniteProps,
  ReactInfiniteState
  > {

  static propTypes = {
    children: PropTypes.any,

    handleScroll: PropTypes.func,

    // preloadBatchSize causes updates only to
    // happen each preloadBatchSize pixels of scrolling.
    // Set a larger number to cause fewer updates to the
    // element list.
    preloadBatchSize: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        type: PropTypes.oneOf(['containerHeightScaleFactor']).isRequired,
        amount: PropTypes.number.isRequired
      })
    ]),
    // preloadAdditionalHeight determines how much of the
    // list above and below the container is preloaded even
    // when it is not currently visible to the user. In the
    // regular scroll implementation, preloadAdditionalHeight
    // is equal to the entire height of the list.
    preloadAdditionalHeight: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        type: PropTypes.oneOf(['containerHeightScaleFactor']).isRequired,
        amount: PropTypes.number.isRequired
      })
    ]), // page to screen ratio

    // The provided elementHeight can be either
    //  1. a constant: all elements are the same height
    //  2. an array containing the height of each element
    elementHeight: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number)
    ]).isRequired,
    // This is the total height of the visible window. One
    // of
    containerHeight: PropTypes.number,
    useWindowAsScrollContainer: PropTypes.bool,

    displayBottomUpwards: PropTypes.bool.isRequired,

    infiniteLoadBeginEdgeOffset: PropTypes.number,
    onInfiniteLoad: PropTypes.func,
    loadingSpinnerDelegate: PropTypes.node,

    isInfiniteLoading: PropTypes.bool,
    timeScrollStateLastsForAfterUserScrolls: PropTypes.number,

    className: PropTypes.string,

    styles: PropTypes.shape({
      scrollableStyle: PropTypes.object
    }).isRequired
  };

  static containerHeightScaleFactor(factor: any) {
    if (!_isFinite(factor)) {
      throw new Error('The scale factor must be a number.');
    }
    return {
      type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
      amount: factor
    };
  }

  static defaultProps = {
    handleScroll: () => { },

    useWindowAsScrollContainer: false,

    onInfiniteLoad: () => { },
    loadingSpinnerDelegate: <div />,

    displayBottomUpwards: false,

    isInfiniteLoading: false,
    timeScrollStateLastsForAfterUserScrolls: 150,

    className: '',

    styles: {}
  };
  infiniteState: ReactInfiniteState | null;

  constructor(props: ReactInfiniteProps) {
    super(props);
    const nextInternalState = this.recomputeInternalStateFromProps(props);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;
    this.shouldAttachToBottom = props.displayBottomUpwards;

    const state = nextInternalState.newState;
    state.scrollTimeout = undefined;
    state.isScrolling = false;
    this.scrollable = null;
    this.topSpacer = null;
    this.bottomSpacer = null;
    this.smoothScrollingWrapper = null;
    this.loadingSpinner = null;
    this.infiniteState = state;
  }

  // Properties currently used but which may be
  // refactored away in the future.
  computedProps: ReactInfiniteComputedProps;

  utils: ReactInfiniteUtilityFunctions;
  shouldAttachToBottom = false;
  preservedScrollState = 0;
  loadingSpinnerHeight = 0;

  // Refs
  scrollable: HTMLDivElement | null;
  topSpacer: HTMLDivElement | null;
  bottomSpacer: HTMLDivElement | null;
  smoothScrollingWrapper: HTMLDivElement | null;
  loadingSpinner: HTMLDivElement | null;

  generateComputedUtilityFunctions = (
    props: ReactInfiniteProps
  ): ReactInfiniteUtilityFunctions => {
    var utilities: any = {};
    utilities.getLoadingSpinnerHeight = () => {
      var loadingSpinnerHeight = 0;
      if (this.loadingSpinner) {
        loadingSpinnerHeight = this.loadingSpinner.offsetHeight || 0;
      }
      return loadingSpinnerHeight;
    };
    if (props.useWindowAsScrollContainer) {
      utilities.subscribeToScrollListener = () => {
        window.addEventListener('scroll', this.infiniteHandleScroll);
      };
      utilities.unsubscribeFromScrollListener = () => {
        window.removeEventListener('scroll', this.infiniteHandleScroll);
      };
      utilities.nodeScrollListener = () => { };
      utilities.getScrollTop = () => window.pageYOffset;
      utilities.setScrollTop = (top: any) => {
        window.scroll(window.pageXOffset, top);
      };
      utilities.scrollShouldBeIgnored = () => false;
      utilities.buildScrollableStyle = () => ({});
    } else {
      utilities.subscribeToScrollListener = () => { };
      utilities.unsubscribeFromScrollListener = () => { };
      utilities.nodeScrollListener = this.infiniteHandleScroll;
      utilities.getScrollTop = () => {
        return this.scrollable ? this.scrollable.scrollTop : 0;
      };

      utilities.setScrollTop = (top: any) => {
        if (this.scrollable) {
          this.scrollable.scrollTop = top;
        }
      };
      utilities.scrollShouldBeIgnored = (event: any) =>
        event.target !== this.scrollable;

      utilities.buildScrollableStyle = () => {
        return Object.assign(
          {},
          {
            height: this.computedProps.containerHeight,
            overflowX: 'hidden',
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch'
          },
          this.computedProps.styles.scrollableStyle || {}
        );
      };
    }
    return utilities;
  };

  recomputeInternalStateFromProps = (
    props: ReactInfiniteProps
  ): {
    computedProps: ReactInfiniteComputedProps,
    utils: ReactInfiniteUtilityFunctions,
    newState: ReactInfiniteState
  } => {
    checkProps(props);
    var computedProps = infiniteHelpers.generateComputedProps(props);
    var utils: ReactInfiniteUtilityFunctions = this.generateComputedUtilityFunctions(
      props
    );

    var newState: any = {};

    newState.numberOfChildren = React.Children.count(computedProps.children);
    newState.infiniteComputer = infiniteHelpers.createInfiniteComputer(
      computedProps.elementHeight,
      computedProps.children
    );

    if (computedProps.isInfiniteLoading !== undefined) {
      newState.isInfiniteLoading = computedProps.isInfiniteLoading;
    }

    newState.preloadBatchSize = computedProps.preloadBatchSize;
    newState.preloadAdditionalHeight = computedProps.preloadAdditionalHeight;

    newState = Object.assign(
      newState,
      infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        newState,
        utils.getScrollTop()
      )
    );

    return {
      computedProps,
      utils,
      newState
    };
  };

  componentWillReceiveProps(nextProps: ReactInfiniteProps) {
    var nextInternalState = this.recomputeInternalStateFromProps(nextProps);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;

    this.setState(nextInternalState.newState);
  }

  componentWillUpdate() {
    if (this.props.displayBottomUpwards) {
      this.preservedScrollState =
        this.utils.getScrollTop() - this.loadingSpinnerHeight;
    }
  }

  componentDidUpdate(
    prevProps: ReactInfiniteProps,
    prevState: ReactInfiniteState
  ) {
    this.loadingSpinnerHeight = this.utils.getLoadingSpinnerHeight();

    if (
      !prevProps.useWindowAsScrollContainer &&
      this.props.useWindowAsScrollContainer
    ) {
      this.utils.subscribeToScrollListener();
    }

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (
        this.shouldAttachToBottom &&
        this.utils.getScrollTop() < lowestScrollTop
      ) {
        this.utils.setScrollTop(lowestScrollTop);
      } else if (prevProps.isInfiniteLoading && !this.props.isInfiniteLoading) {
        this.utils.setScrollTop(
          this.infiniteState.infiniteComputer.getTotalScrollableHeight() -
          prevState.infiniteComputer.getTotalScrollableHeight() +
          this.preservedScrollState
        );
      }
    }

    const hasLoadedMoreChildren =
      this.infiniteState.numberOfChildren !== prevState.numberOfChildren;
    if (hasLoadedMoreChildren) {
      var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        this.infiniteState,
        this.utils.getScrollTop()
      );
      this.setState(newApertureState);
    }

    const isMissingVisibleRows =
      hasLoadedMoreChildren &&
      !this.hasAllVisibleItems() &&
      !this.infiniteState.isInfiniteLoading;
    if (isMissingVisibleRows) {
      this.onInfiniteLoad();
    }
  }

  componentDidMount() {
    this.utils.subscribeToScrollListener();

    if (!this.hasAllVisibleItems()) {
      this.onInfiniteLoad();
    }

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (
        this.shouldAttachToBottom &&
        this.utils.getScrollTop() < lowestScrollTop
      ) {
        this.utils.setScrollTop(lowestScrollTop);
      }
    }
  }

  componentWillUnmount() {
    this.utils.unsubscribeFromScrollListener();
  }

  infiniteHandleScroll = (e: SyntheticEvent) => {
    if (this.utils.scrollShouldBeIgnored(e)) {
      return;
    }
    this.computedProps.handleScroll(this.scrollable);
    this.handleScroll(this.utils.getScrollTop());
  };

  manageScrollTimeouts = () => {
    // Maintains a series of timeouts to set this.infiniteState.isScrolling
    // to be true when the element is scrolling.

    if (this.infiniteState.scrollTimeout) {
      clearTimeout(this.infiniteState.scrollTimeout);
    }

    var that = this,
      scrollTimeout = setTimeout(() => {
        that.setState({
          isScrolling: false,
          scrollTimeout: undefined
        });
      }, this.computedProps.timeScrollStateLastsForAfterUserScrolls);

    this.setState({
      isScrolling: true,
      scrollTimeout: scrollTimeout
    });
  };

  getLowestPossibleScrollTop = (): number => {
    return (
      this.infiniteState.infiniteComputer.getTotalScrollableHeight() -
      this.computedProps.containerHeight
    );
  };

  hasAllVisibleItems = (): boolean => {
    return !(
      _isFinite(this.computedProps.infiniteLoadBeginEdgeOffset) &&
      this.infiniteState.infiniteComputer.getTotalScrollableHeight() <
      this.computedProps.containerHeight
    );
  };

  passedEdgeForInfiniteScroll = (scrollTop: number): boolean => {
    const edgeOffset = this.computedProps.infiniteLoadBeginEdgeOffset;
    if (typeof edgeOffset !== 'number') {
      return false;
    }

    if (this.computedProps.displayBottomUpwards) {
      return !this.shouldAttachToBottom && scrollTop < edgeOffset;
    } else {
      return (
        scrollTop >
        this.infiniteState.infiniteComputer.getTotalScrollableHeight() -
        this.computedProps.containerHeight -
        edgeOffset
      );
    }
  };

  onInfiniteLoad = () => {
    this.setState({ isInfiniteLoading: true });
    this.computedProps.onInfiniteLoad();
  };

  handleScroll = (scrollTop: number) => {
    this.shouldAttachToBottom =
      this.computedProps.displayBottomUpwards &&
      scrollTop >= this.getLowestPossibleScrollTop();

    this.manageScrollTimeouts();

    var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
      this.infiniteState,
      scrollTop
    );

    if (
      this.passedEdgeForInfiniteScroll(scrollTop) &&
      !this.infiniteState.isInfiniteLoading
    ) {
      this.setState(Object.assign({}, newApertureState));
      this.onInfiniteLoad();
    } else {
      this.setState(newApertureState);
    }
  };

  render(): any {
    var displayables;
    if (this.infiniteState.numberOfChildren > 1) {
      displayables = this.computedProps.children.slice(
        this.infiniteState.displayIndexStart,
        this.infiniteState.displayIndexEnd + 1
      );
    } else {
      displayables = this.computedProps.children;
    }

    var infiniteScrollStyles: any = {};
    if (this.infiniteState.isScrolling) {
      infiniteScrollStyles.pointerEvents = 'none';
    }

    var topSpacerHeight = this.infiniteState.infiniteComputer.getTopSpacerHeight(
      this.infiniteState.displayIndexStart
    ),
      bottomSpacerHeight = this.infiniteState.infiniteComputer.getBottomSpacerHeight(
        this.infiniteState.displayIndexEnd
      );

    // This asymmetry is due to a reluctance to use CSS to control
    // the bottom alignment
    if (this.computedProps.displayBottomUpwards) {
      var heightDifference =
        this.computedProps.containerHeight -
        this.infiniteState.infiniteComputer.getTotalScrollableHeight();
      if (heightDifference > 0) {
        topSpacerHeight = heightDifference - this.loadingSpinnerHeight;
      }
    }

    var loadingSpinner =
      this.computedProps.infiniteLoadBeginEdgeOffset === undefined
        ? null
        : <div
          ref={c => {
            this.loadingSpinner = c;
          }}
        >
          {this.infiniteState.isInfiniteLoading
            ? this.computedProps.loadingSpinnerDelegate
            : null}
        </div>;

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return (
      <div
        className={this.computedProps.className}
        ref={c => {
          this.scrollable = c;
        }}
        style={this.utils.buildScrollableStyle()}
        onScroll={this.utils.nodeScrollListener}
      >
        <div
          ref={c => {
            this.smoothScrollingWrapper = c;
          }}
          style={infiniteScrollStyles}
        >
          <div
            ref={c => {
              this.topSpacer = c;
            }}
            style={infiniteHelpers.buildHeightStyle(topSpacerHeight)}
          />
          {this.computedProps.displayBottomUpwards && loadingSpinner}
          {displayables}
          {!this.computedProps.displayBottomUpwards && loadingSpinner}
          <div
            ref={c => {
              this.bottomSpacer = c;
            }}
            style={infiniteHelpers.buildHeightStyle(bottomSpacerHeight)}
          />
        </div>
      </div>
    );
  }
}

export default Infinite;