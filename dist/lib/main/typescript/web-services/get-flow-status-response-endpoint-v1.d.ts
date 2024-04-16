import { Express, Request, Response } from "express";
import { IWebServiceEndpoint, IExpressRequestHandler, IEndpointAuthzOptions } from "@hyperledger/cactus-core-api";
import { IAsyncProvider, LogLevelDesc } from "@hyperledger/cactus-common";
import { FlowStatusV5Response } from "../generated/openapi/typescript-axios";
import OAS from "../../json/openapi.json";
import { PluginLedgerConnectorCorda } from "../plugin-ledger-connector-corda";
export interface IFlowStatusResponseEndpointV1Options {
    logLevel?: LogLevelDesc;
    apiUrl?: string;
    holdingIDShortHash: string;
    clientRequestID: string;
    connector: PluginLedgerConnectorCorda;
}
export declare class FlowStatusResponseEndpointV1 implements IWebServiceEndpoint {
    readonly options: IFlowStatusResponseEndpointV1Options;
    static readonly CLASS_NAME = "FlowStatusResponseEndpointV1";
    private readonly log;
    private readonly apiUrl?;
    get className(): string;
    constructor(options: IFlowStatusResponseEndpointV1Options);
    getAuthorizationOptionsProvider(): IAsyncProvider<IEndpointAuthzOptions>;
    get oasPath(): (typeof OAS.paths)["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/flow/{holdingIDShortHash}/{clientRequestID}"];
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
    callInternalContainer(req: any): Promise<FlowStatusV5Response>;
}
