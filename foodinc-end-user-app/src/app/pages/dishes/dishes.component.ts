import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseUrls } from 'src/app/base-urls';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.css']
})
export class DishesComponent implements OnInit {

  dishes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public db: DbService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((response: any) => {
      this.getDishes(response.restaurantId)
    })
  }


  getDishes(restaurantId: number) {
    this.http.get(`${BaseUrls.getUrl(BaseUrls.DISHES_GROUPURL)}/${restaurantId}/dishes`)
      .subscribe({
        next: ({ code, message, data }: any) => {
          this.dishes = data;
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

}
