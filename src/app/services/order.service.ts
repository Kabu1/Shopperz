import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  products: ProductResponseModel[] = [];
  private serverUrl = environment.SERVER_URL
  constructor(
    private http: HttpClient

  ) { }

    getSingleORder(orderId: number){
      return this.http.get<ProductResponseModel[]>(
        this.serverUrl + './orders' + orderId).toPromise();
        //toPromise converts an observable to a promise.
    }

}
interface ProductResponseModel {
  // An Interface is a specification that identifies a related set of properties and methods to be implemented by a class
  id: number;
  title: string;
  description: string;
  price: number;
  quantityOrdered: number;
  image: string;
}
