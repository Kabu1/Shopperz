import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

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
  getAllProducts(productsFetched = 10):Observable<any>{
    return this.http.get(this.SERVER_URL + '/products', {
      params: {
        limit: productsFetched.toString()
      }
    });

  }


}
