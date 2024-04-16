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
        imageName: "ghcr.io/hyperledger/cactus-corda-4-8-all-in-one-obligation",
        imageVersion: "2021-08-31--feat-889",
        logLevel,
    });
    t.ok(ledger, "CordaTestLedger v4.8 instantaited OK");
    tape_1.default.onFinish(async () => {
        await ledger.stop();
        await ledger.destroy();
    });
    const ledgerContainer = await ledger.start();
    t.ok(ledgerContainer, "CordaTestLedger v4.8 container truthy post-start() OK");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LWNvcmRhcHAtamFycy10by1ub2Rlcy12NC44LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdGVzdC90eXBlc2NyaXB0L2ludGVncmF0aW9uL2RlcGxveS1jb3JkYXBwLWphcnMtdG8tbm9kZXMtdjQuOC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkRBQStDO0FBQy9DLDZDQUFpRDtBQUNqRCwrQkFBb0M7QUFDcEMsZ0RBQXdCO0FBQ3hCLDhEQUFxQztBQUNyQyxzREFBOEI7QUFHOUIsMEVBQStFO0FBQy9FLDhEQUlvQztBQUNwQywwRUFHMEM7QUFFMUMsNkZBTzJFO0FBQzNFLGtFQUE2RDtBQUU3RCwwR0FHZ0U7QUFDaEUsa0ZBQXFHO0FBRXJHLE1BQU0sUUFBUSxHQUFpQixPQUFPLENBQUM7QUFFdkMsY0FBSSxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsRUFBRSxLQUFLLEVBQUUsQ0FBTyxFQUFFLEVBQUU7SUFDL0QsY0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUN4QixNQUFNLGdDQUFVLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sTUFBTSxHQUFHLElBQUkscUNBQWUsQ0FBQztRQUNqQyxTQUFTLEVBQUUsNERBQTREO1FBQ3ZFLFlBQVksRUFBRSxzQkFBc0I7UUFDcEMsUUFBUTtLQUNULENBQUMsQ0FBQztJQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLHNDQUFzQyxDQUFDLENBQUM7SUFFckQsY0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUN2QixNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQixNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sZUFBZSxHQUFHLE1BQU0sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzdDLENBQUMsQ0FBQyxFQUFFLENBQ0YsZUFBZSxFQUNmLHVEQUF1RCxDQUN4RCxDQUFDO0lBRUYsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzlELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUM5RCxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixpQkFBaUIsRUFBRSxDQUFDLENBQUM7SUFDcEQsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBRXBELE1BQU0sTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzdCLE1BQU0sYUFBYSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDdkQsTUFBTSxhQUFhLEdBQUcsTUFBTSxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUV2RCxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxlQUFlLHVEQUU1QyxDQUFDO0lBQ0YsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLFFBQVEsQ0FBQyxNQUFNLGtCQUFrQixDQUFDLENBQUM7SUFFeEQsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLElBQUEsZ0JBQVksR0FBRSxDQUFDO0lBQ25ELENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztJQUMzRSxNQUFNLFVBQVUsR0FBRyxxQkFBK0IsQ0FBQztJQUNuRCxDQUFDLENBQUMsT0FBTyxDQUFDLDJDQUEyQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBRW5FLGlFQUFpRTtJQUNqRSxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztJQUNsQyxNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQztJQUNyQyxNQUFNLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO0lBQzVDLE1BQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7SUFDNUMsTUFBTSxlQUFlLEdBQUc7UUFDdEIsT0FBTyxFQUFFO1lBQ1AsS0FBSyxFQUFFO2dCQUNMLElBQUksRUFBRSxNQUFNO2dCQUNaLFdBQVcsRUFBRSxNQUFNO2dCQUNuQix3QkFBd0IsRUFBRSxPQUFPO2FBQ2xDO1NBQ0Y7UUFDRCxNQUFNLEVBQUU7WUFDTixLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtnQkFDMUIsR0FBRyxFQUFFO29CQUNILElBQUksRUFBRSxhQUFhO29CQUNuQixRQUFRLEVBQUUsaUJBQWlCO29CQUMzQixRQUFRLEVBQUUsaUJBQWlCO2lCQUM1QjthQUNGO1NBQ0Y7S0FDRixDQUFDO0lBQ0YsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzlELE1BQU0sbUJBQW1CLEdBQUcsMkJBQTJCLHFCQUFxQixFQUFFLENBQUM7SUFDL0UsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBRS9CLE1BQU0sU0FBUyxHQUFHLElBQUksNkNBQXVCLENBQUM7UUFDNUMsUUFBUTtRQUNSLFNBQVMsRUFBRSxtREFBbUQ7UUFDOUQsWUFBWSxFQUFFLHVCQUF1QjtRQUNyQyxPQUFPLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztLQUMvQixDQUFDLENBQUM7SUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLDZDQUF1QixFQUFFLHlDQUF5QyxDQUFDLENBQUM7SUFFekUsY0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUN2QixJQUFJO1lBQ0YsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDeEI7Z0JBQVM7WUFDUixNQUFNLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUMzQjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuRCxDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLG9DQUFvQyxDQUFDLENBQUM7SUFFL0QsTUFBTSxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDaEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUVwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLCtCQUFhLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN2RCxNQUFNLFNBQVMsR0FBRyxJQUFJLGtCQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFdkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDaEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO0lBQzlELENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztJQUNyRSxDQUFDLENBQUMsT0FBTyxDQUFDLDhCQUE4QixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUUsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUVwRCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM5QyxNQUFNLFlBQVksR0FBRyxtREFBbUQsQ0FBQztJQUV6RSxNQUFNLElBQUksR0FBNEI7UUFDcEMsVUFBVSxFQUFFLGlCQUFpQjtRQUM3QixpQkFBaUIsRUFBRSw2QkFBNkI7UUFDaEQsWUFBWSxFQUNWLGdGQUFnRjtRQUNsRixlQUFlLEVBQ2IsdUVBQXVFO1FBQ3pFLGNBQWMsRUFBRTtZQUNkLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLElBQUksRUFBRSxhQUFhO1lBQ25CLFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsUUFBUSxFQUFFLGlCQUFpQjtTQUM1QjtRQUNELGNBQWMsRUFBRTtZQUNkLFlBQVk7WUFDWixRQUFRLEVBQUUsVUFBVTtZQUNwQixRQUFRLEVBQUUsTUFBTTtZQUNoQixJQUFJLEVBQUUsU0FBUyxDQUFDLElBQWM7WUFDOUIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFrQjtTQUN2QztLQUNGLENBQUM7SUFFRixNQUFNLElBQUksR0FBNEI7UUFDcEMsVUFBVSxFQUFFLGlCQUFpQjtRQUM3QixpQkFBaUIsRUFBRSw2QkFBNkI7UUFDaEQsWUFBWSxFQUNWLGdGQUFnRjtRQUNsRixlQUFlLEVBQ2IsdUVBQXVFO1FBQ3pFLGNBQWMsRUFBRTtZQUNkLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLElBQUksRUFBRSxhQUFhO1lBQ25CLFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsUUFBUSxFQUFFLGlCQUFpQjtTQUM1QjtRQUNELGNBQWMsRUFBRTtZQUNkLFlBQVk7WUFDWixRQUFRLEVBQUUsVUFBVTtZQUNwQixRQUFRLEVBQUUsTUFBTTtZQUNoQixJQUFJLEVBQUUsU0FBUyxDQUFDLElBQWM7WUFDOUIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFrQjtTQUN2QztLQUNGLENBQUM7SUFFRixNQUFNLHdCQUF3QixHQUE4QixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6RSxNQUFNLE1BQU0sR0FBZ0M7UUFDMUMsUUFBUTtRQUNSLHdCQUF3QjtLQUN6QixDQUFDO0lBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxTQUFTLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7SUFDckUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLHdDQUF3QyxDQUFDLENBQUM7SUFDNUQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLHlDQUF5QyxDQUFDLENBQUM7SUFDOUUsQ0FBQyxDQUFDLEtBQUssQ0FDTCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFDbkMsUUFBUSxDQUFDLE1BQU0sRUFDZixvREFBb0QsQ0FDckQsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFHLE1BQU0sU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2hELENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztJQUM5RCxDQUFDLENBQUMsT0FBTyxDQUFDLDhCQUE4QixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFDakQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDckQsQ0FBQyxDQUFDLGlCQUFpQixDQUNqQixtQkFBbUIsRUFDbkIsa0JBQWtCLEVBQ2xCLG1EQUFtRCxDQUNwRCxDQUFDO0lBRUYsK0VBQStFO0lBQy9FLCtCQUErQjtJQUMvQixtREFBbUQ7SUFDbkQsQ0FBQyxDQUFDLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sYUFBYSxHQUFHLE1BQU0sU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3JELENBQUMsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLGdDQUFnQyxDQUFDLENBQUM7SUFDN0QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLDhCQUE4QixDQUFDLENBQUM7SUFDekQsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO0lBQzNFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7SUFFekUsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUM1QyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssY0FBYyxDQUFDLENBQzNFLENBQUM7SUFDRixNQUFNLGVBQWUsR0FBRyxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsZUFBZSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUM7SUFFN0QsTUFBTSxHQUFHLEdBQTRCO1FBQ25DLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLGlCQUFpQixFQUFFLHVEQUF1RDtRQUMxRSxrQkFBa0IsRUFBRSwwQkFBa0IsQ0FBQyxXQUFXO1FBQ2xELE1BQU0sRUFBRTtZQUNOO2dCQUNFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLFNBQVM7Z0JBQ2xDLE9BQU8sRUFBRTtvQkFDUCxXQUFXLEVBQUUsbUJBQW1CO2lCQUNqQztnQkFDRCxjQUFjLEVBQUUsRUFBRTthQUNuQjtZQUNEO2dCQUNFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLFNBQVM7Z0JBQ2xDLE9BQU8sRUFBRTtvQkFDUCxXQUFXLEVBQUUsK0JBQStCO2lCQUM3QztnQkFDRCxXQUFXLEVBQUU7b0JBQ1g7d0JBQ0UsV0FBVyxFQUFFLG1CQUFXLENBQUMsU0FBUzt3QkFDbEMsT0FBTyxFQUFFOzRCQUNQLFdBQVcsRUFBRSx1Q0FBdUM7eUJBQ3JEO3dCQUNELFdBQVcsRUFBRTs0QkFDWDtnQ0FDRSxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxTQUFTO2dDQUNsQyxPQUFPLEVBQUU7b0NBQ1AsV0FBVyxFQUFFLGtCQUFrQjtpQ0FDaEM7Z0NBQ0QsY0FBYyxFQUFFLGNBQWM7NkJBQy9COzRCQUNEO2dDQUNFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLFNBQVM7Z0NBQ2xDLE9BQU8sRUFBRTtvQ0FDUCxXQUFXLEVBQUUsa0JBQWtCO2lDQUNoQztnQ0FDRCxjQUFjLEVBQUUsVUFBVTs2QkFDM0I7NEJBQ0Q7Z0NBQ0UsV0FBVyxFQUFFLG1CQUFXLENBQUMsU0FBUztnQ0FDbEMsT0FBTyxFQUFFO29DQUNQLFdBQVcsRUFBRSxrQkFBa0I7aUNBQ2hDO2dDQUNELGNBQWMsRUFBRSxJQUFJOzZCQUNyQjt5QkFDRjtxQkFDRjtvQkFDRDt3QkFDRSxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxTQUFTO3dCQUNsQyxPQUFPLEVBQUU7NEJBQ1AsV0FBVyxFQUNULGdGQUFnRjt5QkFDbkY7d0JBQ0QsV0FBVyxFQUFFOzRCQUNYO2dDQUNFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLFNBQVM7Z0NBQ2xDLE9BQU8sRUFBRTtvQ0FDUCxXQUFXLEVBQUUsa0JBQWtCO2lDQUNoQztnQ0FDRCxjQUFjLEVBQUUsZUFBZSxhQUFmLGVBQWUsdUJBQWYsZUFBZSxDQUFFLFNBQVM7NkJBQzNDOzRCQUNEO2dDQUNFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLFNBQVM7Z0NBQ2xDLE9BQU8sRUFBRTtvQ0FDUCxXQUFXLEVBQUUsa0JBQWtCO2lDQUNoQztnQ0FDRCxjQUFjLEVBQUUsZUFBZSxhQUFmLGVBQWUsdUJBQWYsZUFBZSxDQUFFLE1BQU07NkJBQ3hDOzRCQUNEO2dDQUNFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLFNBQVM7Z0NBQ2xDLE9BQU8sRUFBRTtvQ0FDUCxXQUFXLEVBQUUsa0JBQWtCO2lDQUNoQztnQ0FDRCxjQUFjLEVBQUUsZUFBZSxhQUFmLGVBQWUsdUJBQWYsZUFBZSxDQUFFLE9BQU87NkJBQ3pDO3lCQUNGO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRjtLQUNvQyxDQUFDO0lBRXhDLE1BQU0sR0FBRyxHQUFHLE1BQU0sU0FBUyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7SUFDL0MsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDO0lBRTNFLE1BQU0sYUFBYSxHQUF1QztRQUN4RCxVQUFVLEVBQUUsSUFBQSxTQUFNLEdBQUU7UUFDcEIsV0FBVyxFQUFFLGlCQUFpQjtRQUM5QixtQkFBbUIsRUFBRSxTQUFTO0tBQy9CLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxJQUFJLDBEQUEwQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRTdELE1BQU0sVUFBVSxHQUFHLElBQUEsaUJBQU8sR0FBRSxDQUFDO0lBQzdCLFVBQVUsQ0FBQyxHQUFHLENBQUMscUJBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sTUFBTSxHQUFHLGNBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0MsTUFBTSxhQUFhLEdBQW1CO1FBQ3BDLFFBQVEsRUFBRSxXQUFXO1FBQ3JCLElBQUksRUFBRSxDQUFDO1FBQ1AsTUFBTTtLQUNQLENBQUM7SUFDRixNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQU0sdUJBQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQWdCLENBQUM7SUFDekUsY0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLE1BQU0sdUJBQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQztJQUN0QyxNQUFNLE9BQU8sR0FBRyxVQUFVLE9BQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUM1QyxDQUFDLENBQUMsT0FBTyxDQUNQLGdCQUFnQixPQUFPLG1HQUFtRyxDQUMzSCxDQUFDO0lBRUYsTUFBTSxTQUFTLEdBQUcsSUFBSSwrQkFBYSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDM0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTNDLE1BQU0sTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDdEMsTUFBTSxNQUFNLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFN0M7UUFDRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUMxRCxNQUFNLGlCQUFpQixHQUNyQixTQUFTO1lBQ1QsdUNBQTZCO1lBQzdCLGdDQUFnQztZQUNoQyxTQUFTO1lBQ1QsdUNBQTZCO1lBQzdCLFVBQVU7WUFDVix1Q0FBNkI7WUFDN0IsU0FBUztZQUNULHVDQUE2QjtZQUM3QixNQUFNLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxJQUFJLENBQ0osT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFDeEMsOERBQThELENBQy9ELENBQUM7UUFFRix5RUFBeUU7UUFDekUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWxCLE1BQU0sUUFBUSxHQUFHLE1BQU0sVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDM0QsTUFBTSxrQkFBa0IsR0FDdEIsU0FBUztZQUNULHVDQUE2QjtZQUM3QixnQ0FBZ0M7WUFDaEMsU0FBUztZQUNULHVDQUE2QjtZQUM3QixVQUFVO1lBQ1YsdUNBQTZCO1lBQzdCLFNBQVM7WUFDVCx1Q0FBNkI7WUFDN0IsTUFBTSxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsSUFBSSxDQUNKLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEVBQzFDLDhEQUE4RCxDQUMvRCxDQUFDO0tBQ0g7SUFFRCxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDVixDQUFDLENBQUMsQ0FBQyJ9