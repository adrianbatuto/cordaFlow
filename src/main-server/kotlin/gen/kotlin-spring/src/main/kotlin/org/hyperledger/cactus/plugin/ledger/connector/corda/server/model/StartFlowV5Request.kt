package org.hyperledger.cactus.plugin.ledger.connector.corda.server.model

import java.util.Objects
import com.fasterxml.jackson.annotation.JsonProperty
import org.hyperledger.cactus.plugin.ledger.connector.corda.server.model.StartFlowV5RequestRequestBody
import javax.validation.constraints.DecimalMax
import javax.validation.constraints.DecimalMin
import javax.validation.constraints.Email
import javax.validation.constraints.Max
import javax.validation.constraints.Min
import javax.validation.constraints.NotNull
import javax.validation.constraints.Pattern
import javax.validation.constraints.Size
import javax.validation.Valid

/**
 * This method starts a new instance for the specified flow for the specified holding identity.
 * @param clientRequestId 
 * @param flowClassName 
 * @param requestBody 
 * @param holdingIDShortHash 
 */
data class StartFlowV5Request(

    @get:JsonProperty("clientRequestId", required = true) val clientRequestId: kotlin.String,

    @get:JsonProperty("flowClassName", required = true) val flowClassName: kotlin.String,

    @field:Valid
    @get:JsonProperty("requestBody", required = true) val requestBody: StartFlowV5RequestRequestBody,

    @get:JsonProperty("holdingIDShortHash") val holdingIDShortHash: kotlin.String? = null
) {

}
