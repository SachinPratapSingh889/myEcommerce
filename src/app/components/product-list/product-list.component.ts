import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCatagoryId: number = 1;
  previousCategoryId: number = 1;

  searchMode: boolean = false;

  //properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  thePreviousKeyword: string = '';

  constructor(
    private productService: ProductService,
    private router: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.router.paramMap.subscribe(() => {
      this.listProducts();
    });
  }
  listProducts() {
    this.searchMode = this.router.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  handleSearchProducts() {
    const theKeyword: string = this.router.snapshot.paramMap.get('keyword')!;

    if (this.thePreviousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    this.thePreviousKeyword = theKeyword;

    console.log(
      `theKeyword=${theKeyword}, thepagenumber=${this.thePageNumber}`
    );

    this.productService
      .searchProductListPaginate(
        this.thePageNumber - 1,
        this.thePageSize,
        theKeyword
      )
      .subscribe(this.processResult());
  }
  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  handleListProducts() {
    //check if id parameter is avilable
    const hasCatagoryId: boolean = this.router.snapshot.paramMap.has('id');

    if (hasCatagoryId) {
      //get the id param string. convert is to number using + sign
      this.currentCatagoryId = +this.router.snapshot.paramMap.get('id')!;
    } else {
      //not catagory id avilable .......default to catagory id 1
    }

    //check if we have a diff category thant the prev one
    //Note: angular will reuse a component if it is currently being used

    // if we have a diff category id then prev then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCatagoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCatagoryId;
    console.log(
      `currentCategoryId=${this.currentCatagoryId}, thePageNumber=${this.thePageNumber}`
    );

    //now get the product for given catagory id
    this.productService
      .getProductListPaginate(
        this.thePageNumber - 1,
        this.thePageSize,
        this.currentCatagoryId
      )
      .subscribe(this.processResult());
  }
  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  addToCart(theProduct: Product) {
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    const theCartItem= new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }
}
