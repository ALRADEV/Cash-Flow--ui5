sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "cashflowapp/model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"

], (Controller, JSONModel, formatter, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("cashflowapp.controller.Transactions", {

        formatter: formatter,

        onInit() {
            const oModel = new sap.ui.model.odata.v4.ODataModel({
                serviceUrl: "/odata/v4/transacao/"
            });
            
            this.getView().setModel(oModel);
        },

        transactionSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("query");
            const oTable = this.byId("transactionTable");
        
            if (!oTable) {
                console.warn("Tabela não encontrada");
                return;
            }
        
            if (sQuery && sQuery.trim() !== "") {
                const sSafeQuery = sQuery.replace(/'/g, "''");
        
                const oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.changeParameters({
                        $filter: `contains(descricao,'${sSafeQuery}')`
                    });
                    oBinding.refresh();
                }
            } else {
                oTable.bindItems({
                    path: "/Transacoes",
                    parameters: {
                        $select: "descricao,data,tipo,valor"
                    },
                    template: oTable.getBindingInfo("items").template
                });
            }
        },
        
        onFiltrarMesAno: function (oEvent) {
            const sValor = oEvent.getSource().getValue(); 
            const oTable = this.byId("transactionTable");
        
            if (!oTable) return;
        
            const oBinding = oTable.getBinding("items");
            if (!oBinding) return;
        
            if (sValor) {
                const [sAno, sMes] = sValor.split("-");
        
                const dataInicial = `${sAno}-${sMes}-01`;
                const ultimoDia = new Date(sAno, sMes, 0).getDate();
                const dataFinal = `${sAno}-${sMes}-${String(ultimoDia).padStart(2, "0")}`;
        
                const sFilter = `data ge ${dataInicial} and data le ${dataFinal}`;
        
                oBinding.changeParameters({
                    $filter: sFilter
                });
                oBinding.refresh();
            } else {
           
                oBinding.changeParameters({
                    $filter: undefined
                });
                oBinding.refresh();
            }
        },                 
        
        onEditButtonPress: function () {
            const oTable = this.byId("transactionTable");
            const oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                sap.m.MessageToast.show("Por favor, selecione uma transação para editar.");
                return;
            }
        
            const oBindingContext = oSelectedItem.getBindingContext(); 
            const selectedTransaction = oBindingContext.getObject(); 
        
            const transactionForm = {
                ...selectedTransaction,
                isEditing: true
            };
        
            const transactionFormModel = new sap.ui.model.json.JSONModel(transactionForm);
            this.getView().setModel(transactionFormModel, "transactionForm");
        
            const viewId = this.getView().getId();
        
            if (!this.dialog) {
                this.dialog = sap.ui.xmlfragment(
                    viewId,
                    "cashflowapp.view.fragment.TransactionDialog",
                    this
                );
                this.getView().addDependent(this.dialog);
            }
        
            this.dialog.open();
        },
        
        onCreateButtonPress: function (oEvent) {
            const viewId = this.getView().getId();
        
            if (!this.dialog) {
                this.dialog = sap.ui.xmlfragment(
                    viewId,
                    "cashflowapp.view.fragment.TransactionDialog",
                    this
                );
                this.getView().addDependent(this.dialog);
            }
        
            const transactionForm = {
                data: "",
                descricao: "",
                valor: "",
                tipo: "Crédito",
                isEditing: false,
            };
            
            const transactionFormModel = new sap.ui.model.json.JSONModel(transactionForm);
            this.getView().setModel(transactionFormModel, "transactionForm");
        
            this.dialog.open();
        },
        
        onCloseDialog: function () {
            this.dialog.close();
        },               

        calcularTotais: function () {

            const oTable = this.byId("transactionTable");
            const aItems = oTable.getBinding("items").getCurrentContexts();
            const aTransacoes = aItems.map(ctx => ctx.getObject());
        
            const totalCredito = aTransacoes
                .filter(t => t.tipo === "Crédito")
                .reduce((acc, t) => acc + Number(t.valor), 0);
        
            const totalDebito = aTransacoes
                .filter(t => t.tipo === "Débito")
                .reduce((acc, t) => acc + Number(t.valor), 0);
        
            const saldo = totalCredito - totalDebito;
        
            const oViewModel = this.getView().getModel("worklistView");
            if (!oViewModel) {
                this.getView().setModel(new JSONModel({}), "worklistView");
            }
        
            this.getView().getModel("worklistView").setData({
                totalCredito: `+ ${totalCredito.toFixed(2)}`,
                totalDebito: `- ${totalDebito.toFixed(2)}`,
                saldoTotal: `${saldo >= 0 ? '+' : '-'} ${Math.abs(saldo).toFixed(2)}`
            });
        },

        onDeleteSelectedRows: function () {
            const oTable = this.byId("transactionTable");
            const oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                sap.m.MessageToast.show("Por favor, selecione uma transação para excluir.");
                return;
            }
        
            const oBindingContext = oSelectedItem.getBindingContext(); 
            if (!oBindingContext) {
                sap.m.MessageBox.error("Erro interno: não foi possível obter o contexto da transação.");
                return;
            }
        
            oBindingContext.delete().then(() => {
                sap.m.MessageToast.show("Transação excluída com sucesso.");
                
            });
        },    
        
        onSaveTransaction: async function () {
            const oView = this.getView();
            const oModel = oView.getModel(); 
            const oDialog = this.dialog;
            const oTable = this.byId("transactionTable");
            const oFormData = oView.getModel("transactionForm").getData();
        
        
            if (!oFormData.descricao || !oFormData.data || !oFormData.valor || !oFormData.tipo) {
                MessageBox.warning("Preencha todos os campos obrigatórios.");
                return;
            }
        
            const oFormattedData = {
                descricao: oFormData.descricao,
                data: oFormData.data,
                valor: parseFloat(oFormData.valor),
                tipo: oFormData.tipo
            };
        
            try {
                if (oFormData.isEditing) {
                    
                    const oSelectedItem = oTable.getSelectedItem();
        
                    if (!oSelectedItem) {
                        MessageBox.warning("Nenhuma transação selecionada para edição.");
                        return;
                    }
        
                    const oBindingContext = oSelectedItem.getBindingContext();
        
                    oBindingContext.setProperty("data", oFormData.data);
                    oBindingContext.setProperty("descricao", oFormData.descricao);
                    oBindingContext.setProperty("valor", parseFloat(oFormData.valor));
                    oBindingContext.setProperty("tipo", oFormData.tipo);
        
                  
                    MessageToast.show("Transação atualizada com sucesso.");
                } else {
                    
                    const oListBinding = oModel.bindList("/Transacoes");
                    await oListBinding.create(oFormattedData);
                    MessageToast.show("Transação criada com sucesso!");
                }
        
                oDialog.close();
                oModel.refresh(); 
        
            } catch (err) {
                console.error("Erro ao salvar transação:", err);
                MessageBox.error("Erro ao salvar a transação.");
            }
        },      
                                    
        onCloseTransaction: function () {
            this.dialog.close();
        },

        onUpdateFinished: function () {
            this.calcularTotais();
        }
        
    
    });
});
