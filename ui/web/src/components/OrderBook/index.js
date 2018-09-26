// @flow
import OrderBook from './OrderBook';

export default OrderBook;

const layoutName = 'orderBook';
export const layout = {
  xs: {
    i: layoutName,
    x: 0,
    y: 12,
    w: 1,
    h: 16,
    static: true,
  },
  sm: {
    i: layoutName,
    x: 1,
    y: 0,
    w: 1,
    h: 18,
    static: true,
  },
  md: {
    i: layoutName,
    x: 7,
    y: 0,
    w: 3,
    h: 19,
    static: true,
  },
  lg: {
    i: layoutName,
    x: 9,
    y: 0,
    w: 3,
    h: 14,
    static: true,
  },
  lg2: {
    i: layoutName,
    x: 19,
    y: 0,
    w: 5,
    h: 14,
    static: true,
  },
  lg3: {
    i: layoutName,
    x: 10,
    y: 0,
    w: 2,
    h: 20,
    static: true,
  },
};
