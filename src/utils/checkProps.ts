/* @flow */

import { ReactInfiniteProps } from "../../typelib/component/react_infinite_types";

// This module provides a centralized place for
// runtime checking that the props passed to React Infinite
// make the minimum amount of sense.

var React = require('react');
var _isFinite = require('lodash.isfinite');

export default function (props: ReactInfiniteProps) {
  var rie = 'Invariant Violation: ';
  if (!(props.containerHeight || props.useWindowAsScrollContainer || props.useParentContainer)) {
    throw new Error(
      rie +
      'Either containerHeight or useWindowAsScrollContainer must be provided.'
    );
  }

  if (!(_isFinite(props.elementHeight) || Array.isArray(props.elementHeight))) {
    throw new Error(
      rie +
      'You must provide either a number or an array of numbers as the elementHeight.'
    );
  }

  if (Array.isArray(props.elementHeight)) {
    if (React.Children.count(props.children) !== props.elementHeight.length) {
      throw new Error(
        rie +
        'There must be as many values provided in the elementHeight prop as there are children.'
      );
    }
  }
};
