import {Component, OnInit} from '@angular/core';
import {StripeService} from "./stripe.service";
import {catchError, EMPTY, forkJoin, switchMap, take} from "rxjs";
import {NgxLoader} from "ngx-http-loader";
import Swal from 'sweetalert2'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{


  title = 'stripe';
  public loader = NgxLoader;
  amount: number = 100
  selectedUser:any
  sender_id:string = ''
  recipient_id:string  =''
  description:string = ''
  sender_card_token:string = ''
  currency:string = "eur"
  userA;
  userB;

  constructor(private stripeService: StripeService) {
    this.userA =  {
      id: 'acct_1Mv9LzFVGy4CB77m',
        name: 'user A',
        balance: 0,
        currency: 'eur'
    }
    this.userB =  {
      id: 'acct_1Mv77SFQ4BP9otIB',
        name: 'userB',
        balance: 0,
        currency:'eur'
    }
  }

  public retrieveUserBalance(userId: string) {
    this.stripeService.retrieveAccountBalance(userId).pipe(take(1)).subscribe(
      (data) => {
        console.log(data)
        switch (userId) {
          case this.userA.id:
            this.userA = {...this.userA, balance: data.available[0].amount,currency:data.available[0].currency}
            break
          case this.userB.id:
            this.userB = {...this.userB, balance: data.available[0].amount,currency:data.available[0].currency}
            break
        }
      }
    )
  }

  public transferMoney(sender_id:string, reciever_id:string) {
    const transfertData = {
      sender_id : sender_id,
      recipient_id:reciever_id,
      description:this.description,
      amount:this.amount,
      sender_card_token:this.sender_card_token,
      currency:this.currency
    }
    this.stripeService.transferMoney(transfertData).pipe(take(1),
      switchMap(data =>
        forkJoin(
          [this.stripeService.retrieveAccountBalance(transfertData.recipient_id)
            , this.stripeService.retrieveAccountBalance(transfertData.sender_id)
          ])),catchError(err=>{
            this.showErrorModal(err)
            return EMPTY
      })).subscribe(balances => {
        console.log(balances)
      switch (transfertData.recipient_id) {
        case this.userA.id:
          this.userA = {...this.userA, balance: balances[0].available[0].amount,currency:balances[0].available[0].currency}
          this.userB = {...this.userB, balance: balances[1].available[0].amount,currency:balances[1].available[0].currency}
          break
        case this.userB.id:
          this.userA = {...this.userA, balance: balances[1].available[0].amount,currency:balances[1].available[0].currency}
          this.userB = {...this.userB, balance: balances[0].available[0].amount,currency:balances[0].available[0].currency}
          break
      }
      this.showSuccessModal('Tranfert Success')
      }

    )
  }

  ngOnInit(): void {
    this.retrieveUserBalance(this.userA.id);
    this.retrieveUserBalance(this.userB.id)
  }

  public showErrorModal(error:any){
    Swal.fire({
      title: 'Error!',
      text: error.error.error,
      icon: 'error',
      confirmButtonText: 'close'
    })
  }

  public showSuccessModal(message:string){
    Swal.fire({
      icon: 'success',
      title: message,
      confirmButtonText: 'close',
    })
  }

}
