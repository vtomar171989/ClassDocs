import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminsRoutingModule } from './admins-routing.module';
import { OrdersComponent } from '../../pages/orders/orders.component';
import { UsersComponent } from '../../pages/users/users.component';
import { PaymentsComponent } from '../../pages/payments/payments.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RestaurantsComponent } from '../../pages/restaurants/restaurants.component';
import { DishesComponent } from '../../pages/dishes/dishes.component';


@NgModule({
  declarations: [
    OrdersComponent,
    UsersComponent,
    PaymentsComponent,
    RestaurantsComponent,
    DishesComponent,
  ],
  imports: [
    CommonModule,
    AdminsRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminsModule { }
