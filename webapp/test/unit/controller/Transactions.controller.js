/*global QUnit*/

sap.ui.define([
	"cashflowapp/controller/Transactions.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Transactions Controller");

	QUnit.test("I should test the Transactions controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
