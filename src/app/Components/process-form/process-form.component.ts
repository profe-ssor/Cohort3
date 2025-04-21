import { Component } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { PdfSignerComponent } from "../pdf-signer/pdf-signer.component";
import { PdfUploaderComponent } from "../pdf-uploader/pdf-uploader.component";

@Component({
  selector: 'app-process-form',
  standalone: true,
  imports: [PdfUploaderComponent],
  templateUrl: './process-form.component.html',
  styleUrl: './process-form.component.css'
})
export class ProcessFormComponent {

}
