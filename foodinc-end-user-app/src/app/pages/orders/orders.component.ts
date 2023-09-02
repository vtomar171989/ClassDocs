import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Orders } from 'src/app/models/orders';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  orders: Orders[] = [];

  constructor(
    private db: DbService,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    this.db.getOrders();
    this.db.orders.subscribe((list) => {
      if(list.length !== 0) this.orders = list
    })
    // this.orderObservable = this.httpClient.get<any[]>("assets/json/orders.json");
  }

}
