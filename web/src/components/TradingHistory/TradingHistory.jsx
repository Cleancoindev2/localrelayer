// @flow
import React from 'react';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Order,
} from 'instex-core/types';

import {
  TradingHistoryContainer,
} from './styled';
import {
  Colored,
} from '../SharedStyles';
import OrdersList from '../OrdersList';


type Props = {
  /** List of all orders */
  orders: Array<Order>,
  /** Pagination config */
  pagination: {
    pageSize: number,
  }
};

const columns = [
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    render: (text: string, record) => (
      <Colored
        color={record.action === 'sell' ? 'red' : 'green'}
      >
        {text}
      </Colored>
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
];

/**
 * Trading History
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const TradingHistory: StatelessFunctionalComponent<Props> =
  ({
    orders,
    pagination,
  }: Props): Node =>
    <TradingHistoryContainer>
      <OrdersList
        title="Trading History"
        columns={columns}
        data={orders}
        pagination={pagination}
      />
    </TradingHistoryContainer>;

export default TradingHistory;