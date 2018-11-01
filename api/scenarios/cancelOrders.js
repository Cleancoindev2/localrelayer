import {
  assetDataUtils,
  BigNumber,
  ContractWrappers,
} from '0x.js';
import {
  Web3Wrapper,
} from '@0xproject/web3-wrapper';

import {
  PrintUtils,
} from './utils/printing';
import {
  providerEngine,
} from './utils/providerEngine';
import {
  GANACHE_NETWORK_ID,
  ZERO,
  NULL_ADDRESS,
  GAS_DEFAULT,
} from './utils/constants';
import {
  getRandomFutureDateInSeconds,
} from './utils/helpers';


/**
 * In this scenario, the maker creates and signs many orders selling ZRX for WETH.
 * The maker is able to cancel all any number of these orders effeciently by using cancelOrdersUpTo.
 */
export async function scenarioAsync() {
  PrintUtils.printScenario('Cancel Orders Up To');
  // Initialize the ContractWrappers, this provides helper functions around calling
  // 0x contracts as well as ERC20/ERC721 token contracts on the blockchain
  const contractWrappers = new ContractWrappers(
    providerEngine,
    {
      networkId: GANACHE_NETWORK_ID,
    },
  );
  // Initialize the Web3Wrapper, this provides helper functions around fetching
  // account information, balances, general contract logs
  const web3Wrapper = new Web3Wrapper(providerEngine);
  const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
  const zrxTokenAddress = contractWrappers.exchange.getZRXTokenAddress();
  const etherTokenAddress = contractWrappers.etherToken.getContractAddressIfExists();
  if (!etherTokenAddress) {
    throw new Error('Ether Token not found on this network');
  }
  const printUtils = new PrintUtils(
    web3Wrapper,
    contractWrappers,
    { maker, taker },
    { WETH: etherTokenAddress, ZRX: zrxTokenAddress },
  );
  printUtils.printAccounts();

  // the amount the maker is selling of maker asset
  const makerAssetAmount = new BigNumber(100);
  // the amount the maker wants of taker asset
  const takerAssetAmount = new BigNumber(10);
  // 0x v2 uses hex encoded asset data strings
  // to encode all the information needed to identify an asset
  const makerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
  const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);

  // Set up the Order and fill it
  const randomExpiration = getRandomFutureDateInSeconds();
  const exchangeAddress = contractWrappers.exchange.getContractAddress();

  // Rather than using a random salt, we use an incrementing salt value.
  // When combined with cancelOrdersUpTo, all lesser values of salt can be cancelled
  // This allows the maker to cancel many orders with one on-chain transaction

  // Create the order
  const order1 = {
    exchangeAddress,
    makerAddress: maker,
    takerAddress: NULL_ADDRESS,
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    expirationTimeSeconds: randomExpiration,
    salt: new BigNumber(Date.now() - 1000 * 60 * 10),
    makerAssetAmount,
    takerAssetAmount,
    makerAssetData,
    takerAssetData,
    makerFee: ZERO,
    takerFee: ZERO,
  };

  const order2 = {
    ...order1,
    salt: new BigNumber(Date.now() - 1000 * 60),
  };

  const order3 = {
    ...order1,
    salt: new BigNumber(Date.now()),
  };

  // Fetch and print the order info
  let order1Info = await contractWrappers.exchange.getOrderInfoAsync(order1);
  let order2Info = await contractWrappers.exchange.getOrderInfoAsync(order2);
  let order3Info = await contractWrappers.exchange.getOrderInfoAsync(order3);
  printUtils.printOrderInfos({ order1: order1Info, order2: order2Info, order3: order3Info });

  // Maker cancels all orders before and including order2, order3 remains valid
  const targetOrderEpoch = order2.salt;
  const txHash = await contractWrappers.exchange.cancelOrdersUpToAsync(targetOrderEpoch, maker, {
    gasLimit: GAS_DEFAULT,
  });
  const txReceipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
  printUtils.printTransaction('cancelOrdersUpTo', txReceipt, [['targetOrderEpoch', targetOrderEpoch.toString()]]);
  // Fetch and print the order info
  order1Info = await contractWrappers.exchange.getOrderInfoAsync(order1);
  order2Info = await contractWrappers.exchange.getOrderInfoAsync(order2);
  order3Info = await contractWrappers.exchange.getOrderInfoAsync(order3);
  printUtils.printOrderInfos({ order1: order1Info, order2: order2Info, order3: order3Info });

  // Stop the Provider Engine
  providerEngine.stop();
}

(async () => {
  try {
    if (!module.parent) {
      await scenarioAsync();
    }
  } catch (e) {
    console.log(e);
    providerEngine.stop();
    process.exit(1);
  }
})();