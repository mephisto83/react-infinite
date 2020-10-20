// An infinite computer must be able to do the following things:
//  1. getTotalScrollableHeight()
//  2. getDisplayIndexStart()
//  3. getDisplayIndexEnd()

export default class InfiniteComputer {
  heightData: any;
  numberOfChildren: any;
  constructor(heightData: any, numberOfChildren: any) {
    this.heightData = heightData;
    this.numberOfChildren = numberOfChildren;
  }

  getTotalScrollableHeight(): any {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('getTotalScrollableHeight not implemented.');
    }
  }

  /* eslint-disable no-unused-vars */
  getDisplayIndexStart(windowTop: any): any {
    /* eslint-enable no-unused-vars */
    if (process.env.NODE_ENV === 'development') {
      throw new Error('getDisplayIndexStart not implemented.');
    }
  }

  /* eslint-disable no-unused-vars */
  getDisplayIndexEnd(windowBottom: any): any {
    /* eslint-enable no-unused-vars */
    if (process.env.NODE_ENV === 'development') {
      throw new Error('getDisplayIndexEnd not implemented.');
    }
  }

  // These are helper methods, and can be calculated from
  // the above details.
  /* eslint-disable no-unused-vars */
  getTopSpacerHeight(displayIndexStart: any): any {
    /* eslint-enable no-unused-vars */
    if (process.env.NODE_ENV === 'development') {
      throw new Error('getTopSpacerHeight not implemented.');
    }
  }

  /* eslint-disable no-unused-vars */
  getBottomSpacerHeight(displayIndexEnd: any): any {
    /* eslint-enable no-unused-vars */
    if (process.env.NODE_ENV === 'development') {
      throw new Error('getBottomSpacerHeight not implemented.');
    }
  }
}

