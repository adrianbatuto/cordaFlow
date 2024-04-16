import { Observable } from "rxjs";
import { LogLevelDesc } from "@hyperledger/cactus-common";
import { ISocketApiClient } from "@hyperledger/cactus-core-api";
import { DefaultApi, GetMonitorTransactionsV1ResponseTxInner } from "../generated/openapi/typescript-axios";
import { Configuration } from "../generated/openapi/typescript-axios/configuration";
type CordaBlock = GetMonitorTransactionsV1ResponseTxInner;
/**
 * Options for CordaApiClient.watchBlocksV1  method.
 */
export type watchBlocksV1Options = {
    readonly stateFullClassName: string;
    readonly clientAppId: string;
    readonly pollRate?: number;
};
export declare class CordaApiClientOptions extends Configuration {
    readonly logLevel?: LogLevelDesc;
}
/**
 * ApiClient to call remote Corda connector.
 */
export declare class CordaApiClient extends DefaultApi implements ISocketApiClient<CordaBlock> {
    readonly options: CordaApiClientOptions;
    static readonly CLASS_NAME = "CordaApiClient";
    private readonly log;
    get className(): string;
    constructor(options: CordaApiClientOptions);
    /**
     * Send low-level HTTP API startMonitorV1 to the connector to start monitoring queue for specified client.
     * Errors are pushed to RxJs subject.
     *
     * @param subject RxJs subject associated with this monitoring request.
     * @param clientAppId Client application ID to identify monitoring queue on the connector.
     * @param stateName Corda state to monitor.
     */
    private sendStartMonitorRequest;
    /**
     * Function to perform single request to read and confirm retrieval of transactions from the connector.
     * Should be executed periodically (i.e. connector should be polled for new transactions).
     * New transactions are pushed into the subject.
     *
     * @param subject RxJs subject associated with this monitoring request.
     * @param clientAppId Client application ID to identify monitoring queue on the connector.
     * @param stateName Corda state to monitor.
     */
    private pollTransactionsLogin;
    /**
     * Should be called to stop monitoring on the connector.
     * Calling this will remove all pending transactions (that were not read yet)!
     *
     * @param monitor Monitoring interval set with `setTimeout`.
     * @param clientAppId Client application ID to identify monitoring queue on the connector.
     * @param stateName Corda state to monitor.
     */
    private finalizeMonitoring;
    /**
     * Watch new transactions (state changes) on the corda ledger.
     *
     * @param options.stateFullClassName Corda state to monitor
     * @param options.clientAppId Calling app ID. Each monitoring queue on the connector is associated with a client ID.
     * @param options.pollRate How often poll the connector for new transactions. Defaults to 5s
     *
     * @returns RxJS observable of transactions.
     */
    watchBlocksAsyncV1(options: watchBlocksV1Options): Promise<Observable<CordaBlock>>;
}
export {};
