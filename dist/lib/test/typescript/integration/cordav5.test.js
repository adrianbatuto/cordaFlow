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
// import { IListenOptions, LogLevelDesc, LoggerProvider, Servers } from "@hyperledger/cactus-common";
// import {
//   PluginLedgerConnectorCorda,
//   CordaVersion,
// } from "../../../main/typescript/plugin-ledger-connector-corda";
// import {
//   DefaultApi as CordaApi,
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
// describe(testCase, () => {
//   const expressApp = express();
//   expressApp.use(bodyParser.json({ limit: "250mb" }));
//   const server = https.createServer(expressApp);
//   const logLevel: LogLevelDesc = "TRACE";
//   const level = "INFO";
//   const label = "corda run flow transaction test";
//   const log = LoggerProvider.getOrCreate({ level, label });
//   const ledger = new CordaV5TestLedger();
//   let addressInfo,
//     address: string,
//     port: number,
//     apiHost,
//     apiConfig,
//     apiClient: CordaApi;
//   expect(ledger).toBeTruthy();
//   beforeAll(async () => {
//     const pruning = pruneDockerAllIfGithubAction({ logLevel });
//     await expect(pruning).resolves.toBeTruthy();
//   });
//   afterAll(async () => {
//     await ledger.stop();
//     await ledger.destroy();
//   });
//   afterAll(async () => await Servers.shutdown(server));
//   afterAll(async () => {
//     await Containers.logDiagnostics({ logLevel });
//   });
//   afterAll(async () => {
//     const pruning = pruneDockerAllIfGithubAction({ logLevel });
//     await expect(pruning).resolves.toBeTruthy();
//   });
//   beforeAll(async () => {
//     await ledger.start();
//     const listenOptions: IListenOptions = {
//       hostname: "127.0.0.1",
//       port: 0,
//       server,
//     };
//     addressInfo = (await Servers.listen(listenOptions)) as AddressInfo;
//     ({ address, port } = addressInfo);
//     apiHost = `http://${address}:${port}`;
//     apiConfig = new Configuration({ basePath: apiHost });
//     apiClient = new CordaApi(apiConfig);
//   });
//   test(testCase, async () => {
//     const sshConfig = await ledger.getSshConfig();
//     const plugin = new PluginLedgerConnectorCorda({
//       instanceId: uuidv4(),
//       sshConfigAdminShell: sshConfig,
//       corDappsDir: "",
//       logLevel,
//       cordaVersion: CordaVersion.CORDA_V5,
//       apiUrl: "https://127.0.0.1:8888",
//     });
//     await plugin.getOrCreateWebServices();
//     await plugin.registerWebServices(expressApp);
//     const customHttpsAgent = new https.Agent({
//       // Configure your custom settings here
//       rejectUnauthorized: false, // Example: Allow self-signed certificates (use with caution)
//     });
//   });
//   test("Endpoint Testing", async () => {
//     const container = ledger.getContainer();
//     const cmd = ["./gradlew", "listVNodes"];
//     const timeout = 180000; // 3 minutes
//     const cwd = "/CSDE-cordapp-template-kotlin";
//     let shortHashID = await Containers.exec(
//       container,
//       cmd,
//       timeout,
//       logLevel,
//       cwd,
//     );
//     let shortHashAlice = "";
//     let shortHashBob = "";
//     let shortHashCharlie = "";
//     let shortHashDave = "";
//     shortHashAlice = extractShortHash(shortHashID, "Alice");
//     expect(shortHashAlice).toBeTruthy();
//     expect(`Short hash ID for Alice: ${shortHashAlice}`).toMatch(
//       /Short hash ID for Alice:/,
//     );
//     console.log(`Short hash ID for Alice: ${shortHashAlice}`);
//     shortHashBob = extractShortHash(shortHashID, "Bob");
//     expect(shortHashBob).toBeTruthy();
//     expect(`Short hash ID for Bob: ${shortHashBob}`).toMatch(
//       /Short hash ID for Bob:/,
//     );
//     console.log(`Short hash ID for Bob: ${shortHashBob}`);
//     shortHashCharlie = extractShortHash(shortHashID, "Charlie");
//     expect(typeof shortHashCharlie === "string").toBe(true);
//     expect(shortHashCharlie).toBeTruthy();
//     expect(`Short hash ID for Charlie: ${shortHashCharlie}`).toMatch(
//       /Short hash ID for Charlie:/,
//     );
//     console.log(`Short hash ID for Charlie: ${shortHashCharlie}`);
//     shortHashDave = extractShortHash(shortHashID, "Dave");
//     expect(shortHashDave).toBeTruthy();
//     expect(`Short hash ID for Dave: ${shortHashDave}`).toMatch(
//       /Short hash ID for Dave:/,
//     );
//     console.log(`Short hash ID for Dave: ${shortHashDave}`);
//     const listCPI = await apiClient.listCPIV1();
//     expect(listCPI).toBeTruthy();
//   });
// });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZGF2NS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Rlc3QvdHlwZXNjcmlwdC9pbnRlZ3JhdGlvbi9jb3JkYXY1LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFEQUFxRDtBQUNyRCx1Q0FBdUM7QUFDdkMsb0RBQW9EO0FBQ3BELDBCQUEwQjtBQUMxQixrREFBa0Q7QUFDbEQsV0FBVztBQUNYLHVCQUF1QjtBQUN2QixnQkFBZ0I7QUFDaEIsa0NBQWtDO0FBQ2xDLDZCQUE2QjtBQUM3Qiw2Q0FBNkM7QUFFN0Msc0dBQXNHO0FBQ3RHLFdBQVc7QUFDWCxnQ0FBZ0M7QUFDaEMsa0JBQWtCO0FBQ2xCLG1FQUFtRTtBQUNuRSxXQUFXO0FBQ1gsNEJBQTRCO0FBQzVCLDBCQUEwQjtBQUMxQiw4RUFBOEU7QUFDOUUscURBQXFEO0FBRXJELHdEQUF3RDtBQUN4RCwwQ0FBMEM7QUFFMUMsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFDakMsc0NBQXNDO0FBQ3RDLG1DQUFtQztBQUNuQywwSEFBMEg7QUFDMUgsaUNBQWlDO0FBQ2pDLHdDQUF3QztBQUN4QyxxQ0FBcUM7QUFDckMsZ0VBQWdFO0FBRWhFLDZCQUE2QjtBQUM3QixrQ0FBa0M7QUFDbEMseURBQXlEO0FBQ3pELG1EQUFtRDtBQUNuRCw0Q0FBNEM7QUFDNUMsMEJBQTBCO0FBQzFCLHFEQUFxRDtBQUNyRCw4REFBOEQ7QUFDOUQsNENBQTRDO0FBQzVDLHFCQUFxQjtBQUNyQix1QkFBdUI7QUFDdkIsb0JBQW9CO0FBQ3BCLGVBQWU7QUFDZixpQkFBaUI7QUFDakIsMkJBQTJCO0FBQzNCLGlDQUFpQztBQUNqQyw0QkFBNEI7QUFDNUIsa0VBQWtFO0FBQ2xFLG1EQUFtRDtBQUNuRCxRQUFRO0FBQ1IsMkJBQTJCO0FBQzNCLDJCQUEyQjtBQUMzQiw4QkFBOEI7QUFDOUIsUUFBUTtBQUNSLDBEQUEwRDtBQUUxRCwyQkFBMkI7QUFDM0IscURBQXFEO0FBQ3JELFFBQVE7QUFDUiwyQkFBMkI7QUFDM0Isa0VBQWtFO0FBQ2xFLG1EQUFtRDtBQUNuRCxRQUFRO0FBQ1IsNEJBQTRCO0FBQzVCLDRCQUE0QjtBQUM1Qiw4Q0FBOEM7QUFDOUMsK0JBQStCO0FBQy9CLGlCQUFpQjtBQUNqQixnQkFBZ0I7QUFDaEIsU0FBUztBQUNULDBFQUEwRTtBQUMxRSx5Q0FBeUM7QUFDekMsNkNBQTZDO0FBQzdDLDREQUE0RDtBQUM1RCwyQ0FBMkM7QUFDM0MsUUFBUTtBQUVSLGlDQUFpQztBQUNqQyxxREFBcUQ7QUFDckQsc0RBQXNEO0FBQ3RELDhCQUE4QjtBQUM5Qix3Q0FBd0M7QUFDeEMseUJBQXlCO0FBQ3pCLGtCQUFrQjtBQUNsQiw2Q0FBNkM7QUFDN0MsMENBQTBDO0FBQzFDLFVBQVU7QUFDViw2Q0FBNkM7QUFDN0Msb0RBQW9EO0FBQ3BELGlEQUFpRDtBQUNqRCwrQ0FBK0M7QUFDL0MsaUdBQWlHO0FBQ2pHLFVBQVU7QUFDVixRQUFRO0FBQ1IsMkNBQTJDO0FBQzNDLCtDQUErQztBQUMvQywrQ0FBK0M7QUFDL0MsMkNBQTJDO0FBQzNDLG1EQUFtRDtBQUNuRCwrQ0FBK0M7QUFDL0MsbUJBQW1CO0FBQ25CLGFBQWE7QUFDYixpQkFBaUI7QUFDakIsa0JBQWtCO0FBQ2xCLGFBQWE7QUFDYixTQUFTO0FBRVQsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixpQ0FBaUM7QUFDakMsOEJBQThCO0FBRTlCLCtEQUErRDtBQUMvRCwyQ0FBMkM7QUFDM0Msb0VBQW9FO0FBQ3BFLG9DQUFvQztBQUNwQyxTQUFTO0FBQ1QsaUVBQWlFO0FBRWpFLDJEQUEyRDtBQUMzRCx5Q0FBeUM7QUFDekMsZ0VBQWdFO0FBQ2hFLGtDQUFrQztBQUNsQyxTQUFTO0FBQ1QsNkRBQTZEO0FBRTdELG1FQUFtRTtBQUNuRSwrREFBK0Q7QUFDL0QsNkNBQTZDO0FBQzdDLHdFQUF3RTtBQUN4RSxzQ0FBc0M7QUFDdEMsU0FBUztBQUNULHFFQUFxRTtBQUVyRSw2REFBNkQ7QUFDN0QsMENBQTBDO0FBQzFDLGtFQUFrRTtBQUNsRSxtQ0FBbUM7QUFDbkMsU0FBUztBQUNULCtEQUErRDtBQUMvRCxtREFBbUQ7QUFDbkQsb0NBQW9DO0FBQ3BDLFFBQVE7QUFDUixNQUFNIn0=