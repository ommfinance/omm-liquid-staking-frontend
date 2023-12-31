import {Component, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ValidatorsComponent} from "../validators/validators.component";
import {OmmLockingComponent} from "../omm-locking/omm-locking.component";
import {VoteOverviewComponent} from "../vote-overview/vote-overview.component";
import {LatestProposalsComponent} from "../latest-proposals/latest-proposals.component";
import {ValidatorRewardsOverviewComponent} from "../validator-rewards-overview/validator-rewards-overview.component";
import {isBrowserTabActive} from "../../common/utils";
import {DataLoaderService} from "../../services/data-loader.service";
import {Subscription, timer} from "rxjs";
import {DATA_REFRESH_INTERVAL} from "../../common/constants";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {StoreService} from "../../services/store.service";
import {StateChangeService} from "../../services/state-change.service";
import {PrepList} from "../../models/classes/Preps";

@Component({
  selector: 'app-vote',
  standalone: true,
    imports: [
        CommonModule,
      ValidatorsComponent,
      OmmLockingComponent,
      VoteOverviewComponent,
      LatestProposalsComponent,
      ValidatorRewardsOverviewComponent
    ],
  templateUrl: './vote.component.html'
})
export class VoteComponent implements OnDestroy {

  private prepList?: PrepList;

  // Subscriptions
  dataRefreshPollingIntervalSub?: Subscription;
  prepListSub? : Subscription;

  constructor(private dataLoaderService: DataLoaderService,
              private storeService: StoreService,
              private stateChangeService: StateChangeService) {
    this.initDataRefreshPollingInterval();
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    this.dataRefreshPollingIntervalSub?.unsubscribe();
    this.prepListSub?.unsubscribe();
  }

  private registerSubscriptions(): void {
    this.subscribeToPreplistChange();
  }

  private subscribeToPreplistChange(): void {
    this.prepListSub = this.stateChangeService.prepListChange$.subscribe(prepList => {
      this.prepList = prepList;
    })
  }

  initDataRefreshPollingInterval(): void {
    this.dataRefreshPollingIntervalSub = timer(DATA_REFRESH_INTERVAL, DATA_REFRESH_INTERVAL).pipe(takeUntilDestroyed()).subscribe(() => {
      this.refreshData();
    })
  }

  private refreshData(): void {
    // only refresh data if browser tab is active
    if (isBrowserTabActive()) {
      // core data
      this.dataLoaderService.loadTokenPrices();
      this.dataLoaderService.loadlDaoFundTokens();
      this.dataLoaderService.loadTodaySicxRate();
      this.dataLoaderService.loadTotalValidatorRewards();
      this.dataLoaderService.loadActiveBommUsersCount();
      this.dataLoaderService.loadlTotalSicxAmount();
      this.dataLoaderService.loadDelegationbOmmWorkingTotalSupply();
      this.dataLoaderService.loadbOmmTotalSupply();
      this.dataLoaderService.loadActualPrepDelegations();

      // user specific data
      if (this.storeService.userLoggedIn()) {
        this.dataLoaderService.loadUserAccumulatedFee();
        this.dataLoaderService.loadUserCollectedFees();
        this.dataLoaderService.loadUserValidatorBommDelegation();
      }
    }
  }
}
