import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  cartItem: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;



  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartDetails();
  }

  listCartDetails() {
    //get a handle to the cart items

    this.cartItem = this.cartService.cartItem

    //subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    )

    //subscibe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    )
    //compute cart total price and quantity
    this.cartService.computeCartTotal();

  }

  incrementQuantity(thisCartItem: CartItem) {
    this.cartService.addToCart(thisCartItem);
  }

  decrementQuantity(thisCartItem: CartItem) {
    this.cartService.decrementItem(thisCartItem);
  }

  removeFromCart(thisCartItem: CartItem) {
    this.cartService.remove(thisCartItem);
  }
}
