import { Express, Request, Response } from "express";
import { LogLevelDesc, IAsyncProvider } from "@hyperledger/cactus-common";
import { IWebServiceEndpoint, IExpressRequestHandler, IEndpointAuthzOptions } from "@hyperledger/cactus-core-api";
import OAS from "../../json/openapi.json";
import { InvokeContractV1Request, InvokeContractV1Response } from "../generated/openapi/typescript-axios";
export interface IInvokeContractEndpointV1Options {
    logLevel?: LogLevelDesc;
    apiUrl?: string;
}
export declare class InvokeContractEndpointV1 implements IWebServiceEndpoint {
    readonly opts: IInvokeContractEndpointV1Options;
    private readonly log;
    private readonly apiUrl?;
    constructor(opts: IInvokeContractEndpointV1Options);
    getAuthorizationOptionsProvider(): IAsyncProvider<IEndpointAuthzOptions>;
    getExpressRequestHandler(): IExpressRequestHandler;
    get oasPath(): (typeof OAS.paths)["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/invoke-contract"];
    getPath(): string;
    getVerbLowerCase(): string;
    getOperationId(): string;
    registerExpress(expressApp: Express): Promise<IWebServiceEndpoint>;
    handleRequest(req: Request, res: Response): Promise<void>;
    callInternalContainer(req: InvokeContractV1Request): Promise<InvokeContractV1Response>;
}
