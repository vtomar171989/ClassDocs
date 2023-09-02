import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorMsg: string | undefined;
  loginInProcess: boolean = false;

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required])
  })
  
  constructor(
    private authService: AuthService,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
  }

  loginUser = () => {
    if(this.loginForm.invalid) {
      this.toast.info("All Field Required", "");
      return;
    }
    this.authService.loginUser(this.loginForm.value);
  }
}
