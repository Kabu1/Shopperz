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
  private serverUrl = environment.SERVER_URL
  constructor(
    private router: Router,
    // Communicating with backend services using HTTP
    private http: HttpClient
  ) { }

  //fetch all products from backend
  getAllProducts(productsFetched = 10):Observable<ServerResponse>{
    return this.http.get<ServerResponse>(this.serverUrl + '/products', {
      params: {
        limit: productsFetched.toString()
      }
    });

  }
//get a single product from server

  getProduct(id: number): Observable<ProductModelServer>{
    return this.http.get<ProductModelServer>(this.serverUrl + '/products/' + id)
  }

  //get products from one category
  getProductFromCategory( catName: string): Observable<ProductModelServer[]>{
    return this.http.get<ProductModelServer[]>(this.serverUrl + './products/category/' + catName);

  }

}
