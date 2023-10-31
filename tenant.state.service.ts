import { Injectable } from '@angular/core';
import { Tenant } from 'src/app/models/tenant';
import { Module } from 'src/app/models/module';
import { ChildModule } from 'src/app/models/childModule';
import { Tab } from 'src/app/models/tab';
import { Store } from '@ngxs/store';
import { AddTenant, UpdateCurrentTenant, SetCurrentTenant, SetCurrentModule, SetLanguage, SetAlertTypes, SetCurrentChildModule } from 'src/app/store/actions/tenant.actions';
import { TenantState } from 'src/app/store/state/tenant.state';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TenantService } from 'src/app/tenant/tenant.service';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
    providedIn: 'root'
})
export class TenantStateService {
    @SelectSnapshot(TenantState.getCurrentTenant) getCurrentTenant: Tenant;
    @SelectSnapshot(TenantState.getCurrentModuleSnap) getCurrentModuleSnap: Module;
    @SelectSnapshot(TenantState.getCurrentChildModuleSnap) getCurrentChildModuleSnap: ChildModule;
    constructor(
        private tenantService: TenantService,
        private store: Store,
        private authService: AuthService,
        private translate: TranslateService
    ) { }

    public tenantId = '';

    populateStore(data): void {
        // ngxs
        data = this.updateTenantChildModules(data);
        this.addTenants(data);
        this.store.dispatch(new SetCurrentTenant(data[0]));
        this.setAlertTypes(data[0].externalId);
        const currentModule: Module = this.getModule('dashboard');
        this.store.dispatch(new SetCurrentModule(currentModule));
        this.setUserLanguage();
    }

    setUserLanguage() {
        const userProfile = this.authService.getUserProfile();
        if (userProfile && userProfile.language) {
            this.setLanguage(userProfile.language);
        }
    }

    setLanguage(language): void {
        this.store.dispatch(new SetLanguage(language));
        this.translate.use(language);
    }

    setAlertTypes(externalId): void {
        this.store.dispatch(new SetAlertTypes(externalId));
    }

    updateTenantChildModules(tenants) {
        const list = [];
        tenants.forEach(tenant => {
            tenant.modules.forEach(module => {
                if (module.parentRoutePath === '/tenant') {
                    module.childModules.forEach(child => {
                        if (!list.some(item => item.link === tenant.externalId)) {
                            list.push({
                                link: tenant.externalId,
                                name: tenant.name,
                                class: child.class,
                                tabs: child.tabs
                            });
                        }
                    });
                    module.childModules = list;
                }
            });
        });
        return tenants;
    }

    urlToArray(url) {
        let path: [];
        path = url.split('/');
        return path.filter(item => item);
    }

    clearTenantState() {
        if (localStorage.getItem('@@STATE')) {
            localStorage.removeItem('@@STATE');
        }
    }

    storeExists() {
        return localStorage.getItem('@@STATE') !== null;
    }

    getCurrentChildModule(path) {
        const currentModule = this.getModule(path[0]);
        const link = currentModule.name === 'Tenant' ? path[2] : path[1];
        return currentModule.childModules.find(child => child.link === link);
    }

    getModule(type) {
        return this.getCurrentTenant.modules.find(module => module.parentRoutePath === '/' + type);
    }

    async refreshTenantState(tenantId) {
        this.setCurrentTenant(tenantId);
    }

    // this sets the flag isCurrentTenant
    async setCurrentTenant(newExternalId: string) {
        let tenants = await this.tenantService.getData().toPromise();
        tenants = this.updateTenantChildModules(tenants);
        tenants.forEach((tenant) => {
            tenant.isCurrentTenant = tenant.externalId === newExternalId ? true : false;
            this.updateTenant(tenant, tenant.externalId);
        }
        );
    }

    addTenants(tenants: Tenant[]) {
        tenants.forEach((tenant) => this.addTenant(tenant));
    }

    addTenant(tenant: Tenant) {
        this.store.dispatch(new AddTenant(tenant));
    }

    updateTenant(tenant: Tenant, externalId: string) {
        this.store.dispatch(new UpdateCurrentTenant(tenant, externalId));
        if (tenant.isCurrentTenant) {
            this.store.dispatch(new SetCurrentTenant(tenant));
            this.setAlertTypes(externalId);
        }
    }

    setCurrentModule(type) {
        const currentModule: Module = this.getModule(type);
        this.store.dispatch(new SetCurrentModule(currentModule));
    }

    setCurrentChildModule(childModule: any) {
        this.store.dispatch(new SetCurrentChildModule(childModule));
    }

    getChildModule() {
        return this.getCurrentChildModuleSnap;
    }

}
