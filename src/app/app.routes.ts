import {ModuleWithProviders} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {PageNotFoundComponent} from "./home/page-not-found/page-not-found.component";
import {LandingpageComponent} from "./home/landingpage/landingpage.component";
import {UserGuard} from "./core/guards/user.guard";
import {VerifiedAndKycGuard} from "./core/guards/verifiedAndKyc.guard";
import {AuthGuard} from "./core/guards/auth.guard";

const appRoutes: Routes = [
    {path: '', component: LandingpageComponent},
    {path: 'registration', loadChildren: 'app/registration/registration.module#RegistrationModule'},
    {path: 'calculator', loadChildren: 'app/calculators/calculator.module#CalculatorModule'},
    {path: 'explore', loadChildren: 'app/explore-funds/explore-funds.module#ExploreFundsModule'},
    {path: 'dashboard', loadChildren: 'app/dashboard/dashboard.module#DashboardModule'},
    {path: 'static', loadChildren: 'app/static/static.module#StaticModule'},
    {
        path: 'report',
        loadChildren: 'app/report/report.module#ReportModule',
        canActivate: [AuthGuard, VerifiedAndKycGuard]
    },
    {
        path: 'checkout',
        loadChildren: 'app/checkout/checkout.module#CheckoutModule',
        canActivate: [UserGuard]
    },
    {
        path: 'redeem',
        loadChildren: 'app/redemption/redemption.module#RedemptionModule',
        canActivate: [UserGuard]
    },
    {
        path: 'salary-sweep',
        loadChildren: 'app/salary-sweep/salary-sweep.module#SalarySweepModule',
        canActivate: [AuthGuard, VerifiedAndKycGuard]
    },
    {path: 'solutions', loadChildren: 'app/solutions/solutions.module#SolutionsModule'},
    {path: 'cart', loadChildren: 'app/cart/cart.module#CartModule'},
    {path: 'user', loadChildren: 'app/user/user.module#UserModule'},
    {path: 'auth', loadChildren: 'app/login/login.module#LoginModule'},
    //{path: 'products', loadChildren: 'app/product/product.module#ProductModule'},
    {path: '**', component: PageNotFoundComponent}
];

export const routes: ModuleWithProviders = RouterModule.forRoot(appRoutes);

export const appRoutingProviders: any[] = [];

export const routedComponents = [PageNotFoundComponent];
