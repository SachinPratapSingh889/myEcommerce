import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';


@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean= false;
  userFullName: string='';
  storage: Storage= sessionStorage;

  constructor(private oktaAuthService: OktaAuthStateService , 
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  ngOnInit(): void {
    // Subscribe to authenticate state
    this.oktaAuthService.authState$.subscribe(
      (result)=>{
        this.isAuthenticated= result.isAuthenticated!;
        this.getUserDetails();
      }
    )
  }
  getUserDetails() {
    if (this.isAuthenticated) {
      // Fetch the looged in user
      //
      //user full name is exposeds as a property name
      this.oktaAuth.getUser().then(
        (res)=>{
          this.userFullName=res.name as string;

          //retrive user email from response
          const theEmail= res.email;

          //now store in browser storage
          this.storage.setItem('userEmail',JSON.stringify(theEmail));
        }
      )
    }
  }
  
  logOut(){
    //Terminates the login session and remove current tokens.
    this.oktaAuth.signOut();
  }
}
