import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminLayoutRoutingModule } from './admin-layout-routing.module';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { CheckoutComponent } from '../../pages/checkout/checkout.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrdersComponent } from '../../pages/orders/orders.component';
import { RestaurantComponent } from '../../pages/restaurant/restaurant.component';
import { ShoppingCartComponent } from 'src/app/pages/shopping-cart/shopping-cart.component';
import { DishesComponent } from '../../pages/dishes/dishes.component';


@NgModule({
  declarations: [
    UserProfileComponent,
    CheckoutComponent,
    OrdersComponent,
    RestaurantComponent,
    ShoppingCartComponent,
    DishesComponent
  ],
  imports: [
    CommonModule,
    AdminLayoutRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminLayoutModule { }
