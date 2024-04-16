import { IPluginFactoryOptions, PluginFactory } from "@hyperledger/cactus-core-api";
import { IPluginLedgerConnectorCordaOptions, PluginLedgerConnectorCorda } from "./plugin-ledger-connector-corda";
export declare class PluginFactoryLedgerConnector extends PluginFactory<PluginLedgerConnectorCorda, IPluginLedgerConnectorCordaOptions, IPluginFactoryOptions> {
    create(options: IPluginLedgerConnectorCordaOptions): Promise<PluginLedgerConnectorCorda>;
}
