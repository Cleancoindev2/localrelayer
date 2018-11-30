import {
  createSelector,
} from 'reselect';
import {
  coreSelectors as cs,
  utils,
} from 'instex-core';
import {
  BigNumber,
} from '0x.js';
import {
  getUiState,
} from '.';

export const getTradingHistory = createSelector(
  [
    cs.getTradingHistory,
    cs.getResourceMap('assets'),
    getUiState('currentAssetPairId'),
  ],
  (
    orders,
    assets,
    currentAssetPairId,
  ) => orders.map((order) => {
    const orderType = utils.getType(currentAssetPairId.split('_')[0], order.makerAssetData);

    const filledMakerAssetAmount = new BigNumber(order.makerAssetAmount)
      .times(order.metaData.filledTakerAssetAmount)
      .div(order.takerAssetAmount)
      .toFixed(8);

    const amount = orderType === 'bid'
      ? utils.toUnitAmount(
        order.metaData.filledTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8)
      : utils.toUnitAmount(
        filledMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8);

    const total = orderType === 'bid'
      ? utils.toUnitAmount(
        filledMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8)
      : utils.toUnitAmount(
        order.metaData.filledTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8);

    return {
      ...order,
      amount,
      total,
      price: utils.getPrice(
        orderType,
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
      key: order.id,
      completedAt: order.metaData.completedAt,
      lastFilledAt: order.metaData.lastFilledAt,
      type: orderType,
    };
  }),
);

export const getBidOrders = createSelector(
  [
    cs.getBidOrders,
    cs.getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.map(order => ({
      ...order,
      amount: utils.toUnitAmount(
        order.metaData.remainingFillableTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      total: utils.toUnitAmount(
        order.metaData.remainingFillableMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      price: utils.getPrice(
        'bid',
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
    }))
  ),
);

export const getAskOrders = createSelector(
  [
    cs.getAskOrders,
    cs.getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.map(order => ({
      ...order,
      amount: utils.toUnitAmount(
        order.metaData.remainingFillableMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      total: utils.toUnitAmount(
        order.metaData.remainingFillableTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      price: utils.getPrice(
        'ask',
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
    }))
  ),
);

export const getOpenOrders = createSelector(
  [
    cs.getResourceMappedList('orders', 'userOrders'),
    getUiState('currentAssetPairId'),
    cs.getResourceMap('assets'),
  ],
  (
    orders,
    currentAssetPairId,
    assets,
  ) => (
    orders.map((order) => {
      const orderType = utils.getType(currentAssetPairId.split('_')[0], order.makerAssetData);

      const amount = orderType === 'bid'
        ? utils.toUnitAmount(
          order.metaData.remainingFillableTakerAssetAmount,
          assets[order.takerAssetData].decimals,
        ).toFixed(8)
        : utils.toUnitAmount(
          order.metaData.remainingFillableMakerAssetAmount,
          assets[order.makerAssetData].decimals,
        ).toFixed(8);

      const total = orderType === 'bid'
        ? utils.toUnitAmount(
          order.metaData.remainingFillableMakerAssetAmount,
          assets[order.makerAssetData].decimals,
        ).toFixed(8)
        : utils.toUnitAmount(
          order.metaData.remainingFillableTakerAssetAmount,
          assets[order.takerAssetData].decimals,
        ).toFixed(8);

      return { ...order,
        pair: `${assets[order.makerAssetData].symbol}/${assets[order.takerAssetData].symbol}`,
        amount,
        total,
        price: utils.getPrice(
          orderType,
          order.makerAssetAmount,
          order.takerAssetAmount,
        ).toFixed(8),
        action: (
          (currentAssetPairId || '_').split('_')[0] === order.makerAssetData
            ? 'Sell'
            : 'Buy'
        ) };
    })
  ),
);

export const getCurrentOrder = createSelector(
  [
    getUiState('currentAssetPairId'),
    getUiState('currentOrderId'),
    cs.getResourceMap('assets'),
    cs.getResourceMap('orders'),
  ],
  (
    currentAssetPairId,
    currentOrderId,
    assets,
    orders,
  ) => {
    if (currentOrderId) {
      const orderType = utils.getType(currentAssetPairId.split('_')[0], orders[currentOrderId].makerAssetData);

      return {
        amount: utils.toUnitAmount(
          orderType === 'bid'
            ? orders[currentOrderId].metaData.remainingFillableTakerAssetAmount
            : orders[currentOrderId].metaData.remainingFillableMakerAssetAmount,
          assets[orders[currentOrderId].makerAssetData].decimals,
        ).toFixed(8),
        price: utils.getPrice(
          orderType,
          orders[currentOrderId].metaData.remainingFillableMakerAssetAmount,
          orders[currentOrderId].metaData.remainingFillableTakerAssetAmount,
        ).toFixed(8),
      };
    }
    return {};
  },
);
