import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse } from '../../../core/models/api-response.model';
import { User, UserRole } from '../../../core/models/user.model';
import { ToastService } from '../../../shared/ui/toast.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeAgoPipe],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-white mb-1">User Management</h1>
          <p class="text-white/40 text-sm">{{ total() }} registered user{{ total() !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search by name or email…"
            class="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 border border-glass outline-none focus:border-aurora-violet/50 transition-colors"
            style="background:rgba(255,255,255,0.04)">
        </div>
        <div class="flex gap-2">
          @for (tab of roleTabs; track tab.value) {
            <button type="button" (click)="roleFilter.set(tab.value)"
              class="px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
              [style]="roleFilter() === tab.value
                ? 'background:rgba(124,58,237,0.2);color:#A78BFA;border:1px solid rgba(124,58,237,0.4)'
                : 'background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.08)'">
              {{ tab.label }}
            </button>
          }
        </div>
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="space-y-2">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="h-16 rounded-xl animate-pulse" style="background:rgba(255,255,255,0.04)"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <div class="flex flex-col items-center py-20 text-center">
          <p class="text-white/40 text-sm">No users found.</p>
        </div>
      } @else {
        <div class="glass rounded-2xl border border-glass overflow-hidden">
          <!-- Table header -->
          <div class="grid grid-cols-[1fr_160px_120px_100px] gap-4 px-5 py-3 border-b border-glass">
            <span class="text-xs text-white/30 uppercase tracking-wider">User</span>
            <span class="text-xs text-white/30 uppercase tracking-wider hidden sm:block">Joined</span>
            <span class="text-xs text-white/30 uppercase tracking-wider">Role</span>
            <span class="text-xs text-white/30 uppercase tracking-wider text-right">Actions</span>
          </div>

          <!-- Rows -->
          <div class="divide-y divide-glass">
            @for (user of filtered(); track user.id) {
              <div class="grid grid-cols-[1fr_160px_120px_100px] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group">
                <!-- User info -->
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    [style]="avatarStyle(user.role)">
                    {{ userInitials(user) }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="text-xs text-white/40 truncate">{{ user.email }}</p>
                  </div>
                </div>

                <!-- Joined -->
                <span class="text-xs text-white/40 hidden sm:block">{{ user.createdAt | timeAgo }}</span>

                <!-- Role badge -->
                <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold w-fit"
                  [style]="roleBadgeStyle(user.role)">
                  {{ user.role }}
                </span>

                <!-- Actions -->
                <div class="flex items-center justify-end gap-1">
                  <div class="relative">
                    <button type="button"
                      (click)="openRoleMenu(user.id)"
                      class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                      title="Change role">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                      </svg>
                    </button>
                    @if (roleMenuId() === user.id) {
                      <div class="absolute right-0 top-full mt-1 w-36 glass-strong rounded-xl shadow-glass-lg overflow-hidden animate-scale-in z-10" role="menu">
                        @for (role of otherRoles(user.role); track role) {
                          <button type="button" (click)="confirmRoleChange(user, role)"
                            class="w-full text-left px-3 py-2.5 text-xs transition-colors hover:bg-white/[0.06] text-white/70 hover:text-white"
                            role="menuitem">
                            Set as {{ role }}
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Role change confirm modal -->
    @if (roleChangeTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div class="absolute inset-0" style="background:rgba(10,10,15,0.85);backdrop-filter:blur(8px)"
          (click)="roleChangeTarget.set(null)"></div>
        <div class="relative w-full max-w-sm glass-strong rounded-2xl p-6 animate-scale-in">
          <h3 class="text-base font-bold text-white mb-2">Change user role?</h3>
          <p class="text-sm text-white/50 mb-6">
            Set <strong class="text-white/80">{{ roleChangeTarget()!.user.firstName }} {{ roleChangeTarget()!.user.lastName }}</strong>
            as <strong class="text-white/80">{{ roleChangeTarget()!.newRole }}</strong>?
          </p>
          <div class="flex gap-3">
            <button type="button" (click)="roleChangeTarget.set(null)" class="flex-1 btn-glass py-2.5 text-sm">Cancel</button>
            <button type="button" (click)="executeRoleChange()"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
              style="background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4)">
              Confirm
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`],
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  users = signal<User[]>([]);
  loading = signal(true);
  total = signal(0);
  searchQuery = '';
  roleFilter = signal<UserRole | 'ALL'>('ALL');
  roleMenuId = signal<string | null>(null);
  roleChangeTarget = signal<{ user: User; newRole: UserRole } | null>(null);

  roleTabs = [
    { label: 'All',       value: 'ALL' as const },
    { label: 'Candidate', value: 'CANDIDATE' as const },
    { label: 'Recruiter', value: 'RECRUITER' as const },
    { label: 'Admin',     value: 'ADMIN' as const },
  ];

  filtered = computed(() => {
    const q = this.searchQuery.toLowerCase();
    const r = this.roleFilter();
    return this.users().filter(u => {
      const matchRole = r === 'ALL' || u.role === r;
      const matchSearch = !q ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  });

  userInitials(u: User): string {
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }

  avatarStyle(role: UserRole): string {
    const styles: Record<UserRole, string> = {
      ADMIN:     'background:linear-gradient(135deg,rgba(124,58,237,0.4),rgba(99,102,241,0.4))',
      RECRUITER: 'background:linear-gradient(135deg,rgba(6,182,212,0.4),rgba(59,130,246,0.4))',
      CANDIDATE: 'background:linear-gradient(135deg,rgba(16,185,129,0.4),rgba(52,211,153,0.4))',
    };
    return styles[role] ?? '';
  }

  roleBadgeStyle(role: UserRole): string {
    const styles: Record<UserRole, string> = {
      ADMIN:     'background:rgba(124,58,237,0.2);color:#9B5CF6;border:1px solid rgba(124,58,237,0.3)',
      RECRUITER: 'background:rgba(6,182,212,0.2);color:#22D3EE;border:1px solid rgba(6,182,212,0.3)',
      CANDIDATE: 'background:rgba(16,185,129,0.2);color:#34D399;border:1px solid rgba(16,185,129,0.3)',
    };
    return styles[role] ?? '';
  }

  otherRoles(current: UserRole): UserRole[] {
    return (['ADMIN', 'RECRUITER', 'CANDIDATE'] as UserRole[]).filter(r => r !== current);
  }

  ngOnInit(): void {
    this.http.get<ApiResponse<PagedResponse<User>>>(`${environment.apiUrl}/api/admin/users?size=200`).subscribe({
      next: res => {
        const data = res.data as unknown as { content: User[]; totalElements: number } | User[];
        const content = Array.isArray(data) ? data : (data as { content: User[]; totalElements: number }).content ?? [];
        const total = Array.isArray(data) ? data.length : (data as { content: User[]; totalElements: number }).totalElements ?? 0;
        this.users.set(content);
        this.total.set(total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openRoleMenu(id: string): void {
    this.roleMenuId.set(this.roleMenuId() === id ? null : id);
  }

  confirmRoleChange(user: User, newRole: UserRole): void {
    this.roleMenuId.set(null);
    this.roleChangeTarget.set({ user, newRole });
  }

  executeRoleChange(): void {
    const target = this.roleChangeTarget();
    if (!target) return;
    this.http.patch<ApiResponse<User>>(
      `${environment.apiUrl}/api/admin/users/${target.user.id}/role`,
      { role: target.newRole }
    ).subscribe({
      next: res => {
        this.users.update(list => list.map(u => u.id === target.user.id ? res.data : u));
        this.roleChangeTarget.set(null);
        this.toast.success('Role updated.');
      },
      error: () => {
        this.roleChangeTarget.set(null);
        this.toast.error('Could not update role.');
      },
    });
  }
}
