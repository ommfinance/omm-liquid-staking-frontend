import {ModalType} from "../enums/ModalType";
import {AssetAction} from "./AssetAction";
import {StakingAction} from "./StakingAction";
import {VoteAction} from "./VoteAction";
import {GovernanceVotePayload} from "./GovernanceVotePayload";
import {OmmLockingPayload} from "./OmmLockingPayload";
import {ManageStakedIcxAction} from "./ManageStakedIcxAction";


export class ModalAction {
  modalType: ModalType;
  assetAction?: AssetAction;
  stakingAction?: StakingAction;
  governanceAction?: GovernanceVotePayload;
  voteAction?: VoteAction;
  lockingOmmAction?: OmmLockingPayload;
  manageStakedIcxAction?: ManageStakedIcxAction;

  constructor(modalType: ModalType, assetAction?: AssetAction, stakingAction?: StakingAction, voteAction?: VoteAction,
              governanceAction?: GovernanceVotePayload, lockingOmmAction?: OmmLockingPayload, manageStakedIcxAction?: ManageStakedIcxAction) {
    this.modalType = modalType;
    this.assetAction = assetAction;
    this.stakingAction = stakingAction;
    this.voteAction = voteAction;
    this.governanceAction = governanceAction;
    this.lockingOmmAction = lockingOmmAction;
    this.manageStakedIcxAction = manageStakedIcxAction;
  }
}

export class ModalActionsResult {
  modalAction: ModalAction;
  status: ModalStatus;

  constructor(modalAction: ModalAction, status: ModalStatus) {
    this.modalAction = modalAction;
    this.status = status;
  }
}

export enum ModalStatus {
  SUCCESS,
  FAILED,
  CANCELLED
}
