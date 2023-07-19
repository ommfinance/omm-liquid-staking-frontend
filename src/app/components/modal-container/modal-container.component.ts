import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Subscription} from "rxjs";
import {StateChangeService} from "../../services/state-change.service";
import {StakeIcxPayload} from "../../models/classes/StakeIcxPayload";
import {SignInModalComponent} from "../modals/sign-in-modal/sign-in-modal.component";
import {ModalType} from "../../models/enums/ModalType";
import {LedgerLoginModalComponent} from "../modals/ledger-login-modal/ledger-login-modal.component";
import {StakeModalComponent} from "../modals/stake-modal/stake-modal.component";
import {UnstakeWaitModalComponent} from "../modals/unstake-wait-modal/unstake-wait-modal.component";
import {UnstakeWaitSicxPayload} from "../../models/classes/UnstakeWaitSicxPayload";
import {UnstakeInstantSicxPayload} from "../../models/classes/UnstakeInstantSicxPayload";
import {UnstakeInstantModalComponent} from "../modals/unstake-instant-modal/unstake-instant-modal.component";
import {ClaimIcxPayload} from "../../models/classes/ClaimIcxPayload";
import {ClaimIcxModalComponent} from "../modals/claim-icx-modal/claim-icx-modal.component";
import {WithdrawLockedOmmPayload} from "../../models/classes/WithdrawLockedOmmPayload";
import {WithdrawOmnModalComponent} from "../modals/withdraw-omn-modal/withdraw-omn-modal.component";
import {LockOmmModalComponent} from "../modals/lock-omm-modal/lock-omm-modal.component";
import {OmmLockingPayload} from "../../models/classes/OmmLockingPayload";

@Component({
  selector: 'app-modal',
  standalone: true,
    imports: [CommonModule, SignInModalComponent, LedgerLoginModalComponent, StakeModalComponent, UnstakeWaitModalComponent, UnstakeInstantModalComponent, ClaimIcxModalComponent, WithdrawOmnModalComponent, LockOmmModalComponent],
  templateUrl: './modal-container.component.html',
})
export class ModalContainerComponent implements OnInit, OnDestroy {

  protected readonly ModalType = ModalType;

  stakeIcxPayload?: StakeIcxPayload;
  unstakeWaitSicxPayload?: UnstakeWaitSicxPayload;
  unstakeInstantSicxPayload?: UnstakeInstantSicxPayload;
  claimIcxPayload? : ClaimIcxPayload;
  withdrawLockedOmmPayload?: WithdrawLockedOmmPayload;
  ommLockingPayload?: OmmLockingPayload;

  // Subscriptions
  payloadSub?: Subscription;

  activeModal: ModalType = ModalType.UNDEFINED;

  constructor(private stateChangeService: StateChangeService) {

  }
  ngOnInit(): void {
    this.subscribeToModalPayloadChange();
  }

  ngOnDestroy(): void {
    this.payloadSub?.unsubscribe();
  }

  subscribeToModalPayloadChange(): void {
    this.payloadSub = this.stateChangeService.modalPayloadChange$.subscribe(({ modalType, payload}) => {
      if (payload instanceof StakeIcxPayload) {
        this.stakeIcxPayload = payload;
      } else if (payload instanceof UnstakeWaitSicxPayload) {
        this.unstakeWaitSicxPayload = payload;
      } else if (payload instanceof  UnstakeInstantSicxPayload) {
        this.unstakeInstantSicxPayload = payload;
      } else if (payload instanceof  ClaimIcxPayload) {
        this.claimIcxPayload = payload;
      } else if (payload instanceof WithdrawLockedOmmPayload) {
        this.withdrawLockedOmmPayload = payload;
      } else if (payload instanceof OmmLockingPayload) {
        this.ommLockingPayload = payload;
      }

      this.activeModal = modalType;
    });
  }

  isModalActive(type: ModalType): boolean {
    return this.activeModal === type;
  }

  modalIsLockingType(): boolean {
    return this.activeModal === ModalType.LOCK_OMM
        || this.activeModal === ModalType.INCREASE_LOCK_OMM
        || this.activeModal === ModalType.INCREASE_LOCK_TIME
        || this.activeModal === ModalType.INCREASE_LOCK_TIME_AND_AMOUNT;
  }

}