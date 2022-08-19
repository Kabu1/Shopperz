import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductModelServer, ServerResponse } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

products: ProductModelServer[] = [];



  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.productService.getAllProducts(12).subscribe((prods: ServerResponse) =>{
      this.products = prods.products;
    })
  }

  selectProduct(id: number){
    this.router.navigate(['/products', id])
  }
  addToCart(id: number){
    this.cartService.addProductToCart(id);
  }
}
