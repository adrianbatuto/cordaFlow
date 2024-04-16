"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CordaApiClientOptions = exports.CordaApiClient = exports.createPluginFactory = exports.DeployContractJarsEndpoint = exports.PluginFactoryLedgerConnector = exports.CordaVersion = exports.PluginLedgerConnectorCorda = void 0;
var plugin_ledger_connector_corda_1 = require("./plugin-ledger-connector-corda");
Object.defineProperty(exports, "PluginLedgerConnectorCorda", { enumerable: true, get: function () { return plugin_ledger_connector_corda_1.PluginLedgerConnectorCorda; } });
Object.defineProperty(exports, "CordaVersion", { enumerable: true, get: function () { return plugin_ledger_connector_corda_1.CordaVersion; } });
__exportStar(require("./generated/openapi/typescript-axios/index"), exports);
var plugin_factory_ledger_connector_1 = require("./plugin-factory-ledger-connector");
Object.defineProperty(exports, "PluginFactoryLedgerConnector", { enumerable: true, get: function () { return plugin_factory_ledger_connector_1.PluginFactoryLedgerConnector; } });
var deploy_contract_jars_endpoint_1 = require("./web-services/deploy-contract-jars-endpoint");
Object.defineProperty(exports, "DeployContractJarsEndpoint", { enumerable: true, get: function () { return deploy_contract_jars_endpoint_1.DeployContractJarsEndpoint; } });
const plugin_factory_ledger_connector_2 = require("./plugin-factory-ledger-connector");
async function createPluginFactory(pluginFactoryOptions) {
    return new plugin_factory_ledger_connector_2.PluginFactoryLedgerConnector(pluginFactoryOptions);
}
exports.createPluginFactory = createPluginFactory;
var corda_api_client_1 = require("./api-client/corda-api-client");
Object.defineProperty(exports, "CordaApiClient", { enumerable: true, get: function () { return corda_api_client_1.CordaApiClient; } });
Object.defineProperty(exports, "CordaApiClientOptions", { enumerable: true, get: function () { return corda_api_client_1.CordaApiClientOptions; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvcHVibGljLWFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlGQUl5QztBQUh2QywySUFBQSwwQkFBMEIsT0FBQTtBQUUxQiw2SEFBQSxZQUFZLE9BQUE7QUFHZCw2RUFBMkQ7QUFFM0QscUZBQWlGO0FBQXhFLCtJQUFBLDRCQUE0QixPQUFBO0FBRXJDLDhGQUdzRDtBQUZwRCwySUFBQSwwQkFBMEIsT0FBQTtBQUs1Qix1RkFBaUY7QUFFMUUsS0FBSyxVQUFVLG1CQUFtQixDQUN2QyxvQkFBMkM7SUFFM0MsT0FBTyxJQUFJLDhEQUE0QixDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUpELGtEQUlDO0FBRUQsa0VBSXVDO0FBSHJDLGtIQUFBLGNBQWMsT0FBQTtBQUNkLHlIQUFBLHFCQUFxQixPQUFBIn0=