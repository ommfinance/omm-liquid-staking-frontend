import {Injectable} from '@angular/core';
import {ScoreService} from './score.service';
import {StoreService} from './store.service';
import {StateChangeService} from "./state-change.service";
import log from "loglevel";
import {CheckerService} from "./checker.service";
import {ReloaderService} from "./reloader.service";
import {ICON_BLOCK_INTERVAL, ICX, OMM, SEVEN_DAYS_IN_BLOCK_HEIGHT, SICX, supportedTokens} from "../common/constants";
import BigNumber from "bignumber.js";
import {AllAddresses} from "../models/interfaces/AllAddresses";
import {TokenSymbol} from "../models/Types/ModalTypes";
import {lastValueFrom, take} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {IEventLog} from "../models/interfaces/IEventLog";
import {dateToDateOnlyIsoString, hexToBigNumber, hexToNormalisedNumber} from "../common/utils";
import {Vote} from "../models/classes/Vote";
import {Proposal} from "../models/classes/Proposal";
import {IScoreParameter, IScoreParameterValue} from "../models/interfaces/IScoreParameter";
import {IconApiService} from "./icon-api.service";
import {IProposalScoreDetails} from "../models/interfaces/IProposalScoreDetails";
import {Mapper} from "../common/mapper";
import {LiquidStakingStatsHistoryService} from "./liquid-staking-stats-history.service";

@Injectable({
  providedIn: 'root'
})
export class DataLoaderService {

  /**
   * A Service responsible for loading data and consequently triggering the state change
   */

  constructor(private scoreService: ScoreService,
              private storeService: StoreService,
              private stateChangeService: StateChangeService,
              private checkerService: CheckerService,
              private reloaderService: ReloaderService,
              private iconApi: IconApiService,
              private http: HttpClient,
              private liquidStakingStatsService: LiquidStakingStatsHistoryService) {

  }

  public loadAllScoreAddresses(): Promise<void> {
    return this.scoreService.getAllScoreAddresses().then((allAddresses: AllAddresses) => {
      this.stateChangeService.allAddressesLoadedUpdate(allAddresses);
      log.debug("Loaded all addresses: ", allAddresses);
    });
  }

  public async loadAllUserAssetsBalances(): Promise<void> {
    try {
      await Promise.all(supportedTokens.map(
        async (token) => {
          try {
            const balance = await this.scoreService.getUserTokenBalance(token);
            // commit the change
            this.stateChangeService.updateUserTokenBalance(balance, token);
          } catch (e) {
            log.error("Failed to fetch balance for " + token);
            log.error(e);
          }
      }));
    } catch (e) {
      log.debug("Failed to fetch all user asset balances!");
    }
  }

  public async loadTokenPrices(): Promise<void> {
    try {
      log.debug("loadTokenPrices..");
      const ommPrice = await this.scoreService.getReferenceData(OMM.symbol);
      const icxPrice = await this.scoreService.getReferenceData(ICX.symbol);

      log.debug(`ommPrice = ${ommPrice.toFixed(6)}`);
      log.debug(`icxPrice = ${icxPrice.toFixed(6)}`);

      const tokenPrices = new Map<TokenSymbol, BigNumber>();
      tokenPrices.set(OMM.symbol, ommPrice);
      tokenPrices.set(ICX.symbol, icxPrice);

      this.stateChangeService.tokenPricesUpdate(tokenPrices);
    } catch (e) {
      log.debug("Error in loadTokenPrices");
      log.error(e);
    }
  }

  public async loadTotalValidatorRewards(): Promise<void> {
    try {
      const totalValidatorRewards: BigNumber = await this.scoreService.getTotalValidatorRewards();
      this.stateChangeService.totalValidatorSicxRewardsUpdate(totalValidatorRewards);
    } catch (e) {
      log.error("Error in loadTotalValidatorRewards:");
      log.error(e);
    }
  }

  public async loadProposalList(): Promise<void> {
    try {
      const res = await this.scoreService.getProposalList();
      this.stateChangeService.updateProposalsList(res);
    } catch (e) {
      log.error("Error in loadProposalList:");
      log.error(e);
    }
  }

  public async loadActiveBommUsersCount(): Promise<void> {
    try {
      const activeUsersCount: BigNumber = await this.scoreService.getBommHoldersCount();
      this.stateChangeService.bOmmHoldersCountUpdate(activeUsersCount);
    } catch (e) {
      log.error("Error in loadTotalValidatorRewards:");
      log.error(e);
    }
  }

  public async loadTodaySicxRate(): Promise<void> {
    try {
      const todaySicxRate: BigNumber = await this.scoreService.getTodayRate();
      this.stateChangeService.sicxTodayRateUpdate(todaySicxRate);
    } catch (e) {
          log.error("Error in loadTodaySicxRate:");
          log.error(e);
    }
  }

  public async loadUserUnstakeInfo(): Promise<void> {
    try {
      this.stateChangeService.userUnstakeInfoUpdate(await this.scoreService.getUserUnstakeInfo());
    } catch (e) {
      log.error("Error in loadUserUnstakeInfo:");
      log.error(e);
    }
  }

  public async loadUnstakeInfo(): Promise<void> {
    try {
      this.stateChangeService.unstakeInfoUpdate(await this.scoreService.getUnstakeInfo());
    } catch (e) {
      log.error("Error in loadUnstakeInfo:");
      log.error(e);
    }
  }

  public async loadUserClaimableIcx(): Promise<void> {
    try {
      this.stateChangeService.userClaimableIcxUpdate(await this.scoreService.getUserClaimableIcx());
    } catch (e) {
      log.error("Error in loadUserClaimableIcx:");
      log.error(e);
    }
  }

  public async loadBalancedDexFees(): Promise<void> {
    try {
      this.stateChangeService.balancedDexFeesUpdate(await this.scoreService.getBalancedDexFees());
    } catch (e) {
      log.error("Error in loadBalancedDexFees:");
      log.error(e);
    }
  }

  public async loadIcxSicxPoolStats(): Promise<void> {
    try {
      this.stateChangeService.icxSicxPoolStatsUpdate(await this.scoreService.getIcxSicxPoolStats());
    } catch (e) {
      log.error("Error in loadIcxSicxPoolStats:");
      log.error(e);
    }
  }

  public async loadTotalStakedIcx(): Promise<void> {
    try {
      this.stateChangeService.totalStakedIcxUpdate(await this.scoreService.getTotalStakedIcx());
    } catch (e) {
      log.error("Error in loadTotalStakedIcx:");
      log.error(e);
    }
  }

  public async loadlTotalSicxAmount(): Promise<void> {
    try {
      this.stateChangeService.totalSicxAmountUpdate(await this.scoreService.getTotalSicxAmount());
    } catch (e) {
      log.error("Error in loadlTotalSicxAmount:");
      log.error(e);
    }
  }

  public async loadlDaoFundTokens(): Promise<void> {
    try {
      this.checkerService.checkAllAddressesLoaded();

      const [ommBalance, sIcxBalance] = await Promise.all([
        this.scoreService.getTokenBalance(OMM, this.storeService.allAddresses?.systemContract.DaoFund!),
        this.scoreService.getTokenBalance(SICX, this.storeService.allAddresses?.systemContract.DaoFund!)
      ]);

      this.stateChangeService.daoFundBalanceUpdate({
        balances: [
          { token: OMM, balance: ommBalance },
          { token: SICX, balance: sIcxBalance }
        ]
      });
    } catch (e) {
      log.error("Error in loadlDaoFundTokens:");
      log.error(e);
    }
  }

  public async loadSicxHoldersAmount(): Promise<void> {
    try {
      const sicx = this.storeService.allAddresses!.collateral.sICX;
      const url = `${environment.trackerUrl}/api/v1/transactions/token-holders/token-contract/${sicx}?limit=10&skip=0`;
      const res =  await lastValueFrom(this.http.get<any>(url, {observe: 'response'}));
      const sicxHoldersAmount = res.headers.get("X-Total-Count");
      this.stateChangeService.sicxHoldersUpdate(new BigNumber(sicxHoldersAmount ?? 0));
    } catch (e) {
      log.error("Error in loadSicxHoldersAmount:");
      log.error(e);
    }
  }

  public async loadDelegationbOmmWorkingTotalSupply(): Promise<void> {
    try {
      this.stateChangeService.delegationbOmmTotalWorkingSupplyUpdate((await this.scoreService.getDelegationWorkingTotalSupplyOfbOmm()));
    } catch (e) {
      log.error("Error in loadDelegationbOmmWorkingTotalSupply:");
      log.error(e);
    }
  }

  public async loadUndelegatedIcx(): Promise<void> {
    try {
      this.stateChangeService.undelegatedIcxUpdate((await this.scoreService.getUndelegatedIcx()));
    } catch (e) {
      log.error("Error in loadUndelegatedIcx:");
      log.error(e);
    }
  }

  public async loadFeesDistributed7D(): Promise<void> {
    this.stateChangeService.lastBlockHeightChange$.pipe(take(1)).subscribe(async (lastBlockHeight) => {
      try {
        const method = "FeeDistributed"
        const limit = 100;
        let skip = 0
        let totalFees = new BigNumber(0);
        const ommFeeDistScoreAddress = this.storeService.allAddresses?.systemContract.FeeDistribution;
        const blockStart = lastBlockHeight.height - SEVEN_DAYS_IN_BLOCK_HEIGHT;
        let totalCount = undefined;

        do {
          const url =`${environment.trackerUrl}/api/v1/logs?limit=${limit}&skip=${skip}&address=${ommFeeDistScoreAddress}&block_start=${blockStart}&block_end=${lastBlockHeight.height}&method=${method}`;
          const res =  await lastValueFrom(this.http.get<IEventLog[]>(url, {observe: 'response'}));

          if (totalCount == undefined) {
            totalCount = parseInt(res.headers.get("X-Total-Count") ?? "0");
          }


          res.body?.forEach(eventLog => {
            if (eventLog.method == method) {
              const indexed = JSON.parse(eventLog.indexed);
              totalFees = totalFees.plus(hexToNormalisedNumber(indexed[1]));
            }
          });

          // skip "limit" number of records
          skip += limit;
          // reduce total count by queried limit
          totalCount -= limit;
        } while (totalCount > limit);

        log.debug("loadFeesCollected7D: ", totalFees.toString());

        this.stateChangeService.feeDistributed7DUpdate(totalFees);
      } catch (e) {
        log.error("Error in loadFeesCollected7D:");
        log.error(e);
      }
    })
  }

  public async loadUnstakingTime(): Promise<void> {
    try {
      const method = "UnstakingUpdate"
      const limit = 10;
      const stakingScore = this.storeService.allAddresses?.systemContract.Staking;

      const url =`${environment.trackerUrl}/api/v1/logs?limit=${limit}&address=${stakingScore}&method=${method}`;
      const res =  await lastValueFrom(this.http.get<IEventLog[]>(url, {observe: 'response'}));

      const unstakingTimesInBlock: BigNumber[] = [];

      res.body?.forEach(eventLog => {
        if (eventLog.method == method) {
          const indexed = JSON.parse(eventLog.indexed);
          const currentBlockHeight = hexToBigNumber(indexed[1]);
          const nextUnstakeBlock = hexToBigNumber(indexed[2]);

          unstakingTimesInBlock.push(nextUnstakeBlock.minus(currentBlockHeight));
        }
      });

      const avgUnstakingTimeInBlock = unstakingTimesInBlock.reduce((prev, curr) => prev.plus(curr), new BigNumber(0)).dividedBy(unstakingTimesInBlock.length);
      const avgUnstakingTimeInSeconds = avgUnstakingTimeInBlock.multipliedBy(ICON_BLOCK_INTERVAL);

      log.debug("avgUnstakingTimeInSeconds: ", avgUnstakingTimeInSeconds.toString());

      this.stateChangeService.unstakingTimeUpdate(avgUnstakingTimeInSeconds);
    } catch (e) {
      log.error("Error in loadUnstakingTime:");
      log.error(e);
    }
  }

  public async loadUserLockedOmm(): Promise<void> {
    try {
      const lockedOmm = await this.scoreService.getUserLockedOmmTokens();
      this.stateChangeService.userLockedOmmUpdate(lockedOmm);

      log.debug("User locked OMM: ", lockedOmm);
    } catch (e) {
      log.error("Error in loadUserLockedOmm:");
      log.error(e);
    }
  }

  public async loadUserOmmTokenBalanceDetails(): Promise<void> {
    try {
      const res = await this.scoreService.getOmmTokenBalanceDetails();
      log.debug("User Omm Token Balance Details: ", res);
      this.stateChangeService.updateUserOmmTokenBalanceDetails(res);
    } catch (e) {
      log.error("loadUserOmmTokenBalanceDetails:");
      log.error(e);
    }
  }

  public async loadUserDelegationWorkingbOmmBalance(): Promise<void> {
    try {
      const balance = await this.scoreService.getUserDelegationWorkingSupplyOfbOmm();
      this.stateChangeService.userDelegationWorkingbOmmBalanceUpdate(balance);

      log.debug("User working bOMM balance ", balance.toString());
    } catch (e) {
      log.error("Error in loadUserDelegationWorkingbOmmBalance:");
      log.error(e);
    }
  }

  public async loadUserAccumulatedFee(): Promise<void> {
    try {
      const amount = await this.scoreService.getUserAccumulatedOmmRewards();
      this.stateChangeService.userAccumulatedFeeUpdate(amount);
    } catch (e) {
      log.error("Error in loadUserAccumulatedFee:");
      log.error(e);
    }
  }

  public async loadUserCollectedFees(): Promise<void> {
    try {
      const amount = await this.scoreService.getValidatorCollectedFees();
      this.stateChangeService.userValidatorCollectedFeeUpdate(amount);
    } catch (e) {
      log.error("Error in loadUserCollectedFees:");
      log.error(e);
    }
  }

  public async loadUserValidatorBommDelegation(): Promise<void> {
    try {
      const amount = await this.scoreService.getPrepBommDelegation();
      this.stateChangeService.prepBommDelegationUpdate(amount);
    } catch (e) {
      log.error("Error in loadUserValidatorBommDelegation:");
      log.error(e);
    }
  }

  public async loadbOmmTotalSupply(): Promise<void> {
    try {
      const totalSupply = await this.scoreService.getTotalbOmmSupply();
      this.stateChangeService.bOmmTotalSupplyUpdate(totalSupply);

      log.debug("bOMM total supply ", totalSupply.toString());
    } catch (e) {
      log.error("Error in loadbOmmTotalSupply:");
      log.error(e);
    }
  }

  public async loadUserProposalVotes(): Promise<void> {
    // when proposal list is loaded, load all user votes for proposals which have not yet passed
    this.stateChangeService.proposalListChange$.pipe(take(1)).subscribe(async (proposalList) => {
      await Promise.all(proposalList.map( async (proposal) => {
        try {
          // make sure proposal is not over
          if (!proposal.proposalIsOver()) {
            try {
              // fetch user voting weight for proposal
              const votingWeight = await this.scoreService.getUserVotingWeight(proposal.voteSnapshot);
              this.stateChangeService.userVotingWeightForProposalUpdate(proposal.id, votingWeight);
            } catch (e) {
              log.error(e);
            }
          }

          const vote: Vote = await this.scoreService.getVotesOfUsers(proposal.id);

          if (!vote.voteIsEmpty()) {
            this.stateChangeService.userProposalVotesUpdate(proposal.id, vote);
          }
        } catch (e) {
          log.error("Failed to get user vote for proposal ", proposal);
          log.error(e);
        }
      }));
    })
  }

  public async loadAsyncContractOptions(proposal: Proposal): Promise<void> {
    log.debug("loadAsyncContractOptions...");
    try {
      // only load contract options if proposal have transactions
      if (proposal.transactions && proposal.transactions.length > 0) {
        const proposalScoreDetails: IProposalScoreDetails[] = [];

        // fetch transactions contract name, methods and api
        Promise.all(proposal.transactions.map(async (transaction) => {
          const name = await this.scoreService.getContractName(transaction.address);
          const method = transaction.method;
          const scoreApi = await this.iconApi.getScoreApi(transaction.address);
          const methodParams: IScoreParameter[] = scoreApi.getMethod(method).inputs;
          const parameters: IScoreParameterValue[] = new Array<IScoreParameterValue>();
          // combine method params and value in single object
          transaction.parameters.forEach((param, index) => parameters.push({ value: param.value, ...methodParams[index] }));

          proposalScoreDetails.push({
            address: transaction.address,
            name,
            method,
            parameters
          });
        }));

        this.stateChangeService.proposalScoreDetailsUpdate(proposal.id, proposalScoreDetails);
      }
    } catch (e) {
      log.error("Failed to loadAsyncContractOptions...");
      console.error(e);
    }

  }

  public async loadUserbOmmBalance(): Promise<void> {
    try {
      const balance = await this.scoreService.getUsersbOmmBalance();
      this.stateChangeService.userbOmmBalanceUpdate(balance);

      log.debug("User bOMM balance ", balance.toString());
    } catch (e) {
      log.error("Error in loadUserbOmmBalance:");
      log.error(e);
    }
  }

  public async loadVoteDefinitionFee(): Promise<void> {
    try {
      const res = await this.scoreService.getVoteDefinitionFee();
      log.debug("getVoteDefinitionFee (mapped): ", res);

      this.stateChangeService.voteDefinitionFeeUpdate(res);
    } catch (e) {
      log.error("Error in loadVoteDefinitionFee:");
      log.error(e);
    }
  }

  public async loadVoteDefinitionCriterion(): Promise<void> {
    try {
      const res = await this.scoreService.getBoostedOmmVoteDefinitionCriteria();
      log.debug("loadVoteDefinitionCriterion (mapped): ", res);

      this.stateChangeService.voteDefinitionCriterionUpdate(res);
    } catch (e) {
      log.error("Error in loadVoteDefinitionCriterion:");
      log.error(e);
    }
  }

  public async loadVoteDuration(): Promise<void> {
    try {
      const res = await this.scoreService.getVoteDuration();
      log.debug("loadVoteDuration (mapped): ", res);

      this.stateChangeService.voteDurationUpdate(res);
    } catch (e) {
      log.error("Error in loadVoteDuration:");
      log.error(e);
    }
  }

  public async loadActualPrepDelegations(): Promise<void> {
    try {
      const res = await this.scoreService.getActualPrepDelegations();
      this.stateChangeService.actualPrepDelegationsUpdate(res);
    } catch (e) {
      log.error("Error in loadActualPrepDelegations:");
      log.error(e);
    }
  }

  public async loadAllValidatorsCollectedFees(): Promise<void> {
    try {
      const res = await this.scoreService.getAllValidatorsCollectedFees();
      this.stateChangeService.allValidatorsCollectedFeesUpdate(res);
    } catch (e) {
      log.error("Error in loadAllValidatorsCollectedFees:");
      log.error(e);
    }
  }

  public async loadActualUserPrepDelegations(): Promise<void> {
    try {
      const res = await this.scoreService.getActualUserDelegationPercentage();
      this.stateChangeService.actualUserPrepDelegationsUpdate(res);
    } catch (e) {
      log.error("Error in loadActualUserPrepDelegations:");
      log.error(e);
    }
  }

  public async loadAllPrepsBommDelegations(): Promise<void> {
    try {
      const res = await this.scoreService.getAllPrepsBommDelegations();

      this.stateChangeService.prepsBommDelegationsUpdate(res);
    } catch (e) {
      log.error("Error in loadAllPrepsBommDelegations:");
      log.error(e);
    }
  }

  public async loadUserDelegations(): Promise<void> {
    try {
      const userDelegationDetails = await this.scoreService.getUserDelegationDetails();
      this.stateChangeService.userDelegationDetailsUpdate(userDelegationDetails);
    } catch (e) {
      log.error("Error occurred in loadUserDelegations:");
      log.error(e);
    }
  }

  public async loadStakingFeePercentage(): Promise<void> {
    try {
      const res = await this.scoreService.getStakingFeePercentage();
      this.stateChangeService.stakingFeeUpdate(res);
    } catch (e) {
      log.error("Error occurred in loadUserDelegations:");
      log.error(e);
    }
  }

  public async loadPrepList(start = 1, end = 100): Promise<void> {
    try {
      const prepList = await this.scoreService.getListOfPreps(start, end);

      // set logos
      try {
        let logoUrl;
        prepList.preps?.forEach(prep => {
          logoUrl = environment.production ? `https://iconwat.ch/logos/${prep.address}.png` : "assets/img/logo/icx.svg";
          prepList.prepAddressToLogoUrlMap.set(prep.address, logoUrl);
          prep.setLogoUrl(logoUrl);
        });
      } catch (e) {
        log.debug("Failed to fetch all logos");
      }

      this.stateChangeService.prepListUpdate(prepList);
    } catch (e) {
      log.error("Failed to load prep list... Details:");
      log.error(e);
    }
  }

  public async loadLiquidStakingStatsHistory(): Promise<void> {
    try {

      // load liquid staking stats history from local storage
      const liquidStakingStatsPersisted = this.liquidStakingStatsService.getLiquidStakingStatsFromLocalStorage();
      let liquidStakingStats = liquidStakingStatsPersisted?.data;

      // if liquid staking stats history did not exist in local storage fetch from backend API
      if (!liquidStakingStatsPersisted || !liquidStakingStats) {
        log.debug("liquidStakingStats does not exists in localstorage!");
        liquidStakingStats = Mapper.mapLiquidStakingStats([...(await this.liquidStakingStatsService.getLiquidStakingStatsHistory()).docs]);
        this.liquidStakingStatsService.persistLiquidStakingStatsHistoryInLocalStorage(liquidStakingStats);
      } else {
        log.debug("liquidStakingStats exists!");
        const nowDate = dateToDateOnlyIsoString(new Date());

        // check if loaded liquid staking stats history is up to date and re-load if not
        if (liquidStakingStatsPersisted.to !== nowDate) {
          log.debug("liquidStakingStats exists but with old date (older than 365 days)!!");
          liquidStakingStats = Mapper.mapLiquidStakingStats([...(await this.liquidStakingStatsService.getLiquidStakingStatsHistoryFromTo(
              liquidStakingStatsPersisted.to, nowDate
          )).docs]);
          this.liquidStakingStatsService.persistLiquidStakingStatsHistoryInLocalStorage(liquidStakingStats, true);
          liquidStakingStats = this.liquidStakingStatsService.getLiquidStakingStatsFromLocalStorage()!.data;
        }
      }

      this.stateChangeService.liquidStakingStatsUpdate(liquidStakingStats);
    } catch (e) {
      log.error("Failed to fetch liquid staking stats..");
      log.error(e);
    }
  }


  public async afterUserActionReload(): Promise<void> {
    // reload core and user data
    this.loadCoreData();
    this.loadUserSpecificData();
  }

  public async loadCoreData(): Promise<void> {
    this.loadCoreAsyncData();

    await Promise.all([
      this.loadTodaySicxRate(),
      this.loadTokenPrices(),
      this.loadBalancedDexFees(),
      this.loadIcxSicxPoolStats(),
      this.loadTotalStakedIcx(),
      this.loadlTotalSicxAmount(),
      this.loadSicxHoldersAmount(),
      this.loadDelegationbOmmWorkingTotalSupply(),
      this.loadUndelegatedIcx(),
      this.loadbOmmTotalSupply(),
      this.loadUnstakeInfo(),
    ]);

    // emit event indicating that core data was loaded
    this.stateChangeService.coreDataReloadUpdate();
  }

  public async loadUserSpecificData(): Promise<void> {
    await Promise.all([
      this.loadAllUserAssetsBalances(),
      this.loadUserUnstakeInfo(),
      this.loadUserClaimableIcx(),
      this.loadUserLockedOmm(),
      this.loadUserOmmTokenBalanceDetails(),
      this.loadUserDelegationWorkingbOmmBalance(),
      this.loadUserAccumulatedFee(),
      this.loadUserCollectedFees(),
      this.loadUserbOmmBalance(),
      this.loadUserValidatorBommDelegation(),
      this.loadActualUserPrepDelegations(),
      this.loadUserDelegations(),
      this.loadUserProposalVotes(),
    ]);

    // emit event that user data load has been completed
    this.stateChangeService.userDataReloadUpdate();
  }

  /**
   * Load core data async without awaiting
   */
  public loadCoreAsyncData(): void {
    this.loadStakingFeePercentage();
    this.loadLiquidStakingStatsHistory();
    this.loadUnstakingTime();
    this.loadFeesDistributed7D();
    this.loadlDaoFundTokens();
    this.loadTotalValidatorRewards();
    this.loadActiveBommUsersCount();
    this.loadProposalList();
    this.loadVoteDefinitionFee();
    this.loadVoteDefinitionCriterion();
    this.loadVoteDuration();
    this.loadActualPrepDelegations();
    this.loadPrepList();
    this.loadAllPrepsBommDelegations();
    this.loadAllValidatorsCollectedFees();
  }
}
