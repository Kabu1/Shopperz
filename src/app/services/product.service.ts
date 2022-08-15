import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ProductModelServer, ServerResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private SERVER_URL = environment.SERVER_URL
  constructor(
    private router: Router,
    // Communicating with backend services using HTTP
    private http: HttpClient
  ) { }

  //fetch all products from backend
  getAllProducts(productsFetched = 10):Observable<ServerResponse>{
    return this.http.get<ServerResponse>(this.SERVER_URL + '/products', {
      params: {
        limit: productsFetched.toString()
      }
    });

  }
//get a single product from server

  getproduct(id: number): Observable<ProductModelServer>{
    return this.http.get<ProductModelServer>(this.SERVER_URL + '/product' + id)
  }

  //get products from one category
  getProductFromCategory( catName: string): Observable<ProductModelServer[]>{
    return this.http.get<ProductModelServer[]>(this.SERVER_URL + './products/category/' + catName);

  }

}
