import React from 'react';

import HeaderContainer from 'web-containers/HeaderContainer';
import TradingPageLayout from 'web-components/TradingPageLayout';
import OrderBookHistory from 'web-components/OrderBookHistory';
import AssetPairCardContainer from 'web-containers/AssetPairCardContainer';
import BuySellContainer from 'web-containers/BuySellContainer';
import UserBalanceContainer from 'web-containers/UserBalanceContainer';
import UserOrdersContainer from 'web-containers/UserOrdersContainer';
import TradingChartContainer from 'web-containers/TradingChartContainer';
import ErrorBoundary from 'web-components/ErrorBoundary';

export default () => (
  <div>
    <ErrorBoundary>
      <HeaderContainer />
    </ErrorBoundary>
    <TradingPageLayout>
      <BuySellContainer key="buySell" />
      <UserBalanceContainer isTradingPage key="userBalance" />
      <OrderBookHistory key="orderBook" />
      <AssetPairCardContainer key="assetPairCard" />
      <TradingChartContainer key="tradingChart" />
      <UserOrdersContainer key="userOrders" />
    </TradingPageLayout>
  </div>
);
