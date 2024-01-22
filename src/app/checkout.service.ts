import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from './common/purchase';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private purchaseUrl = environment.luv2ShopApiUrl+ '/checkout/purchase';
  constructor(private httpClient: HttpClient) { }

  placeOrder(purchase: Purchase): Observable<any>{
    console.log("placeorder");
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);
  }
}
