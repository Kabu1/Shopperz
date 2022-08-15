import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartModelPublic, CartModelServer } from '../models/cart.model';
import { ProductModelServer } from '../models/product.model';
import { OrderService } from './order.service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private serverUrl = environment.SERVER_URL
//Data variable to store the cart information on the client's local storage
private cartDataClient: CartModelPublic = {
  total:0,
  prodData:[{
    inCart: 0,
    id: 0
  }]
};
  //Data variable to store the cart information on the front end service
  private cartDataFront: CartModelServer = {
    total: 0,
    data: [{
      numIncart: 0,
      product: undefined,
    }]
  };

  //observables for the components to subscribe
  // As we know multiple components share the common data and always need updated shared data. In such scenarios most of the time BehaviorSubject is used which acts as a single store to hold updated shared data.

  // BehaviorSubject is both observer and type of observable.
  // BehaviorSubject always need an initial/default value.
  // Every observer on subscribe gets current value.
  // Current value is either latest value emitted by source observable using next() method or initial/default value.

  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<CartModelServer>(this.cartDataFront);


  constructor(
    private http: HttpClient,
    private productService : ProductService,
    private orderService: OrderService,
    private router: Router

  ) {
    this.cartTotal$.next(this.cartDataFront.total);
    this.cartData$.next(this.cartDataFront);

    //get the information from local storage if any

// As the error says, localStorage.getItem() can return either a string or null.
// JSON.parse() requires a string,
// so you should test the result of localStorage.getItem() before you try to use it.
    let info: CartModelPublic = JSON.parse(localStorage.getItem('cart') || '{}');
    //check if the info variable is null or has data
    if(info !== null && info !== undefined && info.prodData[0].inCart !== 0){
      //local storage not empty
      this.cartDataClient = info;
      //loop through each entry and put it in cartDataFront
      this.cartDataClient.prodData.forEach(p => {
        this.productService.getproduct(p.id).subscribe((actualProductInfo: ProductModelServer) =>
        {
          if(this.cartDataFront.data[0].numIncart === 0){
            this.cartDataFront.data[0].numIncart = p.inCart;
            this.cartDataFront.data[0].product = actualProductInfo;

            //TODO: Create CalculateTotal function and replace it here
            this.cartDataClient.total = this.cartDataFront.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else {
            //cartDataFront has some entries in it
            this.cartDataFront.data.push({
              numIncart: p.inCart,
              product: actualProductInfo
            });
            //TODO: Create CalculateTotal function and replace it here
            this.cartDataClient.total = this.cartDataFront.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartData$.next({...this.cartDataFront});
        });
      });
    }
  }

}
