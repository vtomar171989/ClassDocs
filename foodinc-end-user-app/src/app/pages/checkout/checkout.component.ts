import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BaseUrls } from 'src/app/base-urls';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  cardImages: string[] = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Visa.svg/1200px-Visa.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1200px-Mastercard_2019_logo.svg.png",
    "https://trak.in/wp-content/uploads/2020/01/Rupay-Cards-Big-1.jpg"
  ];
  totalPrice: number = 0;

  cartProducts: any;

  constructor(
    public db: DbService,
    private httpClient: HttpClient,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.cartProducts = this.db.cartsSub.getValue();
    this.totalPrice = this.db.cartsSub.getValue().reduce((prev, next) => prev + (next['price'] * next['quantity']), 0);
  }

  saveOrder(paymentMethod: any, paymentMethodTitle: any) {
    let orderObj = {
      orderDate: new Date(),
      orderStatus: 0,
      address: '',
      totalItems: this.cartProducts?.length || 0,
      itemsSubTotal: this.totalPrice,
      shipmentCharges: 0,
      totalAmount: this.totalPrice,
      paymentStatus: 0,
      paymentStatusTitle: null,
      paymentMethod: paymentMethod,
      paymentMethodTitle: paymentMethodTitle,
      userId: this.db.user?.userId,
      name: this.db.user?.fullName,
      email: this.db.user?.email,
      contact: this.db.user?.contact
    };

    let formData = new FormData();
    Object.entries(orderObj).forEach(([key, value]: [string, any], idx: number) => {
      formData.append(key, value);
    });

    this.httpClient.post(BaseUrls.getAddUrl(BaseUrls.ORDER_GROUPURL), formData)
      .subscribe({
        next: async ({ code, message, data }: any) => {
          console.log(data);
          
          let orderId = data[0]['orderId'];
          let orderItems = this.cartProducts.map((e: any, idx: number) => {
            this.db.removeItemFromList(e['cartId']);
            return {
              orderId: orderId,
              productId: e.productId,
              productTitle: e.productTitle,
              productDescription: e.productDescription,
              productCode: e.productCode,
              productImg: e.images[e.thumbnailImage] || null,
              productCategory: e.categoryId,
              price: e.price,
              quantity: e.quantity,
              totalPrice: (e.price * e.quantity),
            }
          });
          this.httpClient.post(`${BaseUrls.BASE_HREF}/${BaseUrls.ORDER_ITEMS_GROUPURL}/add-items`, orderItems)
            .subscribe((value) => {
              console.log(value);
              this.toast.success("Order Placed Successfully");
              
            });
        },
        error: (error) => {
          console.log(error);
          this.toast.warning("Something went wrong!!", "Failed")
        }
      })
  }

}
