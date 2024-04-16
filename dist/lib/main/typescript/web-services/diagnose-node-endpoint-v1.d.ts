import { Express, Request, Response } from "express";
import { LogLevelDesc, IAsyncProvider } from "@hyperledger/cactus-common";
import { IWebServiceEndpoint, IExpressRequestHandler, IEndpointAuthzOptions } from "@hyperledger/cactus-core-api";
import OAS from "../../json/openapi.json";
import { DiagnoseNodeV1Request, DiagnoseNodeV1Response } from "../generated/openapi/typescript-axios";
import { PluginLedgerConnectorCorda, CordaVersion } from "../plugin-ledger-connector-corda";
export interface IDiagnoseNodeEndpointV1Options {
    logLevel?: LogLevelDesc;
    apiUrl?: string;
    cordaVersion?: CordaVersion;
    connector?: PluginLedgerConnectorCorda;
}
export declare class DiagnoseNodeEndpointV1 implements IWebServiceEndpoint {
    readonly opts: IDiagnoseNodeEndpointV1Options;
    private readonly log;
    private readonly apiUrl?;
    constructor(opts: IDiagnoseNodeEndpointV1Options);
    getAuthorizationOptionsProvider(): IAsyncProvider<IEndpointAuthzOptions>;
    getExpressRequestHandler(): IExpressRequestHandler;
    get oasPath(): (typeof OAS.paths)["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/diagnose-node"];
    getPath(): string;
    getVerbLowerCase(): string;
    getOperationId(): string;
    registerExpress(expressApp: Express): Promise<IWebServiceEndpoint>;
    handleRequest(req: Request, res: Response): Promise<void>;
    callInternalContainer(req: DiagnoseNodeV1Request): Promise<DiagnoseNodeV1Response>;
}
