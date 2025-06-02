sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";

    return {
        quantityState: function (valor, tipo) {
            if (tipo === "Débito") {
                return "Error"; 
            } else if (tipo === "Crédito") {
                return "Success";
            }
            return "None";
        },

        formatarValorComSinal: function (valor, tipo) {
            const numero = Number(valor);
            const prefixo = tipo === "Crédito" ? "+" : "-";
            return `${prefixo} ${numero.toFixed(2)}`;
        },

        formatDate: function (sDate) {
            const oDateFormatter = DateFormat.getInstance({
                pattern: "dd/MM/yyyy"
            });
            return oDateFormatter.format(new Date(sDate));
        },
        
    };
});

// sap.ui.define([
// 	"sap/ui/core/library"
// ] , function (coreLibrary) {
// 	"use strict";

// 	// shortcut for sap.ui.core.ValueState
// 	var ValueState = coreLibrary.ValueState;

// 	return {

// 		/**
// 		 * Rounds the number unit value to 2 digits
// 		 * @public
// 		 * @param {string} sValue the number string to be rounded
// 		 * @returns {string} sValue with 2 digits rounded
// 		 */
// 		numberUnit : function (sValue) {
// 			if (!sValue) {
// 				return "";
// 			}
// 			return parseFloat(sValue).toFixed(2);
// 		},

// 		/**
// 		 * Defines a value state based on the stock level
// 		 *
// 		 * @public
// 		 * @param {number} iValue the stock level of a product
// 		 * @returns {string} sValue the state for the stock level
// 		 */
// 		quantityState: function(iValue) {
// 			if (iValue === 0) {
// 				return ValueState.Error;
// 			} else if (iValue <= 10) {
// 				return ValueState.Warning;
// 			} else {
// 				return ValueState.Success;
// 			}
// 		}

// 	};

// });

// sap.ui.define ( [ ] , função () {
// 	"usar estrito" ;

//    retornar {
// 		  numberUnit : função ( sValue ) {
// 		 // … 
// 		 } ,
// 		  /**
// 		 * Define um estado de valor com base no preço
// 		 *
// 		 * @public 
// 		 * @param { number } iPrice o preço de uma postagem
// 		 * @returns { string } sValue o estado para o preço
// 		 */ 
// 		 priceState : function ( iPrice ) {
// 			if ( iPrice < 50 ) {
// 			   return  "Sucesso" ;
// 		   } senão  se (iPreço >= 50 && iPreço < 250 ) {
// 			   return  "Nenhum" ;
// 		   } senão  se (iPreço >= 250 && iPreço < 2000 ) {
// 			   return  "Aviso" ;
// 		   } senão {
// 			   return  "Erro" ;
// 		   }
// 	  }
// };
// });