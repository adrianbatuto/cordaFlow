"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape-promise/tape"));
const internal_ip_1 = require("internal-ip");
const uuid_1 = require("uuid");
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const cactus_test_tooling_1 = require("@hyperledger/cactus-test-tooling");
const cactus_common_1 = require("@hyperledger/cactus-common");
const cactus_test_tooling_2 = require("@hyperledger/cactus-test-tooling");
const index_1 = require("../../../main/typescript/generated/openapi/typescript-axios/index");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const plugin_ledger_connector_corda_1 = require("../../../main/typescript/plugin-ledger-connector-corda");
const metrics_1 = require("../../../main/typescript/prometheus-exporter/metrics");
const logLevel = "TRACE";
// Skipping for now due to flakiness until https://github.com/hyperledger/cactus/issues/1473
// is resolved. You can find complete logs attached at that issue as well.
tape_1.default.skip("Tests are passing on the JVM side", async (t) => {
    tape_1.default.onFailure(async () => {
        await cactus_test_tooling_1.Containers.logDiagnostics({ logLevel });
    });
    const ledger = new cactus_test_tooling_1.CordaTestLedger({
        imageName: "ghcr.io/hyperledger/cactus-corda-4-7-all-in-one-obligation",
        imageVersion: "2021-08-19--feat-888",
        logLevel,
    });
    t.ok(ledger, "CordaTestLedger instantaited OK");
    tape_1.default.onFinish(async () => {
        await ledger.stop();
        await ledger.destroy();
    });
    const ledgerContainer = await ledger.start();
    t.ok(ledgerContainer, "CordaTestLedger container truthy post-start() OK");
    const corDappsDirPartyA = await ledger.getCorDappsDirPartyA();
    const corDappsDirPartyB = await ledger.getCorDappsDirPartyB();
    t.comment(`corDappsDirPartyA=${corDappsDirPartyA}`);
    t.comment(`corDappsDirPartyB=${corDappsDirPartyB}`);
    await ledger.logDebugPorts();
    const partyARpcPort = await ledger.getRpcAPublicPort();
    const partyBRpcPort = await ledger.getRpcBPublicPort();
    const jarFiles = await ledger.pullCordappJars("BASIC_CORDAPP" /* SampleCordappEnum.BASIC_CORDAPP */);
    t.comment(`Fetched ${jarFiles.length} cordapp jars OK`);
    const internalIpOrUndefined = await (0, internal_ip_1.v4)();
    t.ok(internalIpOrUndefined, "Determined LAN IPv4 address successfully OK");
    const internalIp = internalIpOrUndefined;
    t.comment(`Internal IP (based on default gateway): ${internalIp}`);
    // TODO: parse the gradle build files to extract the credentials?
    const partyARpcUsername = "user1";
    const partyARpcPassword = "password";
    const partyBRpcUsername = partyARpcUsername;
    const partyBRpcPassword = partyARpcPassword;
    const springAppConfig = {
        logging: {
            level: {
                root: "INFO",
                "net.corda": "INFO",
                "org.hyperledger.cactus": "DEBUG",
            },
        },
        cactus: {
            corda: {
                node: { host: internalIp },
                rpc: {
                    port: partyARpcPort,
                    username: partyARpcUsername,
                    password: partyARpcPassword,
                },
            },
        },
    };
    const springApplicationJson = JSON.stringify(springAppConfig);
    const envVarSpringAppJson = `SPRING_APPLICATION_JSON=${springApplicationJson}`;
    t.comment(envVarSpringAppJson);
    const connector = new cactus_test_tooling_2.CordaConnectorContainer({
        logLevel,
        imageName: "ghcr.io/hyperledger/cactus-connector-corda-server",
        imageVersion: "2021-11-23--feat-1493",
        envVars: [envVarSpringAppJson],
    });
    t.ok(cactus_test_tooling_2.CordaConnectorContainer, "CordaConnectorContainer instantiated OK");
    tape_1.default.onFinish(async () => {
        try {
            await connector.stop();
        }
        finally {
            await connector.destroy();
        }
    });
    const connectorContainer = await connector.start();
    t.ok(connectorContainer, "CordaConnectorContainer started OK");
    await connector.logDebugPorts();
    const apiUrl = await connector.getApiLocalhostUrl();
    const config = new cactus_core_api_1.Configuration({ basePath: apiUrl });
    const apiClient = new index_1.DefaultApi(config);
    const flowsRes1 = await apiClient.listFlowsV1();
    t.ok(flowsRes1.status === 200, "flowsRes1.status === 200 OK");
    t.ok(flowsRes1.data, "flowsRes1.data truthy OK");
    t.ok(flowsRes1.data.flowNames, "flowsRes1.data.flowNames truthy OK");
    t.comment(`apiClient.listFlowsV1() => ${JSON.stringify(flowsRes1.data)}`);
    const flowNamesPreDeploy = flowsRes1.data.flowNames;
    const sshConfig = await ledger.getSshConfig();
    const hostKeyEntry = "not-used-right-now-so-this-does-not-matter... ;-(";
    const cdcA = {
        cordappDir: corDappsDirPartyA,
        cordaNodeStartCmd: "supervisorctl start corda-a",
        cordaJarPath: "/samples-kotlin/Advanced/obligation-cordapp/build/nodes/ParticipantA/corda.jar",
        nodeBaseDirPath: "/samples-kotlin/Advanced/obligation-cordapp/build/nodes/ParticipantA/",
        rpcCredentials: {
            hostname: internalIp,
            port: partyARpcPort,
            username: partyARpcUsername,
            password: partyARpcPassword,
        },
        sshCredentials: {
            hostKeyEntry,
            hostname: internalIp,
            password: "root",
            port: sshConfig.port,
            username: sshConfig.username,
        },
    };
    const cdcB = {
        cordappDir: corDappsDirPartyB,
        cordaNodeStartCmd: "supervisorctl start corda-b",
        cordaJarPath: "/samples-kotlin/Advanced/obligation-cordapp/build/nodes/ParticipantB/corda.jar",
        nodeBaseDirPath: "/samples-kotlin/Advanced/obligation-cordapp/build/nodes/ParticipantB/",
        rpcCredentials: {
            hostname: internalIp,
            port: partyBRpcPort,
            username: partyBRpcUsername,
            password: partyBRpcPassword,
        },
        sshCredentials: {
            hostKeyEntry,
            hostname: internalIp,
            password: "root",
            port: sshConfig.port,
            username: sshConfig.username,
        },
    };
    const cordappDeploymentConfigs = [cdcA, cdcB];
    const depReq = {
        jarFiles,
        cordappDeploymentConfigs,
    };
    const depRes = await apiClient.deployContractJarsV1(depReq);
    t.ok(depRes, "Jar deployment response truthy OK");
    t.equal(depRes.status, 200, "Jar deployment status code === 200 OK");
    t.ok(depRes.data, "Jar deployment response body truthy OK");
    t.ok(depRes.data.deployedJarFiles, "Jar deployment body deployedJarFiles OK");
    t.equal(depRes.data.deployedJarFiles.length, jarFiles.length, "Deployed jar file count equals count in request OK");
    const flowsRes2 = await apiClient.listFlowsV1();
    t.ok(flowsRes2.status === 200, "flowsRes2.status === 200 OK");
    t.comment(`apiClient.listFlowsV1() => ${JSON.stringify(flowsRes2.data)}`);
    t.ok(flowsRes2.data, "flowsRes2.data truthy OK");
    t.ok(flowsRes2.data.flowNames, "flowsRes2.data.flowNames truthy OK");
    const flowNamesPostDeploy = flowsRes2.data.flowNames;
    t.notDeepLooseEqual(flowNamesPostDeploy, flowNamesPreDeploy, "New flows detected post Cordapp Jar deployment OK");
    // let's see if this makes a difference and if yes, then we know that the issue
    // is a race condition for sure
    // await new Promise((r) => setTimeout(r, 120000));
    t.comment("Fetching network map for Corda network...");
    const networkMapRes = await apiClient.networkMapV1();
    t.ok(networkMapRes, "networkMapRes truthy OK");
    t.ok(networkMapRes.status, "networkMapRes.status truthy OK");
    t.ok(networkMapRes.data, "networkMapRes.data truthy OK");
    t.true(Array.isArray(networkMapRes.data), "networkMapRes.data isArray OK");
    t.true(networkMapRes.data.length > 0, "networkMapRes.data not empty OK");
    const partyB = networkMapRes.data.find((it) => it.legalIdentities.some((it2) => it2.name.organisation === "ParticipantB"));
    const partyBPublicKey = partyB === null || partyB === void 0 ? void 0 : partyB.legalIdentities[0].owningKey;
    const req = {
        timeoutMs: 60000,
        flowFullClassName: "net.corda.samples.example.flows.ExampleFlow$Initiator",
        flowInvocationType: index_1.FlowInvocationType.FlowDynamic,
        params: [
            {
                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                jvmType: {
                    fqClassName: "java.lang.Integer",
                },
                primitiveValue: 42,
            },
            {
                jvmTypeKind: index_1.JvmTypeKind.Reference,
                jvmType: {
                    fqClassName: "net.corda.core.identity.Party",
                },
                jvmCtorArgs: [
                    {
                        jvmTypeKind: index_1.JvmTypeKind.Reference,
                        jvmType: {
                            fqClassName: "net.corda.core.identity.CordaX500Name",
                        },
                        jvmCtorArgs: [
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: "ParticipantB",
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: "New York",
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: "US",
                            },
                        ],
                    },
                    {
                        jvmTypeKind: index_1.JvmTypeKind.Reference,
                        jvmType: {
                            fqClassName: "org.hyperledger.cactus.plugin.ledger.connector.corda.server.impl.PublicKeyImpl",
                        },
                        jvmCtorArgs: [
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: partyBPublicKey === null || partyBPublicKey === void 0 ? void 0 : partyBPublicKey.algorithm,
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: partyBPublicKey === null || partyBPublicKey === void 0 ? void 0 : partyBPublicKey.format,
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: partyBPublicKey === null || partyBPublicKey === void 0 ? void 0 : partyBPublicKey.encoded,
                            },
                        ],
                    },
                ],
            },
        ],
    };
    const res = await apiClient.invokeContractV1(req);
    t.ok(res, "InvokeContractV1Request truthy OK");
    t.equal(res.status, 200, "InvokeContractV1Request status code === 200 OK");
    const pluginOptions = {
        instanceId: (0, uuid_1.v4)(),
        corDappsDir: corDappsDirPartyA,
        sshConfigAdminShell: sshConfig,
    };
    const plugin = new plugin_ledger_connector_corda_1.PluginLedgerConnectorCorda(pluginOptions);
    const expressApp = (0, express_1.default)();
    expressApp.use(body_parser_1.default.json({ limit: "250mb" }));
    const server = http_1.default.createServer(expressApp);
    const listenOptions = {
        hostname: "127.0.0.1",
        port: 0,
        server,
    };
    const addressInfo = (await cactus_common_1.Servers.listen(listenOptions));
    tape_1.default.onFinish(async () => await cactus_common_1.Servers.shutdown(server));
    const { address, port } = addressInfo;
    const apiHost = `http://${address}:${port}`;
    t.comment(`Metrics URL: ${apiHost}/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/get-prometheus-exporter-metrics`);
    const apiConfig = new cactus_core_api_1.Configuration({ basePath: apiHost });
    const apiClient1 = new index_1.DefaultApi(apiConfig);
    await plugin.getOrCreateWebServices();
    await plugin.registerWebServices(expressApp);
    {
        plugin.transact();
        const promRes = await apiClient1.getPrometheusMetricsV1();
        const promMetricsOutput = "# HELP " +
            metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT +
            " Total transactions executed\n" +
            "# TYPE " +
            metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT +
            " gauge\n" +
            metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT +
            '{type="' +
            metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT +
            '"} 1';
        t.ok(promRes);
        t.ok(promRes.data);
        t.equal(promRes.status, 200);
        t.true(promRes.data.includes(promMetricsOutput), "Total Transaction Count of 1 recorded as expected. RESULT OK");
        // Executing transaction to increment the Total transaction count metrics
        plugin.transact();
        const promRes1 = await apiClient1.getPrometheusMetricsV1();
        const promMetricsOutput1 = "# HELP " +
            metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT +
            " Total transactions executed\n" +
            "# TYPE " +
            metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT +
            " gauge\n" +
            metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT +
            '{type="' +
            metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT +
            '"} 2';
        t.ok(promRes1);
        t.ok(promRes1.data);
        t.equal(promRes1.status, 200);
        t.true(promRes1.data.includes(promMetricsOutput1), "Total Transaction Count of 2 recorded as expected. RESULT OK");
    }
    t.end();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LWNvcmRhcHAtamFycy10by1ub2Rlcy12NC43LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdGVzdC90eXBlc2NyaXB0L2ludGVncmF0aW9uL2RlcGxveS1jb3JkYXBwLWphcnMtdG8tbm9kZXMtdjQuNy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkRBQStDO0FBQy9DLDZDQUFpRDtBQUNqRCwrQkFBb0M7QUFDcEMsZ0RBQXdCO0FBQ3hCLDhEQUFxQztBQUNyQyxzREFBOEI7QUFHOUIsMEVBQStFO0FBQy9FLDhEQUlvQztBQUNwQywwRUFHMEM7QUFFMUMsNkZBTzJFO0FBQzNFLGtFQUE2RDtBQUU3RCwwR0FHZ0U7QUFDaEUsa0ZBQXFHO0FBRXJHLE1BQU0sUUFBUSxHQUFpQixPQUFPLENBQUM7QUFFdkMsNEZBQTRGO0FBQzVGLDBFQUEwRTtBQUMxRSxjQUFJLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxFQUFFLEtBQUssRUFBRSxDQUFPLEVBQUUsRUFBRTtJQUMvRCxjQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ3hCLE1BQU0sZ0NBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQ0FBZSxDQUFDO1FBQ2pDLFNBQVMsRUFBRSw0REFBNEQ7UUFDdkUsWUFBWSxFQUFFLHNCQUFzQjtRQUNwQyxRQUFRO0tBQ1QsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztJQUVoRCxjQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BCLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3pCLENB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