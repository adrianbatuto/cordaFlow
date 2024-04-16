import { Express, Request, Response } from "express";
import { IWebServiceEndpoint, IExpressRequestHandler, IEndpointAuthzOptions } from "@hyperledger/cactus-core-api";
import { IAsyncProvider, LogLevelDesc } from "@hyperledger/cactus-common";
import OAS from "../../json/openapi.json";
import { PluginLedgerConnectorCorda } from "../plugin-ledger-connector-corda";
export interface IListCPIEndpointV1Options {
    logLevel?: LogLevelDesc;
    apiUrl?: string;
    connector: PluginLedgerConnectorCorda;
}
export declare class ListCPIEndpointV1 implements IWebServiceEndpoint {
    readonly options: IListCPIEndpointV1Options;
    static readonly CLASS_NAME = "ListCPIEndpointV1";
    private readonly log;
    private readonly apiUrl?;
    get className(): string;
    constructor(options: IListCPIEndpointV1Options);
    getAuthorizationOptionsProvider(): IAsyncProvider<IEndpointAuthzOptions>;
    get oasPath(): (typeof OAS.paths)["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/listCPI"];
    /**
     * Returns the endpoint path to be used when installing the endpoint into the
     * API server of Cactus.
     */
    getPath(): string;
    getVerbLowerCase(): string;
    getOperationId(): string;
    getExpressRequestHandler(): IExpressRequestHandler;
    registerExpress(expressApp: Express): Promise<IWebServiceEndpoint>;
    handleRequest(req: Request, res: Response): Promise<void>;
}
