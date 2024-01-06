import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService } from 'src/app/checkout.service';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { ShopValidators } from 'src/app/validators/shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {


  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardMonth: number[] = [];
  creditCardYears: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, private shopForm: ShopFormService, private cartService: CartService, private checkoutService: CheckoutService, private router: Router) { }


  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, , Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required, ShopValidators.notOnlyWhiteSpace]),
        country: new FormControl('', [Validators.required, ShopValidators.notOnlyWhiteSpace]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(6), ShopValidators.notOnlyWhiteSpace]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required, ShopValidators.notOnlyWhiteSpace]),
        country: new FormControl('', [Validators.required, ShopValidators.notOnlyWhiteSpace]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(6), ShopValidators.notOnlyWhiteSpace]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required, ShopValidators.notOnlyWhiteSpace]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{16}$'), ShopValidators.notOnlyWhiteSpace]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{3}$'), ShopValidators.notOnlyWhiteSpace]),
        expirationMonth: new FormControl(''),
        expirationYear: new FormControl(''),
      })
    })

    //populate credit card month

    const startMonth: number = new Date().getMonth() + 1;
    console.log(startMonth);

    this.shopForm.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months:" + JSON.stringify(data));
        this.creditCardMonth = data;
      }
    )

    //populate credit card years
    this.shopForm.getCreditCardYears().subscribe(
      data => {
        console.log("Retrived credit card months:" + JSON.stringify(data));
        this.creditCardYears = data;
      }
    )


    //populate the countries
    this.shopForm.getCountries().subscribe(
      data => {
        console.log("Retrived countries:" + JSON.stringify(data));
        this.countries = data;
      }
    );


    this.reviewCardDetails();
  }
  onSubmit() {
    console.log(`Purchasing the items`);
    console.log(this.checkoutFormGroup.get('customer').value)
   // console.log(this.checkoutFormGroup.get('shippingAddress').value.country)
    //console.log(this.checkoutFormGroup.get('shippingAddress').value.state)
  console.log(this.checkoutFormGroup);
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //set up order
    let order = new Order();
    order.totalPrice= this.totalPrice;
    order.totalQuantity= this.totalQuantity;

    //get card item
    const cartItems= this.cartService.cartItem;

    //create order items from cart items
      //1 . long way
      // let orderItems : OrderItem[] = [];
      // for(let i=0; i<cartItems.length; i++){
      //   orderItems[i]= new OrderItem(cartItems[i]);
      // }
      //2. Short way
      let orderItems : OrderItem[]= cartItems.map(temCartItem => new OrderItem(temCartItem));

    //setup purchase
    let purchase = new Purchase();


    //populate purchase - customer
    purchase.customer= this.checkoutFormGroup.controls['customer'].value;

    
    //populate purchase - shipping add
    purchase.shippingAddress= this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state= shippingState.name;
    purchase.shippingAddress.country= shippingCountry.name;

    //populate purchase - billing addre

    purchase.billingAddress= this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state= billingState.name;
    purchase.billingAddress.country= billingCountry.name;

    //populate purchase- order and order items
    purchase.order= order;
    purchase.orderItems= orderItems;

    // call rest api via the checkout service
    this.checkoutService.placeOrder(purchase).subscribe({
      next: response =>{
           console.log(`Order received`);
            alert(`Your order has been placed.\nOrder tracking number: ${response.orderTrackingNumber}`)
            
            // reset cart
            this.resetCart();
      },
      error: err =>{
        alert(`There was an error: ${err.message}`);
      }
    })
  }
  resetCart() {
     // reset card data
     this.cartService.cartItem=[];
     this.cartService.totalPrice.next(0);
     this.cartService.totalQuantity.next(0);

     //reset the form
    this.checkoutFormGroup.reset();


     //navigate back to the products page
     this.router.navigateByUrl("/products");
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  get shippingState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get billingState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get cardCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get cardCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get cardCardName() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get cardCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      //bug fix for states
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      //bug fix for states
      this.billingAddressStates = []
    }

  }

  //updateMonthsandYears if any other selected rather than current year 

  updateMonthsandYears() {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.shopForm.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months:" + JSON.stringify(data));
        this.creditCardMonth = data;
      }
    )
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;
    this.shopForm.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
          console.log(this.shippingAddressStates);
        }
        else {
          this.billingAddressStates = data;
          console.log(this.billingAddressStates);

        }

        //select first item by default
        formGroup.get('state').setValue(data[0]);
      }
    );
  }

  reviewCardDetails() {
    //subscribe to cartservice.totalquantity
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    )

    //subscibe to cartservice.totalprice
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    )
  }

}
