import { Component, OnInit } from '@angular/core';
import { OrderHistory } from 'src/app/common/order-history';
import { OrderHistoryServiceService } from 'src/app/service/order-history-service.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {

  storage: Storage = sessionStorage;
  orderHistoryList: OrderHistory[]=[];
  constructor(private orderHistoryServie: OrderHistoryServiceService) { }

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  handleOrderHistory() {
   //read the user email address from browser storage
   const email = JSON.parse(this.storage.getItem('userEmail')!) 

   //retrive data from service
   this.orderHistoryServie.getOrderHistory(email).subscribe(
    data=>{
      this.orderHistoryList= data._embedded.orders;
    }
   )
  }

}
