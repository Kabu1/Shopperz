import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
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
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService

  ) {
    this.cartTotal$.next(this.cartDataFront.total);
    this.cartData$.next(this.cartDataFront);

    //get the information from local storage if any

// As the error says, localStorage.getItem() can return either a string or null.
// JSON.parse() requires a string,
// so you should test the result of localStorage.getItem() before you try to use it.
    let info: CartModelPublic = JSON.parse(localStorage.getItem('cart') || '{}');

    //check if the info variable is null or has data
    // Use the JavaScript function JSON.parse() to convert text into a JavaScript object:

    // if(info !== null && info !== undefined && info?.prodData[0]?.inCart !== 0){
      if(info !== null && info !== undefined){

      //local storage not empty
      this.cartDataClient = info;
      //loop through each entry and put it in cartDataFront
      this.cartDataClient?.prodData?.forEach(p => {
        this.productService.getProduct(p.id).subscribe((actualProductInfo: ProductModelServer) =>
        {
          if(this.cartDataFront.data[0].numIncart === 0){
            this.cartDataFront.data[0].numIncart = p.inCart;
            this.cartDataFront.data[0].product = actualProductInfo;
            this.calculateTotal();
            this.cartDataClient.total = this.cartDataFront.total;
            //TODO: Create CalculateTotal function and replace it here
            this.cartDataClient.total = this.cartDataFront.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
//             When sending data to a web server, the data has to be a string.
// Convert a JavaScript object into a string
          } else {
            //cartDataFront has some entries in it
            this.cartDataFront.data.push({
              numIncart: p.inCart,
              product: actualProductInfo
            });
            this.calculateTotal();
            this.cartDataClient.total = this.cartDataFront.total;
            //TODO: Create CalculateTotal function and replace it here
            this.cartDataClient.total = this.cartDataFront.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartData$.next({...this.cartDataFront});
        });
      });
    }

  }

  calculateSubTotal(index: number) {
    let subTotal = 0;

    let p = this.cartDataFront.data[index];
    // @ts-ignore
    subTotal = p.product.price * p.numInCart;

    return subTotal;
  }
  addProductToCart(id: number, quantity?: number){

      //if cart is empty
      this.productService.getProduct(id).subscribe(prod => {
          if(this.cartDataFront.data[0].product === undefined){
            this.cartDataFront.data[0].product = prod;
            this.cartDataFront.data[0].numIncart = quantity !== undefined ? quantity: 1;
            this.calculateTotal();
            this.cartDataClient.total = this.cartDataFront.total;

            //TODO calculate total amount
            this.cartDataClient.prodData[0].inCart = this.cartDataFront?.data[0]?.numIncart;

            this.cartDataClient.prodData[0].id = prod.id;
            this.cartDataClient.total = this.cartDataFront.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            this.cartData$.next({...this.cartDataFront});
            //spread operator to expands the object and create a copy of the object and sends it
            this.toast.success(`${prod.name} added to the cart`, 'Product Added', {
              timeOut: 1500,
              progressBar: true,
              progressAnimation: 'increasing',
              positionClass: 'toast-top-full-width'
            });
          }else{
            //if cart has items
            // let index = this.cartDataFront.data.findIndex(p => p.product.id === prod.id);
              let index = this.cartDataFront.data.findIndex(p => p.product?.id === prod.id);

              //item is already in the cart...index is positive
              if(index !== -1){
                  if(quantity !== undefined && quantity <= prod.quantity){
                    this.cartDataFront.data[index].numIncart = this.cartDataFront.data[index].numIncart < prod.quantity ? quantity : prod.quantity;
                    //if the number of prod is less than the number of prod in the cart then dispaly the quantity else show the max quantity ==  prod.quantity
                  }else{
                    this.cartDataFront.data[index].numIncart < prod.quantity ? quantity : this.cartDataFront.data[index].numIncart;
                  }
                  this.cartDataClient.prodData[index].inCart = this.cartDataFront?.data[index]?.numIncart;
                  this.calculateTotal();
                  this.cartDataClient.total = this.cartDataFront.total;
                  localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
                  this.toast.info(`${prod.name} quantity updated in the cart`, 'Product Updated', {

                    timeOut: 1500,
                    progressBar: true,
                    progressAnimation: 'increasing',
                    positionClass: 'toast-top-right'
                  });
              }else{
                  //if the item is not in the cart
                  this.cartDataFront.data.push({
                    numIncart: 1,
                    product: prod
                  });
                  this.cartDataClient.prodData.push({
                    inCart: 1,
                    id: prod.id
                  });
                  localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
                  this.toast.success(`${prod.name} added to the cart`, 'Product Added', {
                    timeOut: 1500,
                    progressBar: true,
                    progressAnimation: 'increasing',
                    positionClass: 'toast-top-right'
                  });                    //TODO calculate total amount
                    this.cartDataClient.total = this.cartDataFront.total;
                    localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
                    this.cartData$.next({...this.cartDataFront});
                  } //end of else
          }
      });

}
  updateCartItems(index: number, increase: boolean){
    let data = this.cartDataFront.data[index];
    if(increase){
      // data.numIncart < data.product.quantity ? data.numIncart++ : data.product.quantity;
      this.cartDataClient.prodData[index].inCart = data.numIncart;
       //TODO: Create CalculateTotal function and replace it here
       this.cartDataClient.total = this.cartDataFront.total;
       localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
       this.cartData$.next({...this.cartDataFront});
    }else {
      data.numIncart = data.numIncart--;
      if(data.numIncart < 1){
        //TODO:delete the remaining product from cart
        this.cartData$.next({...this.cartDataFront});
      } else{
        this.cartData$.next({...this.cartDataFront});
        this.cartDataClient.prodData[index].inCart = data.numIncart;
        this.cartDataClient.total = this.cartDataFront.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartData$.next({...this.cartDataFront});
      }
    }
  }
  deleteProductFromCart(index:number){
    if(window.confirm('Are you sure you want to remove the item')){
      this.cartDataFront.data.splice(index, 1);
      this.cartDataClient.prodData.splice(index, 1);
      //TODO: calculate total
      this.cartDataClient.total = this.cartDataFront.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartData$.next({...this.cartDataFront});

      if(this.cartDataClient.total === 0){
        this.cartDataClient = {
          total:0,
          prodData:[{
            inCart: 0,
            id: 0
          }]};
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      } else{
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }
      if(this.cartDataFront.total === 0){
        this.cartDataFront = {
          total: 0,
          data: [{
            numIncart: 0,
            product: undefined,
          }]};
        this.cartData$.next({...this.cartDataFront});
      } else{
        this.cartData$.next({...this.cartDataFront});
      }
    } else {
      //if the iser click cancel button
      return;
    }
  }
  private calculateTotal(){
    let Total = 0;
    this.cartDataFront.data.forEach( p => {
      const {numIncart} = p;
      // const {price} = p.product;

      Total += numIncart * 1;
      this.cartDataFront.total = Total;
      this.cartTotal$.next(this.cartDataFront.total);
    });
  }
  checkoutFromCart(userId: number){

    this.http.post(`${this.serverUrl}/orders/payment`, null).subscribe((res: { success?: Boolean }) => {
      if(res.success){
        this.resetServerData();
        this.http.post(`${this.serverUrl}/orders/new`,{
          userId: userId,
          products: this.cartDataClient.prodData
        }).subscribe((data: any) => {
          this.orderService.getSingleORder(data.order_id).then(prods => {
            if(data.success){
              const navigationExtras : NavigationExtras = {
                state: {
                  message: data.message,
                  products: prods,
                  orderid: data.order_id,
                  total: this.cartDataClient.total
              }
            };
            this.spinner.hide().then();
            this.router.navigate(['/thankyou'], navigationExtras).then( _p => {
              this.cartDataClient = {
                total:0,
                prodData:[{
                  inCart: 0,
                  id: 0
                }]};
                this.cartTotal$.next(0);
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            });
          }
        });
      });
    } else{
      this.spinner.hide().then();
      this.router.navigateByUrl('/checkout').then();
      this.toast.error(`Sorry, failed to book the order`, 'Order Status', {
        timeOut: 1500,
        progressBar: true,
        progressAnimation: 'increasing',
        positionClass: 'toast-top-right'
      });

    }
  });
}
  private resetServerData(){
    this.cartDataFront = {
      total: 0,
      data: [{
        numIncart: 0,
        product: undefined,
      }]
    };
    this.cartData$.next({...this.cartDataFront});
  }
}

interface OrderResponse {
  order_id :number;
  success: boolean;
  message: string;
  products: [{
    id:string;
    numIncart: string;
  }]
}
