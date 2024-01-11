import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  //compute the cart total price and total quantity

  cartItem: CartItem[] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);
  //always remember session storage don't persist data when browser closed or refresed it only persist data when tab refreshed., for browser storage user localStorage rather than session storage for this data ill be avilable when brower closed /open (refreshed)
  //storage: Storage =sessionStorage;
  storage: Storage = localStorage;
  // you can see this info in dev tools -> application -> local storage

  constructor() {
    //read data from storage
    let data = JSON.parse(this.storage.getItem('cartItem'));
    //json.parse converts string to object(api only works with strings the keys and the values )

    if (data != null) {
      this.cartItem = data;

      //compute totals based on the data that is read from stroage
      this.computeCartTotal();
    }
  }

  addToCart(theCartItem: CartItem) {
    //check if we aleary  have the item in our cart

    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if (this.cartItem.length > 0) {
      //find the item in the cart based on item id
      for (let tempCartItem of this.cartItem) {
        if (tempCartItem.id == theCartItem.id) {
          existingCartItem = tempCartItem;

          break;
        }
      }
    }
    //Or we can use below code instead of complete for loop
    //existingCartItem= this.cartItem.find(tempCartItem => tempCartItem.id === theCartItem.id)
    // check if we found it
    alreadyExistsInCart = existingCartItem != undefined;

    if (alreadyExistsInCart) {
      existingCartItem.quantity++;
    } else {
      this.cartItem.push(theCartItem);
    }

    //compute the cart total price and total quantity
    this.computeCartTotal();
  }
  computeCartTotal() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartIem of this.cartItem) {
      totalPriceValue += currentCartIem.quantity * currentCartIem.unitPrice;
      totalQuantityValue += currentCartIem.quantity;
    }

    //publish the new valuews .. all suvscibers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log cart data just for debugging perpose
    this.logCartData(totalPriceValue, totalQuantityValue);

    //persist cart data
    this.persistCartItems();
  }

  persistCartItems() {
    this.storage.setItem('cartItem', JSON.stringify(this.cartItem));
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    //contents of the cart
    for (let tempCartItem of this.cartItem) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(
        `name: ${tempCartItem.name} , quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`
      );
    }
    console.log(
      `totalprice=${totalPriceValue.toFixed(
        2
      )} , totalQuantity: ${totalQuantityValue}`
    );
    console.log('.............');
  }

  decrementItem(thisCartItem: CartItem) {
    thisCartItem.quantity--;
    if (thisCartItem.quantity === 0) {
      this.remove(thisCartItem);
    } else {
      this.computeCartTotal();
    }
  }
  remove(thisCartItem: CartItem) {
    // get index of item in th earray

    const itemIndex = this.cartItem.findIndex(
      (tempCartItem) => tempCartItem.id === thisCartItem.id
    );

    //if found, remove the item from the array of the given index

    if (itemIndex > -1) {
      this.cartItem.splice(itemIndex, 1);
      this.computeCartTotal();
    }
  }
}
