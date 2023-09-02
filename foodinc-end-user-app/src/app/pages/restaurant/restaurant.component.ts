import { Component, OnInit } from '@angular/core';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.css']
})
export class RestaurantComponent implements OnInit {


  restaurants: any[] = [];
  dishes: any[] = [];

  constructor(
    public db: DbService
  ) { }

  ngOnInit(): void {
    this.db.getRestaurant();
    this.db.getDishes();
    this.db.restaurantsSub.subscribe((list) => { if(list.length !== 0) this.restaurants = list })
    this.db.dishesSub.subscribe((list) => { if(list.length !== 0) this.dishes = list })
  }

}
