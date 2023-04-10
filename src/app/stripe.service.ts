import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private http:HttpClient) { }
  baseURI = 'http://localhost:8000/stripe';

  public retrieveAccountBalance(accountId:String){
    return this.http.get<HttpResponse<any>>(`${this.baseURI}/balance/${accountId}`)
      .pipe(
      map((response:any) => response.data)
    )
  }
  public transferMoney(transfertData:any){
    return this.http.post(`${this.baseURI}/transfert`,transfertData)
  }
}
