import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact: boolean;
}

@Component({
  selector: 'app-bottom-nav',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav-component.html',
  styleUrl: './bottom-nav-component.css',
})
export class BottomNavComponent {
  navItems: NavItem[] = [
    {
      label: 'Boards',
      icon: 'dashboard',
      route: '/app/dashboard',
      exact: true,
    },
    {
      label: 'Tasks',
      icon: 'task',
      route: '/app/task',
      exact: false,
    },
    {
      label: 'Activity',
      icon: 'bar_chart',
      route: '/app/notification',
      exact: false,
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/app/settings',
      exact: false,
    },
  ];

  constructor(public router: Router) {}
}
