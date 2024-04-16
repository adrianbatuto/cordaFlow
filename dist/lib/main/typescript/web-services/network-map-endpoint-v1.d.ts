import { Express, Request, Response } from "express";
import { LogLevelDesc, IAsyncProvider } from "@hyperledger/cactus-common";
import { IWebServiceEndpoint, IExpressRequestHandler, IEndpointAuthzOptions } from "@hyperledger/cactus-core-api";
import OAS from "../../json/openapi.json";
import { NodeInfo } from "../generated/openapi/typescript-axios";
import { PluginLedgerConnectorCorda, CordaVersion } from "../plugin-ledger-connector-corda";
export interface INetworkMapEndpointV1Options {
    logLevel?: LogLevelDesc;
    apiUrl?: string;
    cordaVersion?: CordaVersion;
    connector?: PluginLedgerConnectorCorda;
}
export declare class NetworkMapEndpointV1 implements IWebServiceEndpoint {
    readonly opts: INetworkMapEndpointV1Options;
    private readonly log;
    private readonly apiUrl?;
    constructor(opts: INetworkMapEndpointV1Options);
    getAuthorizationOptionsProvider(): IAsyncProvider<IEndpointAuthzOptions>;
    getExpressRequestHandler(): IExpressRequestHandler;
    get oasPath(): (typeof OAS.paths)["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/network-map"];
    getPath(): string;
    getVerbLowerCase(): string;
    getOperationId(): string;
    registerExpress(expressApp: Express): Promise<IWebServiceEndpoint>;
    handleRequest(req: Request, res: Response): Promise<void>;
    callInternalContainer(): Promise<NodeInfo[]>;
}
