import { ProductModelServer } from "./product.model";

export interface CartModelServer {
  //
  total: number;
  data: [{
    product?: ProductModelServer,
    numIncart: number
  }]
}

export interface CartModelPublic {
  //reference to local storage
  //everything sent to the client
  total: number;
  prodData: [{
    id: number,
    inCart: number
  }];
}
