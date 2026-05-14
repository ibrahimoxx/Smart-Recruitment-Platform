import {
  Component, inject, signal, computed, HostListener, ElementRef,
  ViewChild, AfterViewInit, OnChanges, effect,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandPaletteService } from './command-palette.service';
import { AuthService } from '../../../core/services/auth.service';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  route: string;
  group: 'navigation' | 'candidate' | 'recruiter' | 'admin';
}

const ALL_COMMANDS: CommandItem[] = [
  { id: 'jobs', label: 'Browse Jobs', description: 'Search all job offers', icon: '🔍', route: '/jobs', group: 'navigation' },
  { id: 'login', label: 'Login', description: 'Sign in to your account', icon: '🔑', route: '/login', group: 'navigation' },
  { id: 'register', label: 'Register', description: 'Create a new account', icon: '✨', route: '/register', group: 'navigation' },
  { id: 'candidate-profile', label: 'My Profile', description: 'View and edit your profile', icon: '👤', route: '/candidate/profile', group: 'candidate' },
  { id: 'candidate-apps', label: 'My Applications', description: 'Track your job applications', icon: '📋', route: '/candidate/applications', group: 'candidate' },
  { id: 'recruiter-dashboard', label: 'Recruiter Dashboard', description: 'View your analytics', icon: '📊', route: '/recruiter/dashboard', group: 'recruiter' },
  { id: 'recruiter-jobs', label: 'My Jobs', description: 'Manage your job postings', icon: '💼', route: '/recruiter/jobs', group: 'recruiter' },
  { id: 'recruiter-new-job', label: 'Post a Job', description: 'Create a new job offer', icon: '➕', route: '/recruiter/jobs/new', group: 'recruiter' },
  { id: 'admin-dashboard', label: 'Admin Dashboard', description: 'Platform analytics', icon: '🏛️', route: '/admin/dashboard', group: 'admin' },
  { id: 'admin-users', label: 'Manage Users', description: 'View and manage all users', icon: '👥', route: '/admin/users', group: 'admin' },
];

const GROUP_LABELS: Record<CommandItem['group'], string> = {
  navigation: 'Navigation',
  candidate: 'Candidate',
  recruiter: 'Recruiter',
  admin: 'Admin',
};

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (palette.isOpen()) {
      <div
        class="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh] px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-md"
          (click)="palette.close()"
          aria-hidden="true"
        ></div>

        <div
          class="relative w-full max-w-xl glass-strong rounded-2xl shadow-2xl overflow-hidden"
          style="box-shadow: 0 0 60px rgba(124,58,237,0.3), 0 25px 50px rgba(0,0,0,0.5);"
        >
          <!-- Search input -->
          <div class="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
            <svg class="w-5 h-5 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              #searchInput
              type="text"
              [(ngModel)]="query"
              (ngModelChange)="onQueryChange($event)"
              (keydown)="onKeyDown($event)"
              placeholder="Search commands..."
              class="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none font-mono"
              autocomplete="off"
              spellcheck="false"
            />
            <kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-white/30 border border-white/10">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-[360px] overflow-y-auto py-2">
            @if (filteredGroups().length === 0) {
              <div class="px-4 py-8 text-center text-white/30 text-sm">No commands found</div>
            }
            @for (group of filteredGroups(); track group.key) {
              <div>
                <div class="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                  {{ group.label }}
                </div>
                @for (item of group.items; track item.id; let i = $index) {
                  <button
                    type="button"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    [class.bg-white]="isActive(item)"
                    [class.bg-opacity-10]="isActive(item)"
                    [style.background]="isActive(item) ? 'rgba(124,58,237,0.15)' : ''"
                    (mouseenter)="setActive(item)"
                    (click)="execute(item)"
                  >
                    <span class="text-lg w-6 text-center flex-shrink-0">{{ item.icon }}</span>
                    <div class="min-w-0">
                      <div class="text-sm font-medium" [class.text-white]="isActive(item)" [class.text-white/80]="!isActive(item)">
                        {{ item.label }}
                      </div>
                      <div class="text-xs text-white/35 truncate">{{ item.description }}</div>
                    </div>
                    @if (isActive(item)) {
                      <kbd class="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-white/20 text-white/50 font-mono flex-shrink-0">↵</kbd>
                    }
                  </button>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-4 py-2.5 border-t border-white/10 flex items-center gap-4 text-[10px] text-white/25 font-mono">
            <span><kbd class="text-white/40">↑↓</kbd> navigate</span>
            <span><kbd class="text-white/40">↵</kbd> select</span>
            <span><kbd class="text-white/40">esc</kbd> close</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class CommandPaletteComponent {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly palette = inject(CommandPaletteService);
  private router = inject(Router);
  private auth = inject(AuthService);

  query = '';
  private activeId = signal<string>('');

  private visibleCommands = computed<CommandItem[]>(() => {
    const role = this.auth.userRole();
    const loggedIn = this.auth.isLoggedIn();

    return ALL_COMMANDS.filter(cmd => {
      if (cmd.group === 'navigation') {
        if ((cmd.id === 'login' || cmd.id === 'register') && loggedIn) return false;
        return true;
      }
      if (cmd.group === 'candidate') return role === 'CANDIDATE';
      if (cmd.group === 'recruiter') return role === 'RECRUITER';
      if (cmd.group === 'admin') return role === 'ADMIN';
      return false;
    });
  });

  readonly filteredGroups = computed(() => {
    const q = this.query.toLowerCase().trim();
    const items = q
      ? this.visibleCommands().filter(
          c => c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        )
      : this.visibleCommands();

    const grouped = new Map<CommandItem['group'], CommandItem[]>();
    for (const item of items) {
      if (!grouped.has(item.group)) grouped.set(item.group, []);
      grouped.get(item.group)!.push(item);
    }

    const result = Array.from(grouped.entries()).map(([key, groupItems]) => ({
      key,
      label: GROUP_LABELS[key],
      items: groupItems,
    }));

    if (result.length > 0 && result[0].items.length > 0 && !this.activeId()) {
      this.activeId.set(result[0].items[0].id);
    }

    return result;
  });

  isActive(item: CommandItem): boolean {
    return this.activeId() === item.id;
  }

  setActive(item: CommandItem): void {
    this.activeId.set(item.id);
  }

  onQueryChange(val: string): void {
    this.query = val;
    const groups = this.filteredGroups();
    if (groups.length > 0 && groups[0].items.length > 0) {
      this.activeId.set(groups[0].items[0].id);
    } else {
      this.activeId.set('');
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const allItems = this.filteredGroups().flatMap(g => g.items);
    const currentIdx = allItems.findIndex(i => i.id === this.activeId());

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = allItems[(currentIdx + 1) % allItems.length];
      if (next) this.activeId.set(next.id);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = allItems[(currentIdx - 1 + allItems.length) % allItems.length];
      if (prev) this.activeId.set(prev.id);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const active = allItems.find(i => i.id === this.activeId());
      if (active) this.execute(active);
    } else if (event.key === 'Escape') {
      this.palette.close();
    }
  }

  execute(item: CommandItem): void {
    this.router.navigate([item.route]);
    this.palette.close();
    this.query = '';
    this.activeId.set('');
  }

  constructor() {
    effect(() => {
      if (this.palette.isOpen()) {
        this.query = '';
        this.activeId.set('');
        setTimeout(() => this.searchInput?.nativeElement?.focus(), 50);
      }
    });
  }
}
