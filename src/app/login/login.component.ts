import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { User } from '../_models';
import { UserService } from '../_services';
import { AlertService, AuthenticationService } from '../_services';
import { interval, Subscription } from 'rxjs';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: [ 'login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    currentUser:string;
    users: User[] = [];
    subscription: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private userService: UserService) {
            this.loadAllUsers();
            const source = interval(10000000);
            this.subscription = source.subscribe(val => this.loadAllUsers());
        }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    loadAllUsers() {
        this.userService.getAll().pipe(first()).subscribe(users => { 
            this.users = users; 
        });
    }
    
    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
    GetFirstLetter(name:string):string{
        return name.charAt(0).toUpperCase();
    }

    getRandomColor(index:number) {

        var colnum = (index/10)*0.165;
        var color = Math.floor(0x1000000 *  colnum).toString(16);
        return '#' + ('000000' + color).slice(-6);
    }
    ngOnDestroy() {
        this.subscription && this.subscription.unsubscribe();
    }
}
