import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";

@inject(Router, Service)
export class Edit {
  constructor(router, service) {
    this.router = router;
    this.service = service;
    // this.data = {};
    this.error = {};
    console.log("Edit Constructor : ", this.data);
  }

  async activate(params) {
    var Id = params.Id;
    this.data = await this.service.getById(Id);
  }

  cancelCallback(event) {
    this.router.navigateToRoute("view", { Id: this.data.Id });
  }

  saveCallback(event) {
    console.log("Edit saveButton : ", this.data);
    // debugger;
    this.service
      .update(this.data)
      .then(result => {
        this.router.navigateToRoute("view", { Id: this.data.Id });
      })
      .catch(e => {
        this.error = e;
      });
  }
}
