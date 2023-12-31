import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SubmitProposalPayload} from "../../../models/classes/SubmitProposalPayload";
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import {Calculations} from "../../../common/calculations";
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";
import {addSecondsToTimestamp, timestampNowMicroseconds} from "../../../common/utils";
import {RndDwnPipePipe} from "../../../pipes/round-down.pipe";

@Component({
  selector: 'app-submit-proposal-modal',
  standalone: true,
    imports: [CommonModule, UsFormatPipe, RndDwnPipePipe],
  templateUrl: './submit-proposal-modal.component.html'
})
export class SubmitProposalModalComponent {

  @Input({ required: true }) active!: boolean;

  @Input() payload: SubmitProposalPayload | undefined;

  constructor(private stateChangeService: StateChangeService,
              private transactionDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService,
  ) {
  }
  voteDefinitionFee(): BigNumber {
    return this.payload?.newProposal?.voteDefinitionFee ?? new BigNumber(0);
  }

  getVoteDuration(): string {
    return Calculations.getVoteDurationTime(this.payload?.voteDuration);
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onSubmitProposalClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.payload) {
      const now = timestampNowMicroseconds();
      this.payload.newProposal.snapshot = addSecondsToTimestamp(now, 60);
      this.payload.newProposal.voteStart = addSecondsToTimestamp(now, 62);

      const tx = this.scoreService.buildSubmitProposalTx(this.payload.newProposal);

      this.transactionDispatcher.dispatchTransaction(tx, this.payload);
    } else {
      throw Error("[SubmitProposalModalComponent] payload undefined!")
    }
  }

}
