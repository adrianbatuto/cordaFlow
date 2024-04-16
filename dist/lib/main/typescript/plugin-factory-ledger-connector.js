"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginFactoryLedgerConnector = void 0;
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const plugin_ledger_connector_corda_1 = require("./plugin-ledger-connector-corda");
class PluginFactoryLedgerConnector extends cactus_core_api_1.PluginFactory {
    async create(options) {
        return new plugin_ledger_connector_corda_1.PluginLedgerConnectorCorda(options);
    }
}
exports.PluginFactoryLedgerConnector = PluginFactoryLedgerConnector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLWZhY3RvcnktbGVkZ2VyLWNvbm5lY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvcGx1Z2luLWZhY3RvcnktbGVkZ2VyLWNvbm5lY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrRUFHc0M7QUFFdEMsbUZBR3lDO0FBRXpDLE1BQWEsNEJBQTZCLFNBQVEsK0JBSWpEO0lBQ0MsS0FBSyxDQUFDLE1BQU0sQ0FDVixPQUEyQztRQUUzQyxPQUFPLElBQUksMERBQTBCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztDQUNGO0FBVkQsb0VBVUMifQ==