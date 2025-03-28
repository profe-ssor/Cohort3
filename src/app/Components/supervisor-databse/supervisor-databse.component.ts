import { Component } from '@angular/core';
import { supervisor_database, supervisors_databaseResponse } from '../../model/interface/auth';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-supervisor-databse',
  standalone: true,
  imports: [],
  templateUrl: './supervisor-databse.component.html',
  styleUrl: './supervisor-databse.component.css'
})
export class SupervisorDatabseComponent {
  supervisorRecords: supervisor_database = {
    user_id: 0,
    full_name: '',
    ghana_card_record: 0,
    contact: '',
    assigned_institution: '',
    region_of_posting: '',
    assigned_workplace: 0,
  }
  respones: supervisors_databaseResponse = {
    message: '',
  };

  constructor(private supervisordatabase: AuthService, private router: Router) {}
}
