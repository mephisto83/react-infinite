import React from 'react';
import InfiniteComputer from '../../src/computers/infiniteComputer';

export type PreloadType = {
  type: string,
  amount: number
};
export type ElementHeight = number | Array<number>;

export type CSSStyle = { [key: string]: string | number };

export type ReactInfiniteUtilityFunctions = {
  getLoadingSpinnerHeight: () => number,
  subscribeToScrollListener: () => void,
  unsubscribeFromScrollListener: () => void,
  nodeScrollListener: (e: any) => void,
  getScrollTop: () => number,
  setScrollTop: (top: number) => void,
  scrollShouldBeIgnored: (e: any) => boolean,
  buildScrollableStyle: () => CSSStyle
};

export type ReactInfiniteProvidedDefaultProps = {
  handleScroll: () => any,

  useWindowAsScrollContainer: boolean,

  onInfiniteLoad: () => any,
  loadingSpinnerDelegate: any,

  displayBottomUpwards: boolean,

  isInfiniteLoading: boolean,
  timeScrollStateLastsForAfterUserScrolls: number,

  className: string,

  styles: {
    scrollableStyle?: Object
  }
}

export type ReactInfiniteProps = {
  children: any,
  handleScroll?: (event: any) => any,

  preloadBatchSize?: PreloadType,
  preloadAdditionalHeight?: PreloadType,

  elementHeight: ElementHeight,
  containerHeight?: number,
  useWindowAsScrollContainer?: boolean,
  useParentContainer?: boolean;
  displayBottomUpwards: boolean,

  infiniteLoadBeginEdgeOffset?: number,
  onInfiniteLoad?: () => any,
  loadingSpinnerDelegate?: any,

  isInfiniteLoading?: boolean,
  timeScrollStateLastsForAfterUserScrolls?: number,

  className?: string,

  styles: {
    scrollableStyle?: CSSStyle
  }
};

export type ReactInfiniteComputedProps = {
  children: any,
  handleScroll: (event: any) => any,

  preloadBatchSize: number,
  preloadAdditionalHeight: number,

  elementHeight: ElementHeight,
  containerHeight: number,
  useWindowAsScrollContainer?: boolean,

  displayBottomUpwards: boolean,

  infiniteLoadBeginEdgeOffset?: number,
  onInfiniteLoad: () => any,
  loadingSpinnerDelegate?: any,

  isInfiniteLoading?: boolean,
  timeScrollStateLastsForAfterUserScrolls?: number,

  className?: string,
  styles: {
    scrollableStyle?: CSSStyle
  }
};

export type ReactInfiniteState = {
  numberOfChildren: number,
  infiniteComputer: InfiniteComputer,
  isInfiniteLoading: boolean,
  preloadBatchSize: number,
  preloadAdditionalHeight: number,
  displayIndexStart: number,
  displayIndexEnd: number,
  isScrolling?: boolean,
  scrollTimeout?: any
};
