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
            const numero = parseFloat(valor);
        
            if (isNaN(numero)) {
                return "-";
            }
        
            const prefixo = tipo === "Crédito" ? "+" : "-";
            return `${prefixo} ${numero.toFixed(2)}`;
        },
        

        // formatarValorComSinal: function (valor, tipo) {
        //     const numero = Number(valor);
        //     const prefixo = tipo === "Crédito" ? "+" : "-";
        //     return `${prefixo} ${numero.toFixed(2)}`;
        // },

        // formatDate: function (sDate) {
        //     const oDateFormatter = DateFormat.getInstance({
        //         pattern: "dd/MM/yyyy"
        //     });
        //     return oDateFormatter.format(new Date(sDate));
        // },

        // formatDate: function (sDate) {
        //     if (!sDate) return "";
        
        //     const parts = sDate.split("-");
        //     const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        
        //     return DateFormat.getInstance({ pattern: "dd/MM/yyyy" }).format(dateObj);
        // }

        formatDate: function (sDate) {
            if (!sDate) return "";
        
            // Garante o formato yyyy-mm-dd
            const parts = sDate.split("-");
            if (parts.length !== 3) return sDate;
        
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // mês começa do zero
            const day = parseInt(parts[2], 10);
        
            const date = new Date(year, month, day);
            return DateFormat.getInstance({ pattern: "dd/MM/yyyy" }).format(date);
        }
        
        
        
    };
});
