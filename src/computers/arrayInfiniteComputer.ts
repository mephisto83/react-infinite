/* @flow */

import InfiniteComputer from './infiniteComputer';
import bs from '../utils/binaryIndexSearch';

export default class ArrayInfiniteComputer extends InfiniteComputer {
  prefixHeightData: Array<number>;

  constructor(heightData: Array<number>, numberOfChildren: number) {
    super(heightData, numberOfChildren);
    this.prefixHeightData = this.heightData.reduce((acc: any, next: any) => {
      if (acc.length === 0) {
        return [next];
      } else {
        acc.push(acc[acc.length - 1] + next);
        return acc;
      }
    }, []);
  }

  maybeIndexToIndex(index?: number): number {
    if (typeof index === 'undefined' || index === null) {
      return this.prefixHeightData.length - 1;
    } else {
      return index;
    }
  }

  getTotalScrollableHeight(): number {
    var length = this.prefixHeightData.length;
    return length === 0 ? 0 : this.prefixHeightData[length - 1];
  }

  getDisplayIndexStart(windowTop: number): number {
    var foundIndex = bs.binaryIndexSearch(
      this.prefixHeightData,
      windowTop,
      bs.opts.CLOSEST_HIGHER
    );
    return this.maybeIndexToIndex(foundIndex);
  }

  getDisplayIndexEnd(windowBottom: number): number {
    var foundIndex = bs.binaryIndexSearch(
      this.prefixHeightData,
      windowBottom,
      bs.opts.CLOSEST_HIGHER
    );
    return this.maybeIndexToIndex(foundIndex);
  }

  getTopSpacerHeight(displayIndexStart: number): number {
    var previous = displayIndexStart - 1;
    return previous < 0 ? 0 : this.prefixHeightData[previous];
  }

  getBottomSpacerHeight(displayIndexEnd: number): number {
    if (displayIndexEnd === -1) {
      return 0;
    }
    return (
      this.getTotalScrollableHeight() - this.prefixHeightData[displayIndexEnd]
    );
  }
}

