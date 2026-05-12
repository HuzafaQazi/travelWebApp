import React from "react";

export default function BootstrapDialog() {
  return (
    <>
      <button
        type="button"
        class="btn btn-primary"
        data-toggle="modal"
        data-target="#exampleModalCenter"
      >
        Launch demo modal
      </button>

      <div class="modal-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-4">.col-md-4</div>
            <div class="col-md-4 ml-auto">.col-md-4 .ml-auto</div>
          </div>
          <div class="row">
            <div class="col-md-3 ml-auto">.col-md-3 .ml-auto</div>
            <div class="col-md-2 ml-auto">.col-md-2 .ml-auto</div>
          </div>
          <div class="row">
            <div class="col-md-6 ml-auto">.col-md-6 .ml-auto</div>
          </div>
          <div class="row">
            <div class="col-sm-9">
              Level 1: .col-sm-9
              <div class="row">
                <div class="col-8 col-sm-6">Level 2: .col-8 .col-sm-6</div>
                <div class="col-4 col-sm-6">Level 2: .col-4 .col-sm-6</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
