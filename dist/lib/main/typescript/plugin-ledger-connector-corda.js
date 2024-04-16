"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLedgerConnectorCorda = exports.CordaVersion = void 0;
const openapi_json_1 = __importDefault(require("../json/openapi.json"));
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const cactus_core_1 = require("@hyperledger/cactus-core");
const cactus_common_1 = require("@hyperledger/cactus-common");
const deploy_contract_jars_endpoint_1 = require("./web-services/deploy-contract-jars-endpoint");
const get_prometheus_exporter_metrics_endpoint_v1_1 = require("./web-services/get-prometheus-exporter-metrics-endpoint-v1");
const prometheus_exporter_1 = require("./prometheus-exporter/prometheus-exporter");
const invoke_contract_endpoint_v1_1 = require("./web-services/invoke-contract-endpoint-v1");
const get_cpi_endpoint_v1_1 = require("./web-services/get-cpi-endpoint-v1");
const list_flow_status_endpoint_v1_1 = require("./web-services/list-flow-status-endpoint-v1");
const get_flow_status_response_endpoint_v1_1 = require("./web-services/get-flow-status-response-endpoint-v1");
const list_flows_endpoint_v1_1 = require("./web-services/list-flows-endpoint-v1");
const network_map_endpoint_v1_1 = require("./web-services/network-map-endpoint-v1");
const diagnose_node_endpoint_v1_1 = require("./web-services/diagnose-node-endpoint-v1");
const start_flow_endpoint_v1_1 = require("./web-services/start-flow-endpoint-v1");
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const https_1 = __importDefault(require("https"));
var CordaVersion;
(function (CordaVersion) {
    CordaVersion["CORDA_V4X"] = "CORDA_V4X";
    CordaVersion["CORDA_V5"] = "CORDA_V5";
})(CordaVersion = exports.CordaVersion || (exports.CordaVersion = {}));
class PluginLedgerConnectorCorda {
    get className() {
        return deploy_contract_jars_endpoint_1.DeployContractJarsEndpoint.CLASS_NAME;
    }
    constructor(options) {
        this.options = options;
        this.httpServer = null;
        const fnTag = `${this.className}#constructor()`;
        cactus_common_1.Checks.truthy(options, `${fnTag} options`);
        cactus_common_1.Checks.truthy(options.sshConfigAdminShell, `${fnTag} sshConfigAdminShell`);
        cactus_common_1.Checks.truthy(options.instanceId, `${fnTag} instanceId`);
        const level = options.logLevel || "INFO";
        const label = "plugin-ledger-connector-corda";
        this.log = cactus_common_1.LoggerProvider.getOrCreate({ level, label });
        this.instanceId = this.options.instanceId;
        this.prometheusExporter =
            options.prometheusExporter ||
                new prometheus_exporter_1.PrometheusExporter({ pollingIntervalInMin: 1 });
        cactus_common_1.Checks.truthy(this.prometheusExporter, `${fnTag} options.prometheusExporter`);
        this.prometheusExporter.startMetricsCollection();
        // if privateKeyPath exists, overwrite privateKey in sshConfigAdminShell
        this.readSshPrivateKeyFromFile();
    }
    getOpenApiSpec() {
        return openapi_json_1.default;
    }
    getPrometheusExporter() {
        return this.prometheusExporter;
    }
    async getPrometheusExporterMetrics() {
        const res = await this.prometheusExporter.getPrometheusMetrics();
        this.log.debug(`getPrometheusExporterMetrics() response: %o`, res);
        return res;
    }
    async getConsensusAlgorithmFamily() {
        return cactus_core_api_1.ConsensusAlgorithmFamily.Authority;
    }
    async hasTransactionFinality() {
        const currentConsensusAlgorithmFamily = await this.getConsensusAlgorithmFamily();
        return (0, cactus_core_1.consensusHasTransactionFinality)(currentConsensusAlgorithmFamily);
    }
    getInstanceId() {
        return this.instanceId;
    }
    getPackageName() {
        return "@hyperledger/cactus-plugin-ledger-connector-corda";
    }
    async onPluginInit() {
        return;
    }
    deployContract() {
        throw new Error("Method not implemented.");
    }
    async transact() {
        this.prometheusExporter.addCurrentTransaction();
        return null;
    }
    async registerWebServices(app) {
        const webServices = await this.getOrCreateWebServices();
        await Promise.all(webServices.map((ws) => ws.registerExpress(app)));
        // await Promise.all(webServices.map((ws) => ws.registerExpress(app)));
        return webServices;
    }
    readSshPrivateKeyFromFile() {
        const { sshPrivateKeyPath } = this.options;
        if (sshPrivateKeyPath) {
            const fileContent = fs_1.default
                .readFileSync(sshPrivateKeyPath, "utf-8")
                .toString();
            this.options.sshConfigAdminShell.privateKey = fileContent;
        }
    }
    async getOrCreateWebServices() {
        if (Array.isArray(this.endpoints)) {
            return this.endpoints;
        }
        const pkgName = this.getPackageName();
        this.log.info(`Instantiating web services for ${pkgName}...`);
        const endpoints = [];
        {
            const endpoint = new deploy_contract_jars_endpoint_1.DeployContractJarsEndpoint({
                sshConfigAdminShell: this.options.sshConfigAdminShell,
                logLevel: this.options.logLevel,
                corDappsDir: this.options.corDappsDir,
                cordaStartCmd: this.options.cordaStartCmd,
                cordaStopCmd: this.options.cordaStopCmd,
                apiUrl: this.options.apiUrl,
            });
            endpoints.push(endpoint);
        }
        {
            const opts = {
                apiUrl: this.options.apiUrl,
                logLevel: this.options.logLevel,
            };
            const endpoint = new invoke_contract_endpoint_v1_1.InvokeContractEndpointV1(opts);
            endpoints.push(endpoint);
        }
        {
            const opts = {
                connector: this,
                logLevel: this.options.logLevel,
            };
            const endpoint = new get_prometheus_exporter_metrics_endpoint_v1_1.GetPrometheusExporterMetricsEndpointV1(opts);
            endpoints.push(endpoint);
        }
        {
            const opts = {
                apiUrl: this.options.apiUrl,
                logLevel: this.options.logLevel,
                cordaVersion: this.options.cordaVersion,
                connector: this,
            };
            const endpoint = new list_flows_endpoint_v1_1.ListFlowsEndpointV1(opts);
            endpoints.push(endpoint);
        }
        {
            const opts = {
                apiUrl: this.options.apiUrl,
                logLevel: this.options.logLevel,
            };
            const endpoint = new network_map_endpoint_v1_1.NetworkMapEndpointV1(opts);
            endpoints.push(endpoint);
        }
        {
            const opts = {
                apiUrl: this.options.apiUrl,
                logLevel: this.options.logLevel,
            };
            const endpoint = new diagnose_node_endpoint_v1_1.DiagnoseNodeEndpointV1(opts);
            endpoints.push(endpoint);
        }
        {
            const opts = {
                apiUrl: this.options.apiUrl,
                logLevel: this.options.logLevel,
                connector: this,
            };
            const endpoint = new get_cpi_endpoint_v1_1.ListCPIEndpointV1(opts);
            endpoints.push(endpoint);
        }
        {
            const opts = {
                apiUrl: this.options.apiUrl,
                logLevel: this.options.logLevel,
                holdingIDShortHash: this.options.holdingIDShortHash,
                connector: this,
            };
            const endpoint = new list_flow_status_endpoint_v1_1.FlowStatusEndpointV1(opts);
            endpoints.push(endpoint);
        }
        {
            const opts = {
                apiUrl: this.options.apiUrl,
                logLevel: this.options.logLevel,
                holdingIDShortHash: this.options.holdingIDShortHash,
                clientRequestID: this.options.clientRequestID,
                connector: this,
            };
            const endpoint = new get_flow_status_response_endpoint_v1_1.FlowStatusResponseEndpointV1(opts);
            endpoints.push(endpoint);
        }
        {
            const opts = {
                apiUrl: this.options.apiUrl,
                logLevel: this.options.logLevel,
                connector: this,
            };
            const endpoint = new start_flow_endpoint_v1_1.StartFlowEndpointV1(opts);
            endpoints.push(endpoint);
        }
        this.log.info(`Instantiated endpoints of ${pkgName}`);
        return endpoints;
    }
    async shutdown() {
        return;
    }
    async getFlowList() {
        return ["getFlowList()_NOT_IMPLEMENTED"];
    }
    async startFlow(req) {
        const fnTag = `${this.className}#startFlowV5Request()`;
        this.log.debug("%s ENTER", fnTag);
        const username = "admin";
        const password = "admin";
        const authString = Buffer.from(`${username}:${password}`).toString("base64");
        const headers = {
            Authorization: `Basic ${authString}`,
        };
        const httpsAgent = new https_1.default.Agent({ rejectUnauthorized: false });
        try {
            const holdingIDShortHash = req.holdingIDShortHash;
            const cordaReq = {
                clientRequestId: req.clientRequestId,
                flowClassName: req.flowClassName,
                requestBody: req.requestBody
            };
            const cordaReqBuff = Buffer.from(JSON.stringify(cordaReq));
            const response = await (0, node_fetch_1.default)("https://127.0.0.1:8888/api/v1/flow/" + holdingIDShortHash, {
                method: `POST`,
                headers: headers,
                body: cordaReqBuff,
                agent: httpsAgent,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            console.log("Response:", responseData);
            return responseData;
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    async listCPI() {
        const username = "admin";
        const password = "admin";
        const authString = Buffer.from(`${username}:${password}`).toString("base64");
        const headers = {
            Authorization: `Basic ${authString}`,
        };
        const httpsAgent = new https_1.default.Agent({ rejectUnauthorized: false });
        try {
            const response = await (0, node_fetch_1.default)("https://127.0.0.1:8888/api/v1/cpi", {
                method: `GET`,
                headers: headers,
                agent: httpsAgent,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            return responseData;
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    async getFlow(holdingshortHashID) {
        const fnTag = `${this.className}#startFlowV5Request()`;
        this.log.debug("%s ENTER", fnTag);
        const username = "admin";
        const password = "admin";
        const authString = Buffer.from(`${username}:${password}`).toString("base64");
        const headers = {
            Authorization: `Basic ${authString}`,
        };
        const httpsAgent = new https_1.default.Agent({ rejectUnauthorized: false });
        try {
            const response = await (0, node_fetch_1.default)("https://127.0.0.1:8888/api/v1/flow/" + holdingshortHashID, {
                method: `GET`,
                headers: headers,
                agent: httpsAgent,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            console.log("Response:", responseData);
            return responseData;
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }
}
exports.PluginLedgerConnectorCorda = PluginLedgerConnectorCorda;
//add here implement similar to transact connector-fabric,
PluginLedgerConnectorCorda.CLASS_NAME = "DeployContractJarsEndpoint";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLWxlZGdlci1jb25uZWN0b3ItY29yZGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWFpbi90eXBlc2NyaXB0L3BsdWdpbi1sZWRnZXItY29ubmVjdG9yLWNvcmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUtBLHdFQUF1QztBQU92QyxrRUFNc0M7QUFDdEMsMERBQTJFO0FBQzNFLDhEQUtvQztBQUVwQyxnR0FBMEY7QUFFMUYsNEhBR29FO0FBRXBFLG1GQUErRTtBQUMvRSw0RkFHb0Q7QUFFcEQsNEVBRzRDO0FBQzVDLDhGQUdxRDtBQUNyRCw4R0FHNkQ7QUFDN0Qsa0ZBRytDO0FBQy9DLG9GQUdnRDtBQUNoRCx3RkFHa0Q7QUFDbEQsa0ZBRytDO0FBQy9DLDRDQUFvQjtBQUNwQiw0REFBK0I7QUFDL0Isa0RBQTBCO0FBQzFCLElBQVksWUFHWDtBQUhELFdBQVksWUFBWTtJQUN0Qix1Q0FBdUIsQ0FBQTtJQUN2QixxQ0FBcUIsQ0FBQTtBQUN2QixDQUFDLEVBSFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFHdkI7QUFzQkQsTUFBYSwwQkFBMEI7SUFtQnJDLElBQVcsU0FBUztRQUNsQixPQUFPLDBEQUEwQixDQUFDLFVBQVUsQ0FBQztJQUMvQyxDQUFDO0lBSUQsWUFBNEIsT0FBMkM7UUFBM0MsWUFBTyxHQUFQLE9BQU8sQ0FBb0M7UUFGL0QsZUFBVSxHQUFpQyxJQUFJLENBQUM7UUFHdEQsTUFBTSxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxnQkFBZ0IsQ0FBQztRQUVoRCxzQkFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxLQUFLLFVBQVUsQ0FBQyxDQUFDO1FBQzNDLHNCQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEtBQUssc0JBQXNCLENBQUMsQ0FBQztRQUMzRSxzQkFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFP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