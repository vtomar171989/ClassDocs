import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {

  cartProducts: any[] = [];

  public totalItems: number = 0;
  public totalPrice: number = 0;

  constructor(
    public db: DbService,
    private toast: ToastrService,
    private change: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.db.cartsSub.subscribe((list) => {
      if(list.length !== 0) {
        this.cartProducts = list;
        this.calculate();
      }
    })
  }
  
  addPrdToWishlist(prd: any, removeBool: boolean, prdIdx: number) {
    this.calculate();
  }
  
  removeProductFromCart(prdIdx: number) {
    let elements = this.db.products.splice(prdIdx, 1);
    this.toast.info(elements[0]['title'], "Product Removed from Cart");
    this.calculate();
  }

  removeItem(id: any) {
    this.db.removeItemFromList(id);
    this.db.getUserCart();
    this.db.cartsSub.next(this.cartProducts.splice(this.cartProducts.findIndex(x => x['cartId'] === id), 1))
  }
  
  calculate() {
    this.totalItems = this.cartProducts.reduce((prev, next) => prev + next['quantity'], 0)
    this.totalPrice = this.cartProducts.reduce((prev, next) => prev + (next['price'] * next['quantity']), 0);
  }

}
