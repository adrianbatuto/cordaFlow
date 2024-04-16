"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-extended");
const internal_ip_1 = require("internal-ip");
const cactus_test_tooling_1 = require("@hyperledger/cactus-test-tooling");
const cactus_test_tooling_2 = require("@hyperledger/cactus-test-tooling");
const index_1 = require("../../../main/typescript/generated/openapi/typescript-axios/index");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const testCase = "Tests are passing on the JVM side";
const logLevel = "TRACE";
describe(testCase, () => {
    let connector;
    const ledger = new cactus_test_tooling_1.CordaTestLedger({
        imageName: "ghcr.io/hyperledger/cactus-corda-4-6-all-in-one-obligation",
        imageVersion: "2021-03-19-feat-686",
        logLevel,
    });
    beforeAll(async () => {
        const pruning = (0, cactus_test_tooling_1.pruneDockerAllIfGithubAction)({ logLevel });
        await cactus_test_tooling_1.Containers.logDiagnostics({ logLevel }); //this was in the onFailure
        await expect(pruning).resolves.toBeTruthy();
    });
    afterAll(async () => {
        await ledger.stop();
        await ledger.destroy();
        await (0, cactus_test_tooling_1.pruneDockerAllIfGithubAction)({ logLevel });
        try {
            await connector.stop();
        }
        finally {
            await connector.destroy();
        }
    });
    test(testCase, async () => {
        expect(ledger).toBeTruthy();
        const ledgerContainer = await ledger.start();
        expect(ledgerContainer).toBeTruthy();
        await ledger.logDebugPorts();
        const partyARpcPort = await ledger.getRpcAPublicPort();
        const jarFiles = await ledger.pullCordappJars("ADVANCED_OBLIGATION" /* SampleCordappEnum.ADVANCED_OBLIGATION */);
        console.log(`Fetched ${jarFiles.length} cordapp jars OK`);
        const internalIpOrUndefined = await (0, internal_ip_1.v4)();
        expect(internalIpOrUndefined).toBeTruthy();
        const internalIp = internalIpOrUndefined;
        console.log(`Internal IP (based on default gateway): ${internalIp}`);
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
        console.log(envVarSpringAppJson);
        connector = new cactus_test_tooling_2.CordaConnectorContainer({
            logLevel,
            imageName: "ghcr.io/hyperledger/cactus-connector-corda-server",
            imageVersion: "2021-11-23--feat-1493",
            envVars: [envVarSpringAppJson],
        });
        expect(cactus_test_tooling_2.CordaConnectorContainer).toBeTruthy();
        const connectorContainer = await connector.start();
        expect(connectorContainer).toBeTruthy();
        await connector.logDebugPorts();
        const apiUrl = await connector.getApiLocalhostUrl();
        const config = new cactus_core_api_1.Configuration({ basePath: apiUrl });
        const apiClient = new index_1.DefaultApi(config);
        const flowsRes = await apiClient.listFlowsV1();
        expect(flowsRes.status).toEqual(200);
        expect(flowsRes.data).toBeTruthy();
        expect(flowsRes.data.flowNames).toBeTruthy();
        console.log(`apiClient.listFlowsV1() => ${JSON.stringify(flowsRes.data)}`);
        const diagRes = await apiClient.diagnoseNodeV1();
        expect(diagRes.status).toEqual(200);
        expect(diagRes.data).toBeTruthy();
        expect(diagRes.data.nodeDiagnosticInfo).toBeTruthy();
        const ndi = diagRes.data.nodeDiagnosticInfo;
        expect(ndi.cordapps).toBeTruthy();
        expect(Array.isArray(ndi.cordapps)).toBeTruthy();
        expect(ndi.cordapps.length > 0).toBeTrue();
        expect(ndi.vendor).toBeTruthy();
        expect(ndi.version).toBeTruthy();
        expect(ndi.revision).toBeTruthy();
        expect(ndi.platformVersion).toBeTruthy();
        console.log(`apiClient.diagnoseNodeV1() => ${JSON.stringify(diagRes.data)}`);
        const cordappDeploymentConfigs = [];
        const depReq = {
            jarFiles,
            cordappDeploymentConfigs,
        };
        const depRes = await apiClient.deployContractJarsV1(depReq);
        expect(depRes).toBeTruthy();
        expect(depRes.status).toEqual(200);
        expect(depRes.data).toBeTruthy();
        expect(depRes.data.deployedJarFiles).toBeTruthy();
        expect(depRes.data.deployedJarFiles.length).toEqual(jarFiles.length);
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
        expect(res).toBeTruthy();
        expect(res.status).toEqual(200);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianZtLWtvdGxpbi1zcHJpbmctc2VydmVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdGVzdC90eXBlc2NyaXB0L2ludGVncmF0aW9uL2p2bS1rb3RsaW4tc3ByaW5nLXNlcnZlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUJBQXVCO0FBQ3ZCLDZDQUFpRDtBQUVqRCwwRUFJMEM7QUFFMUMsMEVBRzBDO0FBRTFDLDZGQU8yRTtBQUMzRSxrRUFBNkQ7QUFFN0QsTUFBTSxRQUFRLEdBQUcsbUNBQW1DLENBQUM7QUFDckQsTUFBTSxRQUFRLEdBQWlCLE9BQU8sQ0FBQztBQUV2QyxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtJQUN0QixJQUFJLFNBQWMsQ0FBQztJQUVuQixNQUFNLE1BQU0sR0FBRyxJQUFJLHFDQUFlLENBQUM7UUFDakMsU0FBUyxFQUFFLDREQUE0RDtRQUN2RSxZQUFZLEVBQUUscUJBQXFCO1FBQ25DLFFBQVE7S0FDVCxDQUFDLENBQUM7SUFFSCxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDbkIsTUFBTSxPQUFPLEdBQUcsSUFBQSxrREFBNEIsRUFBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0QsTUFBTSxnQ0FBVSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQywyQkFBMkI7UUFDMUUsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2xCLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BCLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sSUFBQSxrREFBNEIsRUFBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFD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