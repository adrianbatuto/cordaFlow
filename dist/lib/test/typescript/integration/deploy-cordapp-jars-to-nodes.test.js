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
tape_1.default.skip("Tests are passing on the JVM side", async (t) => {
    tape_1.default.onFailure(async () => {
        await cactus_test_tooling_1.Containers.logDiagnostics({ logLevel });
    });
    const ledger = new cactus_test_tooling_1.CordaTestLedger({
        imageName: "ghcr.io/hyperledger/cactus-corda-4-6-all-in-one-obligation",
        imageVersion: "2021-03-19-feat-686",
        // imageName: "caio",
        // imageVersion: "latest",
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
    // const partyA = networkMapRes.data.find((it) =>
    //   it.legalIdentities.some((it2) => it2.name.organisation === "ParticipantA"),
    // );
    // const partyAPublicKey = partyA?.legalIdentities[0].owningKey;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LWNvcmRhcHAtamFycy10by1ub2Rlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Rlc3QvdHlwZXNjcmlwdC9pbnRlZ3JhdGlvbi9kZXBsb3ktY29yZGFwcC1qYXJzLXRvLW5vZGVzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2REFBK0M7QUFDL0MsNkNBQWlEO0FBQ2pELCtCQUFvQztBQUNwQyxnREFBd0I7QUFDeEIsOERBQXFDO0FBQ3JDLHNEQUE4QjtBQUc5QiwwRUFBK0U7QUFDL0UsOERBSW9DO0FBQ3BDLDBFQUcwQztBQUUxQyw2RkFPMkU7QUFDM0Usa0VBQTZEO0FBRTdELDBHQUdnRTtBQUNoRSxrRkFBcUc7QUFFckcsTUFBTSxRQUFRLEdBQWlCLE9BQU8sQ0FBQztBQUV2QyxjQUFJLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxFQUFFLEtBQUssRUFBRSxDQUFPLEVBQUUsRUFBRTtJQUMvRCxjQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ3hCLE1BQU0sZ0NBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQ0FBZSxDQUFDO1FBQ2pDLFNBQVMsRUFBRSw0REFBNEQ7UUFDdkUsWUFBWSxFQUFFLHFCQUFxQjtRQUNuQyxxQkFBcUI7UUFDckIsMEJBQTBCO1FBQzFCLFFBQVE7S0FDVCxDQUFDLENBQUM7SUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO0lBRWhELGNBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDdkIsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEIsTUFBTSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDekIsQ0FBQyxDQUFDLENB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