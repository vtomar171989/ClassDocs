import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { DishesComponent } from 'src/app/pages/dishes/dishes.component';
import { OrdersComponent } from 'src/app/pages/orders/orders.component';
import { PaymentsComponent } from 'src/app/pages/payments/payments.component';
import { RestaurantsComponent } from 'src/app/pages/restaurants/restaurants.component';
import { UsersComponent } from 'src/app/pages/users/users.component';

const routes: Routes = [
  { path: 'users', component: UsersComponent,canActivate: [AuthGuard] },
  { path: 'orders', component: OrdersComponent,canActivate: [AuthGuard] },
  { path: 'payments', component: PaymentsComponent,canActivate: [AuthGuard] },
  { path: 'restaurants/:restaurantId/dishes', component: DishesComponent, canActivate: [AuthGuard] },
  { path: 'restaurants', component: RestaurantsComponent,canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminsRoutingModule { }
