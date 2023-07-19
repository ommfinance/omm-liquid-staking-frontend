import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";
import {Address, ModalPayload, TokenSymbol} from "../models/Types/ModalTypes";
import {ModalAction, ModalActionsResult} from "../models/classes/ModalAction";
import BigNumber from "bignumber.js";
import {Irc2Token} from "../models/classes/Irc2Token";
import {PersistenceService} from "./persistence.service";
import {ITokenBalanceUpdate} from "../models/interfaces/ITokenBalanceUpdate";
import {Wallet} from "../models/classes/Wallet";
import {ModalType} from "../models/enums/ModalType";
import {AllAddresses} from "../models/interfaces/AllAddresses";
import {supportedTokens} from "../common/constants";
import {UserUnstakeInfo} from "../models/classes/UserUnstakeInfo";
import {Block} from "icon-sdk-js";
import {BalancedDexFees} from "../models/classes/BalancedDexFees";
import {PoolStats} from "../models/classes/PoolStats";
import {IDaoFundBalance} from "../models/interfaces/IDaoFundBalance";
import {LockedOmm} from "../models/classes/LockedOmm";
import {OmmTokenBalanceDetails} from "../models/classes/OmmTokenBalanceDetails";
import {IModalChange} from "../models/interfaces/IModalChange";

@Injectable({
  providedIn: 'root'
})
export class StateChangeService {

  private userModalActionChange = new ReplaySubject<ModalAction>(1);
  userModalActionChange$ = this.userModalActionChange.asObservable();

  private allAddressesLoaded = new ReplaySubject<AllAddresses>(1);
  public allAddressesLoaded$ = this.allAddressesLoaded.asObservable();

  private userModalActionResult = new ReplaySubject<ModalActionsResult>(1);
  userModalActionResult$ = this.userModalActionResult.asObservable();

  private afterUserDataReload: Subject<void> = new Subject<void>();
  afterUserDataReload$: Observable<void> = this.afterUserDataReload.asObservable();

  private afterCoreDataReload: Subject<void> = new Subject<void>();
  afterCoreDataReload$: Observable<void> = this.afterCoreDataReload.asObservable();

  private currentTimestampChange = new ReplaySubject<{ currentTimestamp: number, currentTimestampMicro: BigNumber }>(1);
  currentTimestampChange$ = this.currentTimestampChange.asObservable();

  private modalPayloadChange = new ReplaySubject<IModalChange>(1);
  modalPayloadChange$= this.modalPayloadChange.asObservable();

  private lockedOmmActionSucceeded = new ReplaySubject<boolean>(1);
  lockedOmmActionSucceeded$: Observable<boolean> = this.lockedOmmActionSucceeded.asObservable();

  private irc2TokenBalanceUpdate = new ReplaySubject<ITokenBalanceUpdate>(1);
  irc2TokenBalanceUpdate$ = this.irc2TokenBalanceUpdate.asObservable();

  private loginChange = new ReplaySubject<Wallet | undefined>(1);
  public loginChange$ = this.loginChange.asObservable();

  private sicxTodayRateChange = new ReplaySubject<BigNumber>(1);
  public sicxTodayRateChange$ = this.sicxTodayRateChange.asObservable();

  private tokenPricesChange = new BehaviorSubject<Map<TokenSymbol, BigNumber>>(new Map<Address, BigNumber>());
  public tokenPricesChange$ = this.tokenPricesChange.asObservable();

  private userUnstakeInfoChange = new ReplaySubject<UserUnstakeInfo>(1);
  public userUnstakeInfoChange$ = this.userUnstakeInfoChange.asObservable();

  private lastBlockHeightChange = new ReplaySubject<Block>(1);
  public lastBlockHeightChange$ = this.lastBlockHeightChange.asObservable();

  private userClaimableIcxChange = new ReplaySubject<BigNumber>(1);
  public userClaimableIcxChange$ = this.userClaimableIcxChange.asObservable();

  private balancedDexFeesChange = new ReplaySubject<BalancedDexFees>(1);
  public balancedDexFeesChange$ = this.balancedDexFeesChange.asObservable();

  private icxSicxPoolStatsChange = new ReplaySubject<PoolStats>(1);
  public icxSicxPoolStatsChange$ = this.icxSicxPoolStatsChange.asObservable();

  private totalStakedIcxChange = new ReplaySubject<BigNumber>(1);
  public totalStakedIcxChange$ = this.totalStakedIcxChange.asObservable();

  private totalSicxAmountChange = new ReplaySubject<BigNumber>(1);
  public totalSicxAmountChange$ = this.totalSicxAmountChange.asObservable();

  private sicxHoldersChange = new ReplaySubject<BigNumber>(1);
  public sicxHoldersChange$ = this.sicxHoldersChange.asObservable();

  private feeDistributed7DChange = new ReplaySubject<BigNumber>(1);
  public feeDistributed7DChange$ = this.feeDistributed7DChange.asObservable();

  private daoFundBalanceChange = new BehaviorSubject<IDaoFundBalance>({ balances: [] });
  public daoFundBalanceChange$ = this.daoFundBalanceChange.asObservable();

  private totalValidatorSicxRewardsChange = new BehaviorSubject<BigNumber>(new BigNumber(0));
  public totalValidatorSicxRewardsChange$ = this.totalValidatorSicxRewardsChange.asObservable();

  private bOmmHoldersCountChange = new BehaviorSubject<BigNumber>(new BigNumber(0));
  public bOmmHoldersCountChange$ = this.bOmmHoldersCountChange.asObservable();

  private userLockedOmmChange = new ReplaySubject<LockedOmm>(1);
  userLockedOmmChange$ = this.userLockedOmmChange.asObservable();

  private userOmmTokenBalanceDetailsChange = new ReplaySubject<OmmTokenBalanceDetails>(1);
  userOmmTokenBalanceDetailsChange$ = this.userOmmTokenBalanceDetailsChange.asObservable();

  private userDelegationWorkingbOmmChange = new ReplaySubject<BigNumber>(1);
  userDelegationWorkingbOmmChange$ = this.userDelegationWorkingbOmmChange.asObservable();

  private userAccumulatedFeeChange = new ReplaySubject<BigNumber>(1);
  userAccumulatedFeeChange$ = this.userAccumulatedFeeChange.asObservable();

  private delegationbOmmTotalWorkingSupplyChange = new ReplaySubject<BigNumber>(1);
  delegationbOmmTotalWorkingSupplyChange$ = this.delegationbOmmTotalWorkingSupplyChange.asObservable();

  private bOmmTotalSupplyChange = new ReplaySubject<BigNumber>(1);
  bOmmTotalSupplyChange$ = this.bOmmTotalSupplyChange.asObservable();

  constructor(private persistenceService: PersistenceService) {
  }

  public bOmmTotalSupplyUpdate(value: BigNumber): void {
    this.bOmmTotalSupplyChange.next(value);
  }

  public delegationbOmmTotalWorkingSupplyUpdate(value: BigNumber): void {
      this.delegationbOmmTotalWorkingSupplyChange.next(value);
  }

  public userAccumulatedFeeUpdate(balance: BigNumber): void {
    this.userAccumulatedFeeChange.next(balance);
  }

  public userDelegationWorkingbOmmBalanceUpdate(balance: BigNumber): void {
    this.userDelegationWorkingbOmmChange.next(balance);
  }

  public updateUserOmmTokenBalanceDetails(userOmmTokenBalanceDetails: OmmTokenBalanceDetails): void {
    this.userOmmTokenBalanceDetailsChange.next(userOmmTokenBalanceDetails);
  }

  public userLockedOmmUpdate(lockedOmm: LockedOmm): void {
    this.userLockedOmmChange.next(lockedOmm);
  }

  public bOmmHoldersCountUpdate(value: BigNumber): void {
    this.bOmmHoldersCountChange.next(value);
  }

  public totalValidatorSicxRewardsUpdate(value: BigNumber): void {
    this.totalValidatorSicxRewardsChange.next(value);
  }

  public daoFundBalanceUpdate(value: IDaoFundBalance): void {
    this.daoFundBalanceChange.next(value);
  }

  public feeDistributed7DUpdate(value: BigNumber): void {
    this.feeDistributed7DChange.next(value);
  }

  public sicxHoldersUpdate(value: BigNumber): void {
    this.sicxHoldersChange.next(value);
  }

  public totalSicxAmountUpdate(value: BigNumber): void {
    this.totalSicxAmountChange.next(value);
  }

  public totalStakedIcxUpdate(value: BigNumber): void {
    this.totalStakedIcxChange.next(value);
  }

  public icxSicxPoolStatsUpdate(value: PoolStats): void {
    this.icxSicxPoolStatsChange.next(value);
  }

  public balancedDexFeesUpdate(value: BalancedDexFees): void {
    this.balancedDexFeesChange.next(value);
  }

  public userClaimableIcxUpdate(value: BigNumber): void {
    this.userClaimableIcxChange.next(value);
  }

  public lastBlockHeightUpdate(block: Block): void {
    this.lastBlockHeightChange.next(block);
  }

  public userUnstakeInfoUpdate(value: UserUnstakeInfo): void {
    console.log("UserUnstakeInfo: ", value);
    this.persistenceService.userUnstakeInfo = value;
    this.userUnstakeInfoChange.next(value);
  }

  public allAddressesLoadedUpdate(allAddresses: AllAddresses): void {
    // @ts-ignore
    supportedTokens.forEach(token => token.address = allAddresses.collateral[token.symbol] as Address)
    this.persistenceService.allAddresses = allAddresses;
    this.allAddressesLoaded.next(allAddresses);
  }

  public tokenPricesUpdate(value: Map<TokenSymbol, BigNumber>): void {
    this.persistenceService.tokenUsdPrices = value;
    this.tokenPricesChange.next(value);
  }

  public sicxTodayRateUpdate(value: BigNumber): void {
    this.persistenceService.sicxTodayRate = value;
    this.sicxTodayRateChange.next(value);
  }

  public modalUpdate(modalType: ModalType, payload?: ModalPayload): void {
    this.modalPayloadChange.next({ modalType, payload });
  }

  public hideActiveModal(): void {
    this.modalPayloadChange.next({ modalType: ModalType.UNDEFINED, payload: undefined });
  }

  public updateLoginStatus(wallet: Wallet | undefined): void {
    this.loginChange.next(wallet);
  }

  public updateUserTokenBalance(balance: BigNumber, token: Irc2Token): void {
    this.persistenceService.activeWallet!.irc2TokenBalancesMap.set(token.symbol, balance);
    this.irc2TokenBalanceUpdate.next({ token, amount: balance })
  }

  public userDataReloadUpdate(): void {
    this.afterUserDataReload.next();
  }

  public coreDataReloadUpdate(): void {
    this.afterCoreDataReload.next();
  }

  public userModalActionResultUpdate(value: ModalActionsResult): void {
    this.userModalActionResult.next(value);
  }

  public currentTimestampUpdate(currentTimestamp: number, currentTimestampMicro: BigNumber): void {
    this.currentTimestampChange.next({ currentTimestamp, currentTimestampMicro});
  }

  public updateUserModalAction(modalAction: ModalAction): void {
    this.userModalActionChange.next(modalAction);
  }

  public lockedOmmActionSucceededUpdate(succeeded: boolean): void {
    this.lockedOmmActionSucceeded.next(succeeded);
  }

}