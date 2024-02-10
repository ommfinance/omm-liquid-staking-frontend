import {Injectable} from '@angular/core';
// @ts-ignore
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import log from "loglevel";
import {Icx} from "../libs/hw-app-icx/Icx";
import {NotificationService} from "./notification.service";
import {environment} from "../../environments/environment";
import {StoreService} from "./store.service";
import {IconApiService} from "./icon-api.service";
import {
  LEDGER_ERROR,
  LEDGER_NOT_SUPPORTED,
  LEDGER_PLEASE_CONFIRM,
  LEDGER_UNABLE_TO_SIGN_TX,
  LEDGER_WAIT_ADDRESS
} from "../common/messages";
import {LedgerIcxBaseData} from "../models/interfaces/LedgerIcxBaseData";
import {Wallet} from "../models/classes/Wallet";
import {WalletType} from "../models/enums/WalletType";
import {ICX} from "../common/constants";
import {LocalStorageService} from "./local-storage.service";


@Injectable({
  providedIn: 'root'
})
export class LedgerService {

  private icx?: TransportWebHID;
  private transport: any;

  private LIST_NUM = 5;

  constructor(
    private notificationService: NotificationService,
    private storeService: StoreService,
    private iconApiService: IconApiService,
    private localStorageService: LocalStorageService
    ) { }

  async signIn(): Promise<LedgerIcxBaseData | undefined> {

    if (!TransportWebHID.isSupported) {
      this.notificationService.showNewNotification(LEDGER_NOT_SUPPORTED);
    }

    try {
      await this.initialiseTransport();

      this.notificationService.showNewNotification(LEDGER_WAIT_ADDRESS);

      // coin type: ICX(4801368), ICON testnet(1)
      return await this.icx.getAddress(environment.ledgerBip32Path, true, true);
    } catch (e) {
      this.notificationService.showNewNotification(LEDGER_ERROR);
      log.error("Error in TransportWebUSB... :");
      log.error(e);
      return undefined;
    }
  }

  async getLedgerWallets(index: number): Promise<Wallet[]> {
    try {
      const walletList = [];

      log.debug("getLedgerWallets initialiseTransport..");
      await this.initialiseTransport();

      for (let i = index * this.LIST_NUM; i < index * this.LIST_NUM + this.LIST_NUM; i++) {
        const path = `${environment.ledgerBip32Path}/${i}'`;
        const { address } = await this.icx.getAddress(path, false, true);

        if (i == index * this.LIST_NUM) {
          const localStorageWallets = await this.getWalletsPageFromLocalStorage(index, address);
          if (localStorageWallets) {
            return localStorageWallets;
          }
        }

        const wallet = new Wallet(address, WalletType.LEDGER, path);
        const icxBalance = await this.iconApiService.getIcxBalance(address);
        wallet.irc2TokenBalancesMap.set(ICX.symbol, icxBalance);

        walletList.push(wallet);
      }

      // save wallets in localstorage
      this.saveWalletsPageToLocalStorage(index, walletList);

      return walletList;
    } catch (e) {
      log.error("getLedgerWallets error: ", e);
      throw e;
    }
  }

  saveWalletsPageToLocalStorage(index: number, walletList: Wallet[]): void {
    if (walletList.length > 0) {
      this.localStorageService.set(`${index}-${walletList[0].address}`, JSON.stringify(walletList));
    }
  }

  async getWalletsPageFromLocalStorage(index: number, address: string): Promise<Wallet[] | undefined> {
    const walletsJsonString = this.localStorageService.get(`${index}-${address}`);

    if (walletsJsonString) {
      try {
        const wallets = JSON.parse(walletsJsonString) as Wallet[];

        return Promise.all(wallets.map(async (wallet) => {
          const newWallet = new Wallet(wallet.address, WalletType.LEDGER, wallet.ledgerPath);
          const icxBalance = await this.iconApiService.getIcxBalance(newWallet.address);
          newWallet.irc2TokenBalancesMap.set(ICX.symbol, icxBalance);

          return newWallet;
        }))
      } catch (e) {
        log.error(`[getWalletsPageFromLocalStorage] Failed to parse wallets from localstorage!`);
        return Promise.resolve(undefined);
      }
    } else {
      return Promise.resolve(undefined);
    }
  }

  // sign raw transaction and return signed transaction object
  async signTransaction(rawTransaction: any): Promise<any> {
    if (this.storeService.activeWallet?.type != WalletType.LEDGER) {
      throw new Error("Can not sign transaction with Ledger because Ledger wallet is not active!");
    }
    try {
      await this.initialiseTransport();

      // show confirmation notification
      this.notificationService.showNewNotification(LEDGER_PLEASE_CONFIRM);

      const rawTx = { ...rawTransaction };
      const phraseToSign = this._generateHashKey(rawTx);
      log.debug("phraseToSign: ", phraseToSign);

      const signedData = await this.icx.signTransaction(this.storeService.activeWallet.ledgerPath, phraseToSign);
      const { signedRawTxBase64 } = signedData;
      log.info("Ledger signTransaction result: ", signedData);

      // hide notifications
      this.notificationService.hideAll();

      return {
        ...rawTx,
        signature: signedRawTxBase64,
      };
    } catch (e) {
      this.notificationService.showNewNotification(LEDGER_UNABLE_TO_SIGN_TX);
      log.error(e);
      throw e;
    }
  }

  async initialiseTransport(): Promise<void> {
    if (this.transport?.device?.opened) {
      this.transport.close();
      this.icx = undefined;
    }

    if (!this.icx) {
      this.transport = await TransportWebHID.create();
      if (this.transport.setDebugMode) {
        this.transport.setDebugMode(false);
      }

      this.icx = new Icx(this.transport);
    }
  }

  _generateHashKey(obj: any): any {
    let resultStrReplaced = "";
    const resultStr = this._objTraverse(obj);
    resultStrReplaced = resultStr.substring(1).slice(0, -1);
    return "icx_sendTransaction." + resultStrReplaced;
  }

  _objTraverse(obj: any): any {
    let result = "";
    result += "{";
    let keys;
    keys = Object.keys(obj);
    keys.sort();
    if (keys.length > 0) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
        switch (true) {
          case value === null: {
            result += `${key}.`;
            result += String.raw`\0`;
            break;
          }
          case typeof value === "string": {
            result += `${key}.`;
            result += this._escapeString(value);
            break;
          }
          case Array.isArray(value): {
            result += `${key}.`;
            result += this._arrTraverse(value);
            break;
          }
          case typeof value === "object": {
            result += `${key}.`;
            result += this._objTraverse(value);
            break;
          }
          default:
            break;
        }
        result += ".";
      }
      result = result.slice(0, -1);
      result += "}";
    } else {
      result += "}";
    }

    return result;
  }

  _arrTraverse(arr: any): any {
    let result = "";
    result += "[";
    // tslint:disable-next-line:prefer-for-of
    for (let j = 0; j < arr.length; j++) {
      const value = arr[j];
      switch (true) {
        case value === null: {
          result += String.raw`\0`;
          break;
        }
        case typeof value === "string": {
          result += this._escapeString(value);
          break;
        }
        case Array.isArray(value): {
          result += this._arrTraverse(value);
          break;
        }
        case typeof value === "object": {
          result += this._objTraverse(value);
          break;
        }
        default:
          break;
      }
      result += ".";
    }
    result = result.slice(0, -1);
    result += "]";
    return result;
  }

  _escapeString(value: any): any {
    let newString = String.raw`${value}`;
    newString = newString.split("\\").join("\\\\");
    newString = newString.split(".").join("\\.");
    newString = newString.split("{").join("\\{");
    newString = newString.split("}").join("\\}");
    newString = newString.split("[").join("\\[");
    newString = newString.split("]").join("\\]");
    return newString;
  }

}
