import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = environment.luv2ShopApiUrl+'/products';

  private categoryUrl = environment.luv2ShopApiUrl+'/product-category';
  constructor(private httpclient: HttpClient) {}

  getProductList(theCatagoryId: number): Observable<Product[]> {
    //Building URL based on catagory id
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCatagoryId}`;

    return this.getProducts(searchUrl);
  }

  getProductListPaginate(
    thePage: number,
    thePageSize: number,
    theCatagoryId: number
  ): Observable<GetResponseProducts> {
    //Building URL based on catagory id
    const searchUrl =
      `${this.baseUrl}/search/findByCategoryId?id=${theCatagoryId}` +
      `&page=${thePage}&size=${thePageSize}`;

    return this.httpclient.get<GetResponseProducts>(searchUrl);
  }

  searchProducts(keyword: string): Observable<Product[]> {
    //Building URL based on keyword

    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;

    return this.getProducts(searchUrl);
  }

  searchProductListPaginate(
    thePage: number,
    thePageSize: number,
    theKeyword: string
  ): Observable<GetResponseProducts> {
    //Building URL based on name
    const searchUrl =
      `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}` +
      `&page=${thePage}&size=${thePageSize}`;

    return this.httpclient.get<GetResponseProducts>(searchUrl);
  }

  getProducts(searchUrl: string) {
    return this.httpclient
      .get<GetResponseProducts>(searchUrl)
      .pipe(map((response) => response._embedded.products));
  }

  getSingleProduct(theProductId: number): Observable<Product> {
    //need to build url based on product id
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpclient.get<Product>(productUrl);
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpclient
      .get<GetResponseProductsCategory>(this.categoryUrl)
      .pipe(map((response) => response._embedded.productCategory));
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface GetResponseProductsCategory {
  _embedded: {
    productCategory: ProductCategory[];
  };
}
