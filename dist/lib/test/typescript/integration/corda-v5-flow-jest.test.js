"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZGEtdjUtZmxvdy1qZXN0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdGVzdC90eXBlc2NyaXB0L2ludGVncmF0aW9uL2NvcmRhLXY1LWZsb3ctamVzdC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxREFBcUQ7QUFDckQsdUNBQXVDO0FBQ3ZDLG9EQUFvRDtBQUNwRCwwQkFBMEI7QUFDMUIsa0RBQWtEO0FBQ2xELFdBQVc7QUFDWCx1QkFBdUI7QUFDdkIsZ0JBQWdCO0FBQ2hCLGtDQUFrQztBQUNsQyw2QkFBNkI7QUFDN0IsNkNBQTZDO0FBRTdDLHNGQUFzRjtBQUN0RixXQUFXO0FBQ1gsZ0NBQWdDO0FBQ2hDLGtCQUFrQjtBQUNsQixtRUFBbUU7QUFDbkUsV0FBVztBQUNYLGdCQUFnQjtBQUNoQiwwQkFBMEI7QUFDMUIsOEVBQThFO0FBQzlFLHFEQUFxRDtBQUVyRCx3REFBd0Q7QUFDeEQsMENBQTBDO0FBRTFDLDZCQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IsaUNBQWlDO0FBQ2pDLHNDQUFzQztBQUN0QyxtQ0FBbUM7QUFDbkMsMEhBQTBIO0FBQzFILGlDQUFpQztBQUNqQyx3Q0FBd0M7QUFDeEMscUNBQXFDO0FBQ3JDLGdFQUFnRTtBQUNoRSxrQ0FBa0M7QUFDbEMsdURBQXVEO0FBQ3ZELHFDQUFxQztBQUNyQywwRUFBMEU7QUFDMUUsdUNBQXVDO0FBQ3ZDLFFBQVE7QUFDUiw0Q0FBNEM7QUFDNUMsNEJBQTRCO0FBQzVCLGtFQUFrRTtBQUNsRSxxQkFBcUI7QUFDckIsUUFBUTtBQUNSLDBEQUEwRDtBQUMxRCx1Q0FBdUM7QUFDdkMsOENBQThDO0FBQzlDLFFBQVE7QUFDUiwyQkFBMkI7QUFDM0Isc0NBQXNDO0FBQ3RDLHlDQUF5QztBQUN6QyxRQUFRO0FBQ1IsK0NBQStDO0FBQy9DLHNDQUFzQztBQUN0QyxnRUFBZ0U7QUFDaEUsbURBQW1EO0FBQ25ELDhCQUE4QjtBQUM5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