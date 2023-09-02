import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, map, of, take, tap } from 'rxjs';
import { BaseUrls } from '../base-urls';
import { Users } from '../models/users';

@Injectable({
  providedIn: 'root',
})
export class DbService {

  public user: Users | null = null;
  public products: any[] = [];
  public whishlistProducts: any[] = [];

  wishlistsSub: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  wishlistsRetreived: boolean = false;

  cartsSub: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  cartsRetreived: boolean = false;

  restaurantsSub: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  restaurantsRetreived: boolean = false;
  
  dishesSub: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  dishesRetreived: boolean = false;

  orders: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  ordersRetreived: boolean = false;

  constructor(
    private http: HttpClient,
    private toast: ToastrService,
  ) {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.getUserCart();
  }

  getOrders() {
    if(!this.ordersRetreived) {
      this.http.get(`${BaseUrls.BASE_HREF}/${BaseUrls.ORDER_GROUPURL}/get-user-orders/${this.user?.userId}`)
      .subscribe({
        next: ({ code, message, data }: any) => {
          this.orders.next(Object.assign([], data))
          this.ordersRetreived = true
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  }

  getRestaurant() {
    if(!this.restaurantsRetreived) {
      this.http.get(BaseUrls.getUrl(BaseUrls.RESTAURANT_GROUPURL))
      .subscribe({
        next: ({ code, message, data }: any) => {
          this.restaurantsSub.next(Object.assign([], data))
          this.restaurantsRetreived = true
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  }

  getDishes() {
    if(!this.dishesRetreived) {
      this.http.get(BaseUrls.getUrl(BaseUrls.DISHES_GROUPURL))
      .subscribe({
        next: ({ code, message, data }: any) => {
          this.dishesSub.next(Object.assign([], data))
          this.dishesRetreived = true
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  }

  getUserCart(): void {
    this.http.get(`${BaseUrls.BASE_HREF}/${BaseUrls.CART_GROUPURL}/get-user-cart/${this.user?.userId}`)
      .subscribe({
        next: async ({ data }: any) => {
          let response = Array.from(data);
          let ids = response.map((e: any) => e['dishId']).join(",")
          if(ids.length !== 0) {
            let prdList: any = await this.getParticularProductsBasedOnIds(ids);
            let cart = response.map((cObj: any, idx: number) => {
              let prd = prdList.find((x: any) => x.dishId === cObj['dishId']);
              delete prd['dishId'];
              return { ...cObj, ...prd };
            });

            console.log(cart);
            
            this.cartsSub.next(cart);
          }
        },
        error: (error) => this.toast.warning("Something Went Wrong!! Please Again...", "Failed")
      });
  }

  async getParticularProductsBasedOnIds(ids: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${BaseUrls.getUrl(BaseUrls.DISHES_GROUPURL)}/dishes?dishIds=${ids}`).pipe(
        map(({ code, message, data }: any) => {
          resolve(data);
        }),
        catchError(error => of(error))
      ).subscribe();
    });
  }

  addProductToList(dishId: any): void {
    let formData = new FormData();
    formData.append("dishId", dishId);
    formData.append("userId", this.user?.userId);

    this.http.post(BaseUrls.getAddUrl(BaseUrls.CART_GROUPURL), formData)
      .subscribe({
        next: (value: any) => {
          this.getUserCart()
          this.toast.success(`Product added to shopping cart`, "Success");
        },
        error: (error) => {
          console.log(error);
          this.toast.warning("Something Went Wrong!! Please Again...", "Failed");
        }
      })
  }

  removeItemFromList(id: number,): void {
    this.http.get(`${BaseUrls.getDeleteUrl(BaseUrls.CART_GROUPURL)}/${id}`)
      .subscribe({
        next: (value: any) => {
          this.getUserCart()
          this.toast.success(`Product removed from shopping cart`, 'Success')
        },
        error: (error) => {
          console.log(error);
          this.toast.warning("Something Went Wrong!! Please Again...", "Failed");
        }
      });
  }

}
