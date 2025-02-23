import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUser } from '../../interface/user.interface';
import { SecureIdService } from '../../services/secure-id.service';
import { isNumber, isPhoneNumber, minLength } from './sign-up.validators';

@Component({
  selector: 'app-sign-up-user',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-up-user.component.html',
  styleUrl: './sign-up-user.component.scss',
})
export class SignUpUserComponent {
  private secureId = inject(SecureIdService);

  phoneRegex = new RegExp(
    /^[\+]\d{1,3}\s?\(?\d{3}\)?\s?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/
  );
  emailRegex = new RegExp(
    /^[a-zA-Z0-9._%+-]+@(?:gmail|mail|yandex)\.(?:com|by|ru)$/
  );

  labelTextInput: string = '';
  labelTextTextarea: string = '';
  firstname: string = '';
  lastname: string = '';
  email: string = '';
  numberPhone: string = '';
  age: string = '';

  form: FormGroup = new FormGroup({
    firstname: new FormControl(this.firstname, [
      Validators.required,
      minLength(),
    ]),
    lastname: new FormControl(this.lastname, [
      Validators.required,
      minLength(),
    ]),
    email: new FormControl(this.email, [
      Validators.required,
      Validators.pattern(this.emailRegex),
      minLength(),
    ]),
    numberPhone: new FormControl(this.numberPhone, [
      Validators.required,
      minLength(),
      isPhoneNumber(),
    ]),
    age: new FormControl(this.age, [
      Validators.required,
      minLength(),
      isNumber(),
    ]),
  });

  get formValue(): IUser {
    return {
      id: this.secureId.getSecureID(),
      firstname: this.form.controls['firstname'].value,
      lastname: this.form.controls['lastname'].value,
      age: this.form.controls['age'].value,
      email: this.form.controls['email'].value,
      numberPhone: this.form.controls['numberPhone'].value,
      balance: 0,
      rules: 'user',
    };
  }

  onSignUp() {
    if (this.form.valid) {
      console.log(this.formValue);
      this.form.reset();
    } else {
      console.log('не валидная');
      return;
    }
  }
}
