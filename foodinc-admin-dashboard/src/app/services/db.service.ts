import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseUrls } from '../base-urls';
import { Users } from '../models/users';

export class Response {
  code: any;
  message: any;
  data: any[] = [];
}
@Injectable({
  providedIn: 'root'
})
export class DbService {
  
  users: BehaviorSubject<Users[]> = new BehaviorSubject<Users[]>([]);
  usersRetreivedBool: boolean = false;

  restaurants: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  restaurantsRetreivedBool: boolean = false;

  dishes: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  dishesRetreivedBool: boolean = false;

  constructor(
    private httpClient: HttpClient
  ) { }

  getUsers() {
    this.httpClient.get(BaseUrls.getUrl(BaseUrls.USER_GROUPURL))
    .subscribe({
      next: ({code, data, message}: any) => {
        this.users.next(data);
        this.usersRetreivedBool = true;          
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  getRestaurants() {
    this.httpClient.get(BaseUrls.getUrl(BaseUrls.RESTAURANT_GROUPURL))
    .subscribe({
      next: ({code, data, message}: any) => {          
        this.restaurants.next(data);
        this.restaurantsRetreivedBool = true;          
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  getDishes() {
    this.httpClient.get(BaseUrls.getUrl(BaseUrls.DISHES_GROUPURL))
    .subscribe({
      next: ({code, data, message}: any) => {          
        this.dishes.next(data);
        this.dishesRetreivedBool = true;          
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
}
