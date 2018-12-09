// @flow
import * as eff from 'redux-saga/effects';
import * as R from 'ramda';
import * as utils from '../utils';
import * as walletActions from '../actions/wallet';
import ethApi from '../ethApi';


export function* watchWallet({
  delay,
  tokens,
}): Saga<void> {
  while (true) {
    try {
      const web3 = ethApi.getWeb3();
      const {
        networkId,
        accounts,
      } = yield eff.all({
        networkId: eff.call(web3.eth.net.getId),
        /*
         * metamask always return only single account
         * https://github.com/MetaMask/metamask-extension/issues/3207
        */
        accounts: eff.call(web3.eth.getAccounts),
      });
      const contractWrappers = ethApi.getWrappers(networkId);

      const selectedAccount = accounts.length ? accounts[0] : null;
      const selectedAccountBalance = (
        accounts.length
          ? (
            yield eff.call(web3.eth.getBalance, accounts[0])
          ) : null
      );
      const balance = yield eff.all(
        tokens.reduce(
          (acc, tokenAddress) => ({
            ...acc,
            [tokenAddress]: (
              contractWrappers.erc20Token.getBalanceAsync(
                tokenAddress,
                selectedAccount,
              ).then(b => b.toString())
            ),
          }),
          {},
        ),
      );

      const allowance = yield eff.all(
        tokens.reduce(
          (acc, tokenAddress) => ({
            ...acc,
            [tokenAddress]: (
              contractWrappers.erc20Token.getProxyAllowanceAsync(
                tokenAddress,
                selectedAccount,
              ).then(b => b.toString())
            ),
          }),
          {},
        ),
      );

      const changedData = [];
      const wallet = yield eff.select(s => s.wallet);
      if (wallet.networkId !== networkId) {
        changedData.push({
          networkId,
          networkName: utils.ethNetworks[networkId] || 'Unknown',
        });
      }
      if (accounts.some((w, i) => wallet.accounts[i] !== w)) {
        changedData.push({
          accounts,
        });
      }
      if (selectedAccount?.toLowerCase() !== wallet.selectedAccount?.toLowerCase()) {
        changedData.push({
          selectedAccount: selectedAccount.toLowerCase(),
        });
      }
      if (selectedAccountBalance !== wallet.selectedAccountBalance) {
        changedData.push({
          selectedAccountBalance,
        });
      }

      if (!R.equals(wallet.balance, balance)) {
        changedData.push({
          balance: {
            _merge: true,
            ...balance,
          },
        });
      }

      if (!R.equals(wallet.allowance, allowance)) {
        changedData.push({
          allowance: {
            _merge: true,
            ...allowance,
          },
        });
      }

      if (changedData.length) {
        yield eff.put(
          walletActions.setWalletState(
            changedData.reduce(
              (acc, data) => ({
                ...acc,
                ...data,
              }),
              {},
            ),
          ),
        );
      }
    } catch (err) {
      console.log(err);
    }
    yield eff.delay(delay);
  }
}
