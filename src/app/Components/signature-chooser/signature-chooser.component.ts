import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-signature-chooser',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signature-chooser.component.html',
  styleUrl: './signature-chooser.component.css'
})
export class SignatureChooserComponent {
  @Output() signatureReady = new EventEmitter<{ type: string, file: File }>();
  selectedType = 'signature';
  drawnFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.signatureReady.emit({ type: this.selectedType, file });
  }

  onCreate() {
    if (this.drawnFile) this.signatureReady.emit({ type: this.selectedType, file: this.drawnFile });
  }
}
