import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BaseUrls } from 'src/app/base-urls';
import { Users } from 'src/app/models/users';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  updation: boolean = false;
  loader: boolean = false;
  user: Users = JSON.parse(localStorage.getItem('user') || '{}');
  userAddress: any[] = [];

  userForm: FormGroup = new FormGroup({
    userId: new FormControl(this.user.userId),
    email: new FormControl(this.user.email),
    password: new FormControl(this.user.password),
    fullName: new FormControl(this.user.fullName),
    image: new FormControl(this.user.image),
    contact: new FormControl(this.user.contact)
  });

  userAddressForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private toast: ToastrService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.httpClient.get<{data: any[]}>(`${BaseUrls.getUrl(BaseUrls.USER_ADDRESS_GROUPURL)}/${this.user.userId}/addresses`)
      .subscribe({
        next: ({ data }) => {
          this.userAddress = data;
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

  openAddressModal(modalRef: any, addressModel: any = null) {
    this.modalService.open(modalRef, { size: 'lg' });
    this.initializeForm(addressModel);
  }

  initializeForm(addressModel: any) {
    if(addressModel === null) {
      this.updation = false;
      this.userAddressForm = this.fb.group({
        addressId: [null],
        userId: [this.user.userId],
        street: [null],
        city: [null],
        state: [null],
        country: [null],
        pincode: [0],
        addressTag: [0]
      });
    } else {
      this.updation = true;
      this.userAddressForm = this.fb.group({
        addressId: [addressModel.addressId],
        userId: [addressModel.userId],
        street: [addressModel.street],
        city: [addressModel.city],
        state: [addressModel.state],
        country: [addressModel.country],
        pincode: [addressModel.pincode],
        addressTag: [0]
      });
    }
  }

  saveRestaurant() {
    this.loader = true;
    let values = { ...this.userAddressForm.value };
    
    let formData = new FormData();
    Object.entries(values).forEach(([key, value]: [string, any], idx: number) => formData.append(key, value))
    
    if(!this.updation) {
      this.httpClient.post<{ data: any[] }>(BaseUrls.getAddUrl(BaseUrls.USER_ADDRESS_GROUPURL), formData)
      .subscribe({
        next: ({ data }) => {
          this.loader = false;
          this.userAddress.push(data[0]);
          this.toast.success("User Address Added", "Success");
          this.modalService.dismissAll();
        },
        error: (error) => {
          console.log(error);
          
          this.loader = false;
          this.toast.warning("Something went wrong!!", "Failed")
        }
      })
    } else {
      this.httpClient.post<{ data: any[] }>(BaseUrls.getUpdateUrl(BaseUrls.USER_ADDRESS_GROUPURL), formData)
      .subscribe({
        next: ({ data }) => {
          this.loader = false;
          this.userAddress[this.userAddress.findIndex(x => x.addressId === data[0].addressId)] = { ...data[0] }
          this.toast.success("User Address Updated", "Success");
          this.modalService.dismissAll();
        },
        error: (error) => {
          console.log(error);
          
          this.loader = false;
          this.toast.warning("Something went wrong!!", "Failed")
        }
      })
    } 
  }

  deleteUserAddress(addressId: number, idx) {
    this.httpClient.get<{ data: any[] }>(`${BaseUrls.getDeleteUrl(BaseUrls.USER_ADDRESS_GROUPURL)}/${addressId}`)
      .subscribe({
        next: ({ data }) => {
          this.loader = false;
          this.userAddress.splice(idx, 1)
          this.toast.success("User Address Updated", "Success");
          this.modalService.dismissAll();
        },
        error: (error) => {
          console.log(error);
          
          this.loader = false;
          this.toast.warning("Something went wrong!!", "Failed")
        }
      })
  }

  updateProfile() {
    this.loader = true;
    let formData: FormData = new FormData();
    Object.entries(this.userForm.value).forEach(([key, value]: [string, any], idx: number) => {
      formData.append(key, value);
    });

    this.httpClient.post(BaseUrls.getUpdateUrl(BaseUrls.USER_GROUPURL), formData)
      .subscribe({
        next: ({ code, message, data }: any) => {
          this.loader = false;
          localStorage.setItem("user", JSON.stringify(data[0]));
          this.toast.success("Profile Updated", "Success")
        },
        error: (error) => {
          // console.log(error);
          this.toast.warning("Something Went Wrong!! Please Again...", "Failed");
          this.loader = false;
        },
      })
  }
}
