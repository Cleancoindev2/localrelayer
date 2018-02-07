import {
  takeEvery,
  select,
  put,
  call,
} from 'redux-saga/effects';
import {
  delay,
} from 'redux-saga';
import type { Saga } from 'redux-saga';
import { ZeroEx } from '0x.js';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import {
  reset,
} from 'redux-form';
import * as types from '../actions/types';
import {
  getAddress,
  getCurrentToken,
  getCurrentPair,
} from '../selectors';
import {
  sendNotification,
  saveResourceRequest,
} from '../actions';
import {
  loadTokensBalance,
} from './profile';
import type {
  OrderData,
  ZrxOrder,
} from '../types';
import * as resourcesActions from '../actions/resources';

window.ZeroEx = ZeroEx;

BigNumber.config({ EXPONENTIAL_AT: 5000 });

export function* createOrder({
  amount,
  price,
  exp,
  type,
}: OrderData): Saga<*> {
  const { zeroEx } = window;
  const { NULL_ADDRESS } = ZeroEx;
  const EXCHANGE_ADDRESS = yield zeroEx.exchange.getContractAddress();

  const address = yield select(getAddress);
  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  let makerTokenAddress;
  let takerTokenAddress;
  let makerTokenAmount;
  let takerTokenAmount;
  if (type === 'sell') {
    makerTokenAddress = currentToken.id;
    takerTokenAddress = currentPair.id;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(new BigNumber(amount), currentToken.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(new BigNumber(price).times(amount), currentPair.decimals);
  } else if (type === 'buy') {
    makerTokenAddress = currentPair.id;
    takerTokenAddress = currentToken.id;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(new BigNumber(price).times(amount), currentPair.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(new BigNumber(amount), currentToken.decimals);
  }
  const zrxOrder = {
    maker: address,
    taker: NULL_ADDRESS,
    feeRecipient: NULL_ADDRESS,
    exchangeContractAddress: EXCHANGE_ADDRESS,
    salt: ZeroEx.generatePseudoRandomSalt(),
    makerFee: new BigNumber(0),
    takerFee: new BigNumber(0),
    makerTokenAddress,
    takerTokenAddress,
    makerTokenAmount,
    takerTokenAmount,
    expirationUnixTimestampSec: new BigNumber(moment(exp).unix()),
  };
  const orderHash = ZeroEx.getOrderHashHex(zrxOrder);
  try {
    const ecSignature = yield zeroEx.signOrderHashAsync(orderHash, address);
    const signedZRXOrder = {
      ...zrxOrder,
      ecSignature,
    };
    yield zeroEx.exchange.validateOrderFillableOrThrowAsync(signedZRXOrder);

    const order = {
      price: +price,
      amount: +amount,
      token_address: currentToken.id,
      type,
      zrxOrder: signedZRXOrder,
      expires_at: exp.toDate(),
    };
    yield put(saveResourceRequest({
      resourceName: 'orders',
      list: type,
      data: {
        attributes: order,
        resourceName: 'orders',
      },
    }));
    yield put(sendNotification({ message: 'Order created', type: 'success' }));
    yield put(reset('BuySellForm'));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

export function* fillOrder(payload: ZrxOrder): Saga<*> {
  const { zeroEx } = window;
  const address = yield select(getAddress);
  payload.makerTokenAmount = BigNumber(payload.makerTokenAddress); // eslint-disable-line
  payload.takerTokenAmount = BigNumber(payload.takerTokenAddress); // eslint-disable-line
  console.log(payload);
  try {
    const txHash = yield call(
      [zeroEx.exchange, zeroEx.exchange.fillOrderAsync],
      payload,
      payload.takerTokenAmount,
      true, // shouldThrowOnInsufficientBalanceOrAllowance
      address, // takerAddress
    );
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
    yield call(delay, 12000);
    yield call(loadTokensBalance);

    yield put(sendNotification({ message: 'Order filled', type: 'success' }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

export function* loadOrders(): Saga<*> {
  const currentToken = yield select(getCurrentToken);
  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'buy',
      request: 'fetchOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'completed_at': null,
            'type': 'buy',
          },
        },
        sortBy: '-created_at',
      },
    }),
  );

  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'sell',
      request: 'fetchOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'completed_at': null,
            'type': 'sell',
          },
        },
        sortBy: '-created_at',
      },
    }),
  );

  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'completedOrders',
      request: 'fetchOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'completed_at': {
              'ne': null,
            },
          },
        },
        sortBy: '-created_at',
      },
    }),
  );
}

export function* listenNewOrder(): Saga<*> {
  yield takeEvery(types.CREATE_ORDER, action => createOrder(action.payload));
}

export function* listenFillOrder(): Saga<*> {
  yield takeEvery(types.FILL_ORDER, action => fillOrder(action.payload));
}

