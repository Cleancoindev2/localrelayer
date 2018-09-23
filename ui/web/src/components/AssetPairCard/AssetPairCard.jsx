// @flow
import React from 'react';
import {
  Card,
} from 'antd';

import type {
  Node,
} from 'react';

import {
  ColoredSpan,
} from 'web-components/SharedStyledComponents';
import * as S from './styled';

type Props = {
  loading: boolean,
  assetPair: {
    id: string,
    assetDataA: {
      minAmount: string,
      maxAmount: string,
      precision: number,
      assetData: {
        symbol: string,
        address: string,
      },
    },
    assetDataB: {
      minAmount: string,
      maxAmount: string,
      precision: number,
      assetData: {
        symbol: string,
        address: string,
      },
    },
    meta: {
      tradingInfo: {
        volume: string,
        change24Hour: number,
        lastPrice: string,
        highPrice: string,
        lowPrice: string,
      },
    },
  },
};


const AssetPairCard = ({
  assetPair,
  loading = false,
}: Props): Node => {
  const assetDataA = assetPair?.assetDataA;
  const assetDataB = assetPair?.assetDataB;
  const tradingInfo = assetPair?.meta?.tradingInfo || {};
  const isPositive = (tradingInfo.change24Hour || 0) >= 0;
  return (
    <S.AssetPairCard loading={loading}>
      <Card.Meta
        title={(
          <S.CardTitle>
            <S.AssetPairInfo>
              {assetDataA?.assetData?.symbol}
              /
              {assetDataB?.assetData?.symbol}
              <S.BaseAssetAddress
                target="_blank"
                rel="noopener"
                href={`https://etherscan.io/token/${assetDataA?.assetData?.address}`}
              >
                {assetDataA?.assetData?.address}
              </S.BaseAssetAddress>
            </S.AssetPairInfo>
            <S.LastPrice>
              {tradingInfo?.lastPrice || 'No info about trades in 24hr'}
            </S.LastPrice>
          </S.CardTitle>
        )}
        description={(
          <S.AssetPrice>
            <div>
              <div>
                High:
                {tradingInfo.highPrice || '--'}
              </div>
              <div>
                Low:
                {tradingInfo.lowPrice || '--'}
              </div>
            </div>
            <div>
              <S.PriceChange>
                {isPositive
                  ? (
                    <ColoredSpan color="green">
                      {`+${tradingInfo.change24Hour || '0.00'}%`}
                    </ColoredSpan>
                  )
                  : (
                    <ColoredSpan color="red">
                      {`${tradingInfo.change24Hour || '0.00'}%`}
                    </ColoredSpan>
                  )}
              </S.PriceChange>
              <div>
                Volume:
                {tradingInfo.volume ? Number(tradingInfo.volume).toFixed(4) : 0}
              </div>
            </div>
          </S.AssetPrice>
        )}
      />
    </S.AssetPairCard>
  );
};

export default AssetPairCard;
