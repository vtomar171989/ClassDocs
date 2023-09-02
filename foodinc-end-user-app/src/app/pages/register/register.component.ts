import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  errorMsg: string | undefined;
  loginInProcess: boolean = false;
  
  registerForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    fullName: new FormControl(null, Validators.required),
    image: new FormControl(null),
    contact: new FormControl(0),
  });

  constructor(
    private toast: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  registerUser() {
    if(this.registerForm.invalid) {
      this.toast.info("", "All Fields are required");
      return;
    }

    this.authService.registerUser(this.registerForm.value);
  }

}
