"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape-promise/tape"));
const internal_ip_1 = require("internal-ip");
const cactus_test_tooling_1 = require("@hyperledger/cactus-test-tooling");
const cactus_test_tooling_2 = require("@hyperledger/cactus-test-tooling");
const index_1 = require("../../../main/typescript/generated/openapi/typescript-axios/index");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const testCase = "Tests are passing on the JVM side";
const logLevel = "TRACE";
tape_1.default.onFailure(async () => {
    await cactus_test_tooling_1.Containers.logDiagnostics({ logLevel });
});
(0, tape_1.default)("BEFORE " + testCase, async (t) => {
    const pruning = (0, cactus_test_tooling_1.pruneDockerAllIfGithubAction)({ logLevel });
    await t.doesNotReject(pruning, "Pruning didn't throw OK");
    t.end();
});
(0, tape_1.default)(testCase, async (t) => {
    const ledger = new cactus_test_tooling_1.CordaTestLedger({
        imageName: "ghcr.io/hyperledger/cactus-corda-4-7-all-in-one-obligation",
        imageVersion: "2021-08-19--feat-888",
        logLevel,
    });
    t.ok(ledger, "CordaTestLedger instantaited OK");
    tape_1.default.onFinish(async () => {
        await ledger.stop();
        await ledger.destroy();
        await (0, cactus_test_tooling_1.pruneDockerAllIfGithubAction)({ logLevel });
    });
    const ledgerContainer = await ledger.start();
    t.ok(ledgerContainer, "CordaTestLedger container truthy post-start() OK");
    await ledger.logDebugPorts();
    const partyARpcPort = await ledger.getRpcAPublicPort();
    const jarFiles = await ledger.pullCordappJars("ADVANCED_OBLIGATION" /* SampleCordappEnum.ADVANCED_OBLIGATION */);
    t.comment(`Fetched ${jarFiles.length} cordapp jars OK`);
    const internalIpOrUndefined = await (0, internal_ip_1.v4)();
    t.ok(internalIpOrUndefined, "Determined LAN IPv4 address successfully OK");
    const internalIp = internalIpOrUndefined;
    t.comment(`Internal IP (based on default gateway): ${internalIp}`);
    const springAppConfig = {
        logging: {
            level: {
                root: "INFO",
                "org.hyperledger.cactus": "DEBUG",
            },
        },
        cactus: {
            corda: {
                node: { host: internalIp },
                // TODO: parse the gradle build files to extract the credentials?
                rpc: { port: partyARpcPort, username: "user1", password: "password" },
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
    const flowsRes = await apiClient.listFlowsV1();
    t.ok(flowsRes.status === 200, "flowsRes.status === 200 OK");
    t.ok(flowsRes.data, "flowsRes.data truthy OK");
    t.ok(flowsRes.data.flowNames, "flowsRes.data.flowNames truthy OK");
    t.comment(`apiClient.listFlowsV1() => ${JSON.stringify(flowsRes.data)}`);
    const diagRes = await apiClient.diagnoseNodeV1();
    t.ok(diagRes.status === 200, "diagRes.status === 200 OK");
    t.ok(diagRes.data, "diagRes.data truthy OK");
    t.ok(diagRes.data.nodeDiagnosticInfo, "nodeDiagnosticInfo truthy OK");
    const ndi = diagRes.data.nodeDiagnosticInfo;
    t.ok(ndi.cordapps, "ndi.cordapps truthy OK");
    t.ok(Array.isArray(ndi.cordapps), "ndi.cordapps is Array truthy OK");
    t.true(ndi.cordapps.length > 0, "ndi.cordapps non-empty true OK");
    t.ok(ndi.vendor, "ndi.vendor truthy OK");
    t.ok(ndi.version, "ndi.version truthy OK");
    t.ok(ndi.revision, "ndi.revision truthy OK");
    t.ok(ndi.platformVersion, "ndi.platformVersion truthy OK");
    t.comment(`apiClient.diagnoseNodeV1() => ${JSON.stringify(diagRes.data)}`);
    const cordappDeploymentConfigs = [];
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
    const networkMapRes = await apiClient.networkMapV1();
    const partyA = networkMapRes.data.find((it) => it.legalIdentities.some((it2) => it2.name.organisation === "ParticipantA"));
    const partyAPublicKey = partyA === null || partyA === void 0 ? void 0 : partyA.legalIdentities[0].owningKey;
    const partyB = networkMapRes.data.find((it) => it.legalIdentities.some((it2) => it2.name.organisation === "ParticipantB"));
    const partyBPublicKey = partyB === null || partyB === void 0 ? void 0 : partyB.legalIdentities[0].owningKey;
    const req = {
        flowFullClassName: "net.corda.samples.obligation.flows.IOUIssueFlow",
        flowInvocationType: index_1.FlowInvocationType.TrackedFlowDynamic,
        params: [
            {
                jvmTypeKind: index_1.JvmTypeKind.Reference,
                jvmType: {
                    fqClassName: "net.corda.samples.obligation.states.IOUState",
                },
                jvmCtorArgs: [
                    {
                        jvmTypeKind: index_1.JvmTypeKind.Reference,
                        jvmType: {
                            fqClassName: "net.corda.core.contracts.Amount",
                        },
                        jvmCtorArgs: [
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "long",
                                },
                                primitiveValue: 42,
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Reference,
                                jvmType: {
                                    fqClassName: "java.util.Currency",
                                    constructorName: "getInstance",
                                },
                                jvmCtorArgs: [
                                    {
                                        jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                        jvmType: {
                                            fqClassName: "java.lang.String",
                                        },
                                        primitiveValue: "USD",
                                    },
                                ],
                            },
                        ],
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
                                        primitiveValue: "ParticipantA",
                                    },
                                    {
                                        jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                        jvmType: {
                                            fqClassName: "java.lang.String",
                                        },
                                        primitiveValue: "London",
                                    },
                                    {
                                        jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                        jvmType: {
                                            fqClassName: "java.lang.String",
                                        },
                                        primitiveValue: "GB",
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
                                        primitiveValue: partyAPublicKey === null || partyAPublicKey === void 0 ? void 0 : partyAPublicKey.algorithm,
                                    },
                                    {
                                        jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                        jvmType: {
                                            fqClassName: "java.lang.String",
                                        },
                                        primitiveValue: partyAPublicKey === null || partyAPublicKey === void 0 ? void 0 : partyAPublicKey.format,
                                    },
                                    {
                                        jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                        jvmType: {
                                            fqClassName: "java.lang.String",
                                        },
                                        primitiveValue: partyAPublicKey === null || partyAPublicKey === void 0 ? void 0 : partyAPublicKey.encoded,
                                    },
                                ],
                            },
                        ],
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
                    {
                        jvmTypeKind: index_1.JvmTypeKind.Reference,
                        jvmType: {
                            fqClassName: "net.corda.core.contracts.Amount",
                        },
                        jvmCtorArgs: [
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "long",
                                },
                                primitiveValue: 1,
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Reference,
                                jvmType: {
                                    fqClassName: "java.util.Currency",
                                    constructorName: "getInstance",
                                },
                                jvmCtorArgs: [
                                    {
                                        jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                        jvmType: {
                                            fqClassName: "java.lang.String",
                                        },
                                        primitiveValue: "USD",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        jvmTypeKind: index_1.JvmTypeKind.Reference,
                        jvmType: {
                            fqClassName: "net.corda.core.contracts.UniqueIdentifier",
                        },
                        jvmCtorArgs: [
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: "7fc2161e-f8d0-4c86-a596-08326bdafd56",
                            },
                        ],
                    },
                ],
            },
        ],
        timeoutMs: 60000,
    };
    const res = await apiClient.invokeContractV1(req);
    t.ok(res, "InvokeContractV1Request truthy OK");
    t.equal(res.status, 200, "InvokeContractV1Request status code === 200 OK");
    t.end();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianZtLWtvdGxpbi1zcHJpbmctc2VydmVyLXY0LjcudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90ZXN0L3R5cGVzY3JpcHQvaW50ZWdyYXRpb24vanZtLWtvdGxpbi1zcHJpbmctc2VydmVyLXY0LjcudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZEQUErQztBQUMvQyw2Q0FBaUQ7QUFFakQsMEVBSTBDO0FBRTFDLDBFQUcwQztBQUUxQyw2RkFPMkU7QUFDM0Usa0VBQTZEO0FBRTdELE1BQU0sUUFBUSxHQUFHLG1DQUFtQyxDQUFDO0FBQ3JELE1BQU0sUUFBUSxHQUFpQixPQUFPLENBQUM7QUFFdkMsY0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksRUFBRTtJQUN4QixNQUFNLGdDQUFVLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNoRCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUEsY0FBSSxFQUFDLFNBQVMsR0FBRyxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQU8sRUFBRSxFQUFFO0lBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUEsa0RBQTRCLEVBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzNELE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUseUJBQXlCLENBQUMsQ0FBQztJQUMxRCxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDVixDQUFDLENBQUMsQ0FBQztBQUVILElBQUEsY0FBSSxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBTyxFQUFFLEVBQUU7SUFDL0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQ0FBZSxDQUFDO1FBQ2pDLFNBQVMsRUFBRSw0REFBNEQ7UUFDdkUsWUFBWSxFQUFFLHNCQUFzQjtRQUNwQyxRQUFRO0tBQ1QsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUs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