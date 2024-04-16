import { Config as SshConfig } from "node-ssh";
import { Express } from "express";
import { CPIV5Response, StartFlowV5Request, FlowStatusV5Response } from "./generated/openapi/typescript-axios";
import { IPluginLedgerConnector, IWebServiceEndpoint, IPluginWebService, ICactusPluginOptions, ConsensusAlgorithmFamily } from "@hyperledger/cactus-core-api";
import { LogLevelDesc } from "@hyperledger/cactus-common";
import { PrometheusExporter } from "./prometheus-exporter/prometheus-exporter";
export declare enum CordaVersion {
    CORDA_V4X = "CORDA_V4X",
    CORDA_V5 = "CORDA_V5"
}
export interface IPluginLedgerConnectorCordaOptions extends ICactusPluginOptions {
    logLevel?: LogLevelDesc;
    sshConfigAdminShell: SshConfig;
    corDappsDir: string;
    prometheusExporter?: PrometheusExporter;
    cordaStartCmd?: string;
    cordaStopCmd?: string;
    apiUrl?: string;
    cordaVersion?: CordaVersion;
    holdingIDShortHash?: any;
    clientRequestID?: any;
    /**
     * Path to the file where the private key for the ssh configuration is located
     * This property is optional. Its use is not recommended for most cases, it will override the privateKey property of the sshConfigAdminShell.
     * @type {string}
     * @memberof IPluginLedgerConnectorCordaOptions
     */
    sshPrivateKeyPath?: string;
}
export declare class PluginLedgerConnectorCorda implements IPluginLedgerConnector<FlowStatusV5Response, StartFlowV5Request, CPIV5Response, any>, IPluginWebService {
    readonly options: IPluginLedgerConnectorCordaOptions;
    static readonly CLASS_NAME = "DeployContractJarsEndpoint";
    private readonly instanceId;
    private readonly log;
    prometheusExporter: PrometheusExporter;
    private endpoints;
    get className(): string;
    private httpServer;
    constructor(options: IPluginLedgerConnectorCordaOptions);
    getOpenApiSpec(): unknown;
    getPrometheusExporter(): PrometheusExporter;
    getPrometheusExporterMetrics(): Promise<string>;
    getConsensusAlgorithmFamily(): Promise<ConsensusAlgorithmFamily>;
    hasTransactionFinality(): Promise<boolean>;
    getInstanceId(): string;
    getPackageName(): string;
    onPluginInit(): Promise<unknown>;
    deployContract(): Promise<any>;
    transact(): Promise<any>;
    registerWebServices(app: Express): Promise<IWebServiceEndpoint[]>;
    private readSshPrivateKeyFromFile;
    getOrCreateWebServices(): Promise<IWebServiceEndpoint[]>;
    shutdown(): Promise<void>;
    getFlowList(): Promise<string[]>;
    startFlow(req: StartFlowV5Request): Promise<any>;
    listCPI(): Promise<any>;
    getFlow(holdingshortHashID: string): Promise<any>;
}
