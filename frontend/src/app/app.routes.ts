import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/jobs', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },

  {
    path: 'jobs',
    loadComponent: () =>
      import('./features/candidate/job-search/job-search.component').then(
        m => m.JobSearchComponent
      ),
  },
  {
    path: 'jobs/:id',
    loadComponent: () =>
      import('./features/candidate/job-detail/job-detail.component').then(
        m => m.JobDetailComponent
      ),
  },

  {
    path: 'candidate',
    canActivate: [authGuard, roleGuard('CANDIDATE')],
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/candidate/profile/candidate-profile.component').then(
            m => m.CandidateProfileComponent
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/candidate/my-applications/my-applications.component').then(
            m => m.MyApplicationsComponent
          ),
      },
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
    ],
  },

  {
    path: 'recruiter',
    canActivate: [authGuard, roleGuard('RECRUITER')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/recruiter/dashboard/recruiter-dashboard.component').then(
            m => m.RecruiterDashboardComponent
          ),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/recruiter/my-jobs/my-jobs.component').then(m => m.MyJobsComponent),
      },
      {
        path: 'jobs/new',
        loadComponent: () =>
          import('./features/recruiter/job-form/job-form.component').then(
            m => m.JobFormComponent
          ),
      },
      {
        path: 'jobs/:id/edit',
        loadComponent: () =>
          import('./features/recruiter/job-form/job-form.component').then(
            m => m.JobFormComponent
          ),
      },
      {
        path: 'jobs/:id/applications',
        loadComponent: () =>
          import('./features/recruiter/applications/applications-list.component').then(
            m => m.ApplicationsListComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ADMIN')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/users.component').then(m => m.UsersComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  {
    path: '404',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        m => m.NotFoundComponent
      ),
  },
  { path: '**', redirectTo: '/404' },
];
