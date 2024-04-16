import { Express, Request, Response } from "express";
import { LogLevelDesc, IAsyncProvider } from "@hyperledger/cactus-common";
import { IWebServiceEndpoint, IExpressRequestHandler, IEndpointAuthzOptions } from "@hyperledger/cactus-core-api";
import OAS from "../../json/openapi.json";
import { ListFlowsV1Request, ListFlowsV1Response } from "../generated/openapi/typescript-axios";
import { PluginLedgerConnectorCorda, CordaVersion } from "../plugin-ledger-connector-corda";
export interface IListFlowsEndpointV1Options {
    logLevel?: LogLevelDesc;
    apiUrl?: string;
    cordaVersion?: CordaVersion;
    connector?: PluginLedgerConnectorCorda;
}
export declare class ListFlowsEndpointV1 implements IWebServiceEndpoint {
    readonly options: IListFlowsEndpointV1Options;
    static readonly CLASS_NAME = "ListFlowsEndpointV1";
    private readonly log;
    private readonly apiUrl?;
    get className(): string;
    constructor(options: IListFlowsEndpointV1Options);
    getAuthorizationOptionsProvider(): IAsyncProvider<IEndpointAuthzOptions>;
    getExpressRequestHandler(): IExpressRequestHandler;
    get oasPath(): (typeof OAS.paths)["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/list-flows"];
    getPath(): string;
    getVerbLowerCase(): string;
    getOperationId(): string;
    registerExpress(expressApp: Express): Promise<IWebServiceEndpoint>;
    handleRequest(req: Request, res: Response): Promise<void>;
    callInternalContainer(req: ListFlowsV1Request): Promise<ListFlowsV1Response>;
}
