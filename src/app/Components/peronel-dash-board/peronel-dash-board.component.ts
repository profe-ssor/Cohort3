import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NssPersonelService } from '../../services/nss_personel.service';

@Component({
  selector: 'app-peronel-dash-board',
  standalone: true,
  imports: [],
  templateUrl: './peronel-dash-board.component.html',
  styleUrl: './peronel-dash-board.component.css',
  encapsulation: ViewEncapsulation.None
})
export class PeronelDashBoardComponent implements OnInit {
  personnel: any = null;
  showNav = false;

  constructor(private nssPersonelService: NssPersonelService) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    console.log('[Personnel Dashboard] userId from localStorage:', userId);
    if (userId) {
      this.nssPersonelService.getPersonnelByUserId(userId).subscribe({
        next: (data) => {
          console.log('[Personnel Dashboard] API response:', data);
          this.personnel = data;
        },
        error: (err) => {
          console.error('[Personnel Dashboard] API error:', err);
          this.personnel = null;
        }
      });
    } else {
      console.warn('[Personnel Dashboard] No user_id found in localStorage');
    }
  }
}
