import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { CheckoutComponent } from 'src/app/pages/checkout/checkout.component';
import { DishesComponent } from 'src/app/pages/dishes/dishes.component';
import { OrdersComponent } from 'src/app/pages/orders/orders.component';
import { RestaurantComponent } from 'src/app/pages/restaurant/restaurant.component';
import { ShoppingCartComponent } from 'src/app/pages/shopping-cart/shopping-cart.component';
import { UserProfileComponent } from 'src/app/pages/user-profile/user-profile.component';

const routes: Routes = [
  { path: 'restaurants/:restaurantId/dishes', component: DishesComponent, canActivate: [AuthGuard] },
  { path: 'restaurants', component: RestaurantComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: ShoppingCartComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'my-orders', component: OrdersComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminLayoutRoutingModule { }
