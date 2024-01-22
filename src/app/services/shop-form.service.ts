import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopFormService {

  private countriesUrl = environment.luv2ShopApiUrl+ '/countries';
  private statesUrl = environment.luv2ShopApiUrl+'/states';

  constructor( private httpClient: HttpClient) { }

  getCountries(): Observable<Country[]>{
    return this.httpClient.get<GetResponseContries>(this.countriesUrl).pipe(
      map(response=> response._embedded.countries)
    );
  }

  getStates(theCountryCode: string): Observable<State[]>{

    //search url
    const searchUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`
    return this.httpClient.get<GetResponseStates>(searchUrl).pipe(
      map(response=> response._embedded.states)
    );
  }
  
  


  getCreditCardMonths(startMonth: number): Observable<number[]> {

    let data: number[] = [];

    //build array for Month dropdown list
    //start at current month and loop until

    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }

    return of(data);
  }



  getCreditCardYears(): Observable<number[]> {

    let data: number[] = [];

    //build array for Year dropdown list
    //start at current year and loop until next 10 years

    const currentYear: number = new Date().getFullYear();
    const endYear: number = currentYear + 10;
    for (let year = currentYear; year <= endYear; year++) {
      data.push(year);
    }

    return of(data);
  }


}

interface GetResponseContries{
  _embedded: {
    countries : Country[];
  }
}
interface GetResponseStates{
  _embedded: {
    states : State[];
  }
}