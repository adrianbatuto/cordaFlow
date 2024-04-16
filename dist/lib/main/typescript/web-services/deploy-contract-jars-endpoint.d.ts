import { Express, Request, Response } from "express";
import { Config as SshConfig } from "node-ssh";
import { IWebServiceEndpoint, IExpressRequestHandler } from "@hyperledger/cactus-core-api";
import { AuthorizationOptionsProvider } from "@hyperledger/cactus-core";
import { IAsyncProvider, LogLevelDesc } from "@hyperledger/cactus-common";
import { IEndpointAuthzOptions } from "@hyperledger/cactus-core-api";
import { DeployContractJarsSuccessV1Response, DeployContractJarsV1Request } from "../generated/openapi/typescript-axios/api";
import OAS from "../../json/openapi.json";
export interface IDeployContractEndpointOptions {
    logLevel?: LogLevelDesc;
    sshConfigAdminShell: SshConfig;
    corDappsDir: string;
    cordaStartCmd?: string;
    cordaStopCmd?: string;
    authorizationOptionsProvider?: AuthorizationOptionsProvider;
    apiUrl?: string;
}
export declare class DeployContractJarsEndpoint implements IWebServiceEndpoint {
    readonly options: IDeployContractEndpointOptions;
    static readonly CLASS_NAME = "DeployContractJarsEndpoint";
    private readonly log;
    private readonly authorizationOptionsProvider;
    private readonly apiUrl?;
    get className(): string;
    constructor(options: IDeployContractEndpointOptions);
    getAuthorizationOptionsProvider(): IAsyncProvider<IEndpointAuthzOptions>;
    get oasPath(): (typeof OAS.paths)["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/deploy-contract-jars"];
    /**
     * Returns the `operationId` that connects this endpoint to it's definition in
     * the openapi-spec.ts file.
     */
    get operationId(): string;
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
    callInternalContainer(req: DeployContractJarsV1Request): Promise<DeployContractJarsSuccessV1Response>;
}
