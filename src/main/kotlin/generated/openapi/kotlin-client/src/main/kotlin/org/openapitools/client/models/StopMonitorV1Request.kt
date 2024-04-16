/**
 *
 * Please note:
 * This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * Do not edit this file manually.
 *
 */

@file:Suppress(
    "ArrayInDataClass",
    "EnumEntryName",
    "RemoveRedundantQualifierName",
    "UnusedImport"
)

package org.openapitools.client.models


import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * 
 *
 * @param clientAppId ID of a client application that wants to monitor the state changes
 * @param stateFullClassName The fully qualified name of the Corda state to monitor
 */


data class StopMonitorV1Request (

    /* ID of a client application that wants to monitor the state changes */
    @Json(name = "clientAppId")
    val clientAppId: kotlin.String,

    /* The fully qualified name of the Corda state to monitor */
    @Json(name = "stateFullClassName")
    val stateFullClassName: kotlin.String

)

