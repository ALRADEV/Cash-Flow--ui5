sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "cashflowapp/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox" 

], (Controller, JSONModel, formatter, Filter, FilterOperator, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("cashflowapp.controller.Transactions", {

        formatter: formatter,

        onInit() {

            // const oModel = new JSONModel();
            // oModel.loadData("./localService/mockdata/Transactions.json", null, false);

            // this.getView().setModel(oModel, "transacoesModel");

            const oModel = new sap.ui.model.odata.v4.ODataModel({
                serviceUrl: "/odata/v4/transacao/"
              });
            
              this.getView().setModel(oModel);

            // this.calcularTotais();
        },

        onSearch: function (oEvent) {
            const aFilters = [];
            const sQuery = oEvent.getSource().getValue();
        
            if (sQuery && sQuery.length > 0) {
                const filter = new Filter("descricao", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
        
            const oTable = this.byId("trasactionTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onFiltrarMesAno: function (oEvent) {
            const sValor = oEvent.getSource().getValue(); 
            const aFiltros = [];
        
            if (sValor) {
                const sMesAno = sValor.split("-");
                const sAno = sMesAno[0];
                const sMes = sMesAno[1];
        
                const oFiltro = new Filter({
                    path: "data",
                    test: function (valor) {
                        if (!valor) return false;
                        const data = new Date(valor);
                        const mes = String(data.getMonth() + 1).padStart(2, "0");
                        const ano = String(data.getFullYear());
                        return mes === sMes && ano === sAno;
                    }
                });
        
                aFiltros.push(oFiltro);
            }
        
            const oTable = this.byId("trasactionTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFiltros);
        },
        
        onEditButtonPress: function () {
            const oTable = this.byId("trasactionTable");
            const oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                sap.m.MessageToast.show("Por favor, selecione uma transação para editar.");
                return;
            }
        
            const oBindingContext = oSelectedItem.getBindingContext(); // modelo padrão
            const selectedTransaction = oBindingContext.getObject(); // dados diretamente
        
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
        
        
        
        // onEditButtonPress: function (oEvent) {
        //     const oTable = this.byId("trasactionTable");
        //     const oSelectedItem = oTable.getSelectedItem();
        //     // this._oId = oEvent.getSource().getId();
        
        //     if (!oSelectedItem) {
        //         sap.m.MessageToast.show("Por favor, selecione uma transação para editar.");
        //         return;
        //     }
        
        //     const sPath = oSelectedItem.getBindingContext("transacoesModel").getPath();
        //     const transacoesModel = this.getView().getModel("transacoesModel");
        //     const selectedTransaction = transacoesModel.getProperty(sPath);
        
        //     const transactionForm = {
        //         id: selectedTransaction.id,
        //         data: selectedTransaction.data,
        //         descricao: selectedTransaction.descricao,
        //         valor: selectedTransaction.valor,
        //         tipo: selectedTransaction.tipo,
        //         isEditing: true,
        //     };
        
        //     const transactionFormModel = new JSONModel(transactionForm);
        //     this.getView().setModel(transactionFormModel, "transactionForm");
        
        //     const viewId = this.getView().getId();
        
        //     if (!this.dialog) {
        //         this.dialog = sap.ui.xmlfragment(
        //             viewId,
        //             "cashflowapp.view.fragment.TransactionDialog",
        //             this
        //         );
        //         this.getView().addDependent(this.dialog);
        //     }
        
        //     this.dialog.open();
        // },

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
        
        
        // onCreateButtonPress: function (oEvent) {
        //     const viewId = this.getView().getId();
        //     this._oId = oEvent.getSource().getId();
        
        //     if (!this.dialog) {
        //         this.dialog = sap.ui.xmlfragment(
        //             viewId,
        //             "cashflowapp.view.fragment.TransactionDialog",
        //             this
        //         );
        //         this.getView().addDependent(this.dialog);
        //     }
        
        //     const transactionForm = {
        //         id: Date.now(), 
        //         data: "",
        //         descricao: "",
        //         valor: "",
        //         tipo: "Crédito",
        //         isEditing: false,
        //     };
        //     const transactionFormModel = new JSONModel(transactionForm);
        //     this.getView().setModel(transactionFormModel, "transactionForm");
        
        //     this.dialog.open();
        // },
        
        onCloseDialog: function () {
            this.dialog.close();
        },

        calcularTotais: function () {
            // const aTransacoes = this.getView().getModel("transacoesModel").getData();

            const oTable = this.byId("trasactionTable");
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
            const oTable = this.byId("trasactionTable");
            const oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                sap.m.MessageToast.show("Por favor, selecione uma transação para excluir.");
                return;
            }
        
            const oBindingContext = oSelectedItem.getBindingContext(); // usa o modelo padrão
            if (!oBindingContext) {
                sap.m.MessageBox.error("Erro interno: não foi possível obter o contexto da transação.");
                return;
            }
        
            oBindingContext.delete().then(() => {
                sap.m.MessageToast.show("Transação excluída com sucesso.");
                
            });
        },
        
        
        

        // onDeleteSelectedRows: function () {
        //     var oModel = this.getView().getModel();
        //     var sPath = "/Transacoes";
          
        //     oModel.remove(sPath, {
        //       success: function () {
        //         MessageToast.show("Removido com sucesso!");
        //       },
        //       error: function () {
        //         MessageBox.error("Erro ao remover.");
        //       }
        //     });
        // },
        
        // onDeleteSelectedRows: function () {
        //     const oTable = this.byId("trasactionTable");
        //     const transacoesModel = oTable.getBinding("items").getModel();
        //     const oSelectedItem = oTable.getSelectedItem();
        
        //     if (!oSelectedItem) {
        //         sap.m.MessageToast.show("Por favor, selecione uma transação para excluir.");
        //         return;
        //     }
        
        //     const sSelectedPath = oSelectedItem.getBindingContextPath();
        //     const transacoes = transacoesModel.getData();
        
        //     const transacaoParaRemover = transacoesModel.getProperty(sSelectedPath);
        
        //     const listaAtualizada = transacoes.filter(t => {
        //         return !(t.data === transacaoParaRemover.data &&
        //                  t.descricao === transacaoParaRemover.descricao &&
        //                  t.valor == transacaoParaRemover.valor &&
        //                  t.tipo === transacaoParaRemover.tipo);
        //     });

        //     transacoesModel.setData(listaAtualizada);
        //     // this.calcularTotais();        
            
        // },
        
        
        onSaveTransaction: async function () {
            const oView = this.getView();
            const oModel = oView.getModel(); // Modelo OData V4
            const oDialog = this.dialog;
            const oTable = this.byId("trasactionTable");
            const oFormData = oView.getModel("transactionForm").getData();
        
            // Validação simples
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
                    // EDIÇÃO (funcional com setProperty + submitBatch)
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
                    // CRIAÇÃO (com bindList().create())
                    const oListBinding = oModel.bindList("/Transacoes");
                    await oListBinding.create(oFormattedData);
                    MessageToast.show("Transação criada com sucesso!");
                }
        
                oDialog.close();
                oModel.refresh(); // Atualiza a tabela após salvar
        
            } catch (err) {
                console.error("Erro ao salvar transação:", err);
                MessageBox.error("Erro ao salvar a transação.");
            }
        },        
                                     
        // onSaveTransaction: function () {
        //     const transacoesModel = this.getView().getModel("transacoesModel");
        //     const transacoes = transacoesModel.getData();
        
        //     const formModel = this.getView().getModel("transactionForm");
        //     const formData = formModel.getData();
        
        //     if (!formData.descricao || !formData.data || !formData.valor || !formData.tipo) {
        //         sap.m.MessageToast.show("Preencha todos os campos obrigatórios.");
        //         return;
        //     }
        
        //     if (formData.isEditing && formData.id !== undefined) {
        //         const index = transacoes.findIndex(t => t.id === formData.id);
        //         if (index !== -1) {
        //             transacoes.splice(index, 1, formData);
        //         }
        //     } else {
        //         formData.id = Date.now(); // Gera ID para novas transações
        //         transacoes.push(formData);
        //     }
        
        //     transacoesModel.setProperty("/", transacoes);
        
        //     this.calcularTotais();
        //     this.dialog.close();
        // },
        
    
        
        onCloseTransaction: function () {
            this.dialog.close();
        },
        
    
    });
});