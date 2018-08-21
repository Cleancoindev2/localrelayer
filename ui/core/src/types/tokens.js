// @flow

import type {
  ID,
} from '../types';


export type TokenAttributes = {
  address: string,
  symbol: string,
  decimals: number,
  name: string,
  tradingInfo: {
    volume: string,
    highPrice: string,
    lowPrice: string,
    change24Hour: string,
    lastPrice: string,
  },
} & AddedTokenAttributes;

export type AddedTokenAttributes = {
  balance: string,
  fullBalance: string,
}


export type TokenRelationships = {
};

export type TokensById = {
  id: ID,
  attributes: TokenAttributes,
  relationships: TokenRelationships,
};

export type TokensResourcesReducer = {
  byId: {
    [ID]: TokensById,
  },
  allIds: Array<string>,
};

export type Token = {
  id: ID,
} & TokenAttributes;

export type Tokens = Array<Token>;