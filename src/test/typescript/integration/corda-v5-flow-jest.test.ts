// // import test, { Test } from "tape-promise/tape";
// import { v4 as uuidv4 } from "uuid";
// import { v4 as internalIpV4 } from "internal-ip";
// import "jest-extended";
// import { Config as SshConfig } from "node-ssh";
// import {
//   CordaV5TestLedger,
//   Containers,
//   pruneDockerAllIfGithubAction,
//   CordaConnectorContainer,
// } from "@hyperledger/cactus-test-tooling";

// import { IListenOptions, LogLevelDesc, Servers } from "@hyperledger/cactus-common";
// import {
//   PluginLedgerConnectorCorda,
//   CordaVersion,
// } from "../../../main/typescript/plugin-ledger-connector-corda";
// import {
//   DefaultApi,
//   FlowStatusV5Response,
// } from "../../../main/typescript/generated/openapi/typescript-axios/index";
// import axios, { AxiosRequestConfig } from "axios";

// const testCase = "Tests are passing on the JVM side";
// const logLevel: LogLevelDesc = "TRACE";

// import https from "https";
// import exp from "constants";
// import { check } from "yargs";
// import { response } from "express";
// import { interval } from "rxjs";
// import { extractShortHash } from "./../../../../../cactus-test-tooling/src/main/typescript/corda/corda-v5-test-ledger";
// import express from "express";
// import bodyParser from "body-parser";
// import { AddressInfo } from "net";
// import { Configuration } from "@hyperledger/cactus-core-api";
// describe("Corda Setup", () => {
//   const cordaV5TestLedger = new CordaV5TestLedger();
//   test("On Failure", async () => {
//     const logDiagnosticsSpy = jest.spyOn(Containers, "logDiagnostics");
//     console.log("checking failure");
//   });
//   expect(cordaV5TestLedger).toBeTruthy();
//   beforeAll(async () => {
//     const pruning = pruneDockerAllIfGithubAction({ logLevel });
//     await pruning;
//   });
//   test("can get past logs of an account", async () => {
//     await cordaV5TestLedger.start();
//     expect(cordaV5TestLedger).toBeTruthy();
//   });
//   afterAll(async () => {
//     await cordaV5TestLedger.stop();
//     await cordaV5TestLedger.destroy();
//   });
//   let connector: PluginLedgerConnectorCorda;
//   it("Get sshConfig", async () => {
//     const sshConfig = await cordaV5TestLedger.getSshConfig();
//     connector = new PluginLedgerConnectorCorda({
//       instanceId: uuidv4(),
//       sshConfigAdminShell: sshConfig,
//       corDappsDir: "",
//       logLevel,
//       cordaVersion: CordaVersion.CORDA_V5,
//       apiUrl: "https://127.0.0.1:8888",
//     });
//   });
//   const apiUrl = "https://127.0.0.1:8888";
//   it("Get or Create Web Services", async () => {
//     await connector.getOrCreateWebServices();
//   });
//   const customHttpsAgent = new https.Agent({
//     // Configure your custom settings here
//     rejectUnauthorized: false, // Example: Allow self-signed certificates (use with caution)
//   });
//   const username = "admin";
//   const password = "admin";
//   const axiosConfig: AxiosRequestConfig = {
//     baseURL: apiUrl,
//     headers: {
//       Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
//         "base64",
//       )}`,
//     },
//     httpsAgent: customHttpsAgent,
//   };
//   const axiosInstance = axios.create(axiosConfig);
//   const apiClient = new DefaultApi(undefined, apiUrl, axiosInstance);
//   let shortHashID: string;
//   it("Get container", async () => {
//     const container = cordaV5TestLedger.getContainer();
//     const cmd = ["./gradlew", "listVNodes"];
//     const timeout = 180000; // 3 minutes
//     const cwd = "/CSDE-cordapp-template-kotlin";
//     shortHashID = await Containers.exec(container, cmd, timeout, logLevel, cwd);
//   });

//   describe("Endpoint Testing", () => {
//     let shortHashAlice = "";
//     let shortHashBob = "";
//     let shortHashCharlie = "";
//     let shortHashDave = "";
//     it("Extract short hash for Alice", () => {
//       shortHashAlice = extractShortHash(shortHashID, "Alice");
//       expect(shortHashAlice).toBeTruthy();
//       expect(`Short hash ID for Alice: ${shortHashAlice}`).toMatch(
//         /Short hash ID for Alice:/,
//       );
//       console.log(`Short hash ID for Alice: ${shortHashAlice}`);
//     });
//     it("Extract short hash for Bob", () => {
//       shortHashBob = extractShortHash(shortHashID, "Bob");
//       expect(shortHashBob).toBeTruthy();
//       expect(`Short hash ID for Bob: ${shortHashBob}`).toMatch(
//         /Short hash ID for Bob:/,
//       );
//       console.log(`Short hash ID for Bob: ${shortHashBob}`);
//     });
//     it("Extract short hash for Charlie", () => {
//       shortHashCharlie = extractShortHash(shortHashID, "Charlie");
//       expect(typeof shortHashCharlie === "string").toBe(true);
//       expect(shortHashCharlie).toBeTruthy();
//       expect(`Short hash ID for Charlie: ${shortHashCharlie}`).toMatch(
//         /Short hash ID for Charlie:/,
//       );
//       console.log(`Short hash ID for Charlie: ${shortHashCharlie}`);
//     });
//     it("Extract short hash for Dave", () => {
//       shortHashDave = extractShortHash(shortHashID, "Dave");
//       expect(shortHashDave).toBeTruthy();
//       expect(`Short hash ID for Dave: ${shortHashDave}`).toMatch(
//         /Short hash ID for Dave:/,
//       );
//       console.log(`Short hash ID for Dave: ${shortHashDave}`);
//     });

//     it("Endpoints initial test", async () => {
//       const request = {
//         clientRequestId: "test-1",
//         flowClassName:
//           "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
//         requestBody: {
//           chatName: "Test-1",
//           otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
//           message: "Testing",
//         },
//       };
//       const listCPI = await apiClient.listCPIV1();
//       expect(listCPI).toBeTruthy();
//       const startflow = await apiClient.startFlowParameters(
//         shortHashCharlie,
//         request,
//       );
//       expect(startflow).toBeTruthy();

//       const test1Response = await pollEndpointUntilCompleted(
//         shortHashCharlie,
//         "test-1",
//       );
//       expect(test1Response).toBeTruthy();
//     });

//     it("Simulate conversation between Alice and Bob", async () => {
//       //1. Alice creates a new chat
//       const aliceCreateChat = {
//         clientRequestId: "create-1",
//         flowClassName:
//           "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
//         requestBody: {
//           chatName: "Chat with Bob",
//           otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
//           message: "Hello Bob",
//         },
//       };
//       let startflowChat = await apiClient.startFlowParameters(
//         shortHashAlice,
//         aliceCreateChat,
//       );
//       expect(startflowChat).toBeTruthy();
//       const aliceCreateResponse = await pollEndpointUntilCompleted(
//         shortHashAlice,
//         "create-1",
//       );
//       expect(aliceCreateResponse).toBeTruthy();

//       //2. Bob lists his chats
//       const bobListChats = {
//         clientRequestId: "list-1",
//         flowClassName:
//           "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
//         requestBody: {},
//       };
//       startflowChat = await apiClient.startFlowParameters(
//         shortHashBob,
//         bobListChats,
//       );
//       expect(startflowChat).toBeTruthy();
//       const flowData = await pollEndpointUntilCompleted(shortHashBob, "list-1");
//       expect(flowData).toBeTruthy();
//       const flowResult =
//         flowData !== null && flowData !== undefined
//           ? flowData.flowResult
//           : null;
//       const chatWithBobId = (() => {
//         if (typeof flowResult === "string") {
//           const parseFlowResult = JSON.parse(flowResult);
//           const chatWithBobObj = parseFlowResult.find(
//             (item: { chatName: string }) => item.chatName === "Chat with Bob",
//           );
//           return chatWithBobObj && "id" in chatWithBobObj
//             ? chatWithBobObj.id
//             : undefined;
//         }
//       })();
//       // //3. Bob updates chat twice
//       const bobUpdate1 = {
//         clientRequestId: "update-1",
//         flowClassName:
//           "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
//         requestBody: {
//           id: chatWithBobId,
//           message: "Hi Alice",
//         },
//       };
//       await apiClient.startFlowParameters(shortHashBob, bobUpdate1);
//       const bobUpdate1Response = await pollEndpointUntilCompleted(
//         shortHashBob,
//         "update-1",
//       );
//       expect(bobUpdate1Response).toBeTruthy();

//       const bobUpdate2 = {
//         clientRequestId: "update-2",
//         flowClassName:
//           "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
//         requestBody: {
//           id: chatWithBobId,
//           message: "How are you today?",
//         },
//       };
//       await apiClient.startFlowParameters(shortHashBob, bobUpdate2);

//       const bobUpdate2Response = await pollEndpointUntilCompleted(
//         shortHashBob,
//         "update-2",
//       );
//       expect(bobUpdate2Response).toBeTruthy();

//       //4. Alice lists chat
//       const aliceListsChat = {
//         clientRequestId: "list-2",
//         flowClassName:
//           "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
//         requestBody: {},
//       };
//       await apiClient.startFlowParameters(shortHashAlice, aliceListsChat);
//       const aliceList2Response = await pollEndpointUntilCompleted(
//         shortHashAlice,
//         "list-2",
//       );
//       expect(aliceList2Response).toBeTruthy();

//       //5. Alice checks the history of the chat with Bob
//       const aliceHistoryRequest = {
//         clientRequestId: "get-1",
//         flowClassName:
//           "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
//         requestBody: {
//           id: chatWithBobId,
//           numberOfRecords: "4",
//         },
//       };
//       await apiClient.startFlowParameters(shortHashAlice, aliceHistoryRequest);

//       const aliceHistoryResponse = await pollEndpointUntilCompleted(
//         shortHashAlice,
//         "get-1",
//       );
//       expect(aliceHistoryResponse).toBeTruthy();

//       //6. Alice replies to Bob
//       const aliceReply = {
//         clientRequestId: "update-4",
//         flowClassName:
//           "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
//         requestBody: {
//           id: chatWithBobId,
//           message: "I am very well thank you",
//         },
//       };

//       await apiClient.startFlowParameters(shortHashAlice, aliceReply);
//       const aliceReplyResponse = await pollEndpointUntilCompleted(
//         shortHashAlice,
//         "update-4",
//       );
//       expect(aliceReplyResponse).toBeTruthy();

//       //7. Bob gets the chat history
//       const bobHistoryRequest = {
//         clientRequestId: "get-2",
//         flowClassName:
//           "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
//         requestBody: {
//           id: chatWithBobId,
//           numberOfRecords: "2",
//         },
//       };
//       await apiClient.startFlowParameters(shortHashBob, bobHistoryRequest);

//       const bobHistoryResponse = await pollEndpointUntilCompleted(
//         shortHashBob,
//         "get-2",
//       );
//       expect(bobHistoryResponse).toBeTruthy();
//     });

//     describe("Negative Testing", () => {
//       it("Invalid username and password", async () => {
//         const apiUrl = "https://127.0.0.1:8888";
//         const username = "invalidUsername";
//         const password = "invalidPassword";
//         const axiosConfig: AxiosRequestConfig = {
//           baseURL: apiUrl,
//           headers: {
//             Authorization: `Basic ${Buffer.from(
//               `${username}:${password}`,
//               "base64",
//             )}`,
//           },
//         };
//         const axiosInstance = axios.create(axiosConfig);
//         const apiClient = new DefaultApi(undefined, apiUrl, axiosInstance);
//         try {
//           await apiClient.listCPIV1();
//           fail("Expected an error for unauthorized access but it succeeded.");
//         } catch (error) {
//           expect(error).toBeDefined();
//           expect(error.message).toContain("Invalid");
//         }
//       });
//       it("Negative Test, invalid flow class name", async () => {
//         const invalidFlowName = "nonExistentFlow";
//         const shortHash = shortHashBob;
//         const request = {
//           clientRequestId: "test-1",
//           flowClassName: invalidFlowName,
//           requestBody: {
//             chatName: "Test-1",
//             otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
//             message: "Testing",
//           },
//         };
//         try {
//           await apiClient.startFlowParameters(shortHash, request);
//           fail("Expected an error for unauthorized access but it succeeded.");
//         } catch (error) {
//           expect(error).toBeDefined();
//           expect(error.message).toContain("Request failed");
//         }
//       });
//     });
//   });

//   async function pollEndpointUntilCompleted(
//     shortHash: string,
//     chatName: string,
//     interval = 5000,
//     maxAttempts = 10,
//   ) {
//     return new Promise<FlowStatusV5Response>(async (resolve, reject) => {
//       let attempts = 0;

//       async function poll() {
//         attempts++;

//         try {
//           const response = await apiClient.flowStatusResponse(
//             shortHash,
//             chatName,
//           );
//           if (response.status === 200) {
//             if (response.data.flowStatus === "COMPLETED") {
//               resolve(response.data);
//             } else {
//               setTimeout(poll, interval);
//             }
//           } else if (attempts < maxAttempts) {
//             setTimeout(poll, interval);
//           } else {
//             reject(
//               new Error(
//                 `Max attempts (${maxAttempts}) reached. Unable to get status 200.`,
//               ),
//             );
//           }
//         } catch (error) {
//           setTimeout(poll, interval);
//         }
//       }
//       poll();
//     });
//   }
// });
