import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';

export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}

export const ROUTES: RouteInfo[] = [
  { path: '/restaurants', title: 'Restaurants', icon: '', class: '' },
  { path: '/cart', title: 'Shopping Cart', icon: '', class: '' },
  { path: '/my-orders', title: 'My Orders', icon: '', class: '' },
  { path: '/profile', title: 'My Profile', icon: '', class: '' },
];

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  menuItems?: RouteInfo[];
  isCollapsed: boolean = true;

  constructor(
    public db: DbService,
    private modalService: NgbModal,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.menuItems = ROUTES.map(e => e);
  }

  openNavbarModal(navbarRef: any) {
    this.modalService.open(navbarRef)
  }
}
