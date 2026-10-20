function onLoad(executionContext, eventName) {
	debugger;

	var pageContext = Xrm.Utility.getPageContext();
	var input = pageContext.input;
	var selectedViewId = input.formId;


	// Getting  formContext added by sathish 8/26/2024
	var formContext = executionContext.getFormContext();

	var formType=formContext.ui.getFormType();
	

	//Checking formType if formType is Create then performing operation

	if(formType==1){

		var articelType=formContext.getAttribute("bdf_articletype").getValue();
		var formName = Xrm.Page.ui.formSelector.getCurrentItem().getLabel();

		if(articelType==1 && articelType!=null && formName!="Article Cleansing")
			{
                formContext.getAttribute("cr60a_generalitemcategorygroup").setValue("NORM");
		    }else{
				formContext.getAttribute("cr60a_generalitemcategorygroup").setValue("LUMF");
			}
	}


	 //End 
	 //formContext.data.addOnLoad(updateReverseConfigurationArticle);
    // Adding adding addOnload event By Sathish 8/5/2024
	formContext.data.addOnLoad(volumeMandatory);
	//formContext.data.addOnLoad(ArticleDCViewSelector);


    // Adding OnChnage of Fields By Sathish 8/5/2024

     // List of fields to register the OnChange event
	 var fields = [
        "bdf_outofpackaginglength",
        "bdf_outofpackagingwidth",
	    "bdf_outofpackagingheight",
	    "bdf_inpackaginglength",
	    "bdf_inpackagingwidth",
	    "bdf_inpackagingheight"
    ];

    fields.forEach(function(fieldName) {
        var attribute = formContext.getAttribute(fieldName);
        if (attribute) {
            attribute.addOnChange(volumeMandatory);
        }
    });


	//if (selectedViewId == '{200CD13D-8FAC-ED11-AAD1-00224828DDAF}') return;

	// Collapse side panes
	//var pane = Xrm.App.sidePanes.getPane("ArticleCleansingPane");
	//pane.close();
	//Xrm.App.sidePanes.state = 0;

  




	formContext.getControl("cr60a_warrantylength").setVisible(true);
	if (formContext.getAttribute("cr60a_majorcode") != null) {
		if (formContext.getAttribute("cr60a_majorcode").getValue() == "10") {
			formContext.getControl("cr60a_warrantylength").setVisible(false);
		}
	}

	// Get Project's current milestone
	//try {
		if (formContext.getAttribute("bdf_project") != null && formContext.getAttribute("bdf_project").getValue() != null && formContext.getAttribute("bdf_generic").getValue() != null) {
			projectID = formContext.getAttribute("bdf_project").getValue()[0].id.slice(1, -1);
			genericGUID = formContext.getAttribute("bdf_generic").getValue()[0].id.slice(1, -1);

			Xrm.WebApi.retrieveRecord("bdf_project", projectID, "?$expand=bpf_bdf_project_bdf_project_milestones($select=_activestageid_value)").then(
				async function success(data) {
					//console.log(data);
					let milestone = data.bpf_bdf_project_bdf_project_milestones[0]['_activestageid_value@OData.Community.Display.V1.FormattedValue'];
					let genericStage = await Xrm.WebApi.retrieveRecord("bdf_generic", `${genericGUID}`, "?$select=bdf_genericstage");
                    let Articletype = formContext.getAttribute("bdf_articletype").getValue();
					let genericStageName = genericStage["bdf_genericstage@OData.Community.Display.V1.FormattedValue"];
					if (genericStageName) {
						// checking whether project is in sample or further state then makng the article group mandatory
						if (['Sample', 'Ready To Forecast', 'Testing & Launch', 'Ready to Buy'].includes(genericStageName)) {
							// Set the "bdf_articlegroup" field as mandatory
							formContext.getAttribute("bdf_articlegroup").setRequiredLevel("required");
							if(Articletype == 1)
								{
									formContext.getAttribute("cr60a_vendorarticlenumber").setRequiredLevel("required");
								}
							formContext.getAttribute("bdf_cost").setRequiredLevel("required");
						} else {
							// Set the "bdf_articlegroup" field as optional
							formContext.getAttribute("bdf_articlegroup").setRequiredLevel("none");
							formContext.getAttribute("cr60a_vendorarticlenumber").setRequiredLevel("none");
							formContext.getAttribute("bdf_cost").setRequiredLevel("none");
						}
						if (['Ready To Forecast', 'Testing & Launch', 'Ready to Buy'].includes(genericStageName)) //milestone != 'Ready To Buy' &&
							applyProductTypeRules(formContext, true);
						else
							applyProductTypeRules(formContext, false);
							if (['Testing & Launch', 'Ready To Buy','Ready To Forecast'].includes(milestone)) {
								if(Articletype!=2)
								{
									formContext.getAttribute("bdf_outofpackaginglength").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingwidth").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingheight").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingvolume").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackaginglength").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingwidth").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingheight").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingweight").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingweight").setRequiredLevel("required");
								}
								formContext.getAttribute("cr60a_salestext").setRequiredLevel("required");
								
								//formContext.getAttribute("bdf_casepackunits").setRequiredLevel("required");
								formContext.getAttribute("bdf_retailprice").setRequiredLevel("required");
								
	
							}
					}
					else {
						// checking whether project is in sample or further state then makng the article group mandatory
						if (['Sample', 'Ready To Forecast', 'Testing & Launch', 'Ready To Buy'].includes(milestone)) {
							// Set the "bdf_articlegroup" field as mandatory
							formContext.getAttribute("bdf_articlegroup").setRequiredLevel("required");
														if(Articletype == 1)
								{
									formContext.getAttribute("cr60a_vendorarticlenumber").setRequiredLevel("required");
								}
							formContext.getAttribute("bdf_cost").setRequiredLevel("required");
						} else {
							// Set the "bdf_articlegroup" field as optional
							formContext.getAttribute("bdf_articlegroup").setRequiredLevel("none");
							formContext.getAttribute("cr60a_vendorarticlenumber").setRequiredLevel("none");
							formContext.getAttribute("bdf_cost").setRequiredLevel("none");
						}
						if (['Ready To Forecast', 'Testing & Launch', 'Ready To Buy'].includes(milestone)) //milestone != 'Ready To Buy' &&
							applyProductTypeRules(formContext, true);
						else
							applyProductTypeRules(formContext, false);
							if (['Testing & Launch', 'Ready To Buy','Ready To Forecast'].includes(milestone)) {
								if(Articletype!=2)
								{
									formContext.getAttribute("bdf_outofpackaginglength").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingwidth").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingheight").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingvolume").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackaginglength").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingwidth").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingheight").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingweight").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingweight").setRequiredLevel("required");
								}
								formContext.getAttribute("cr60a_salestext").setRequiredLevel("required");
								
								//formContext.getAttribute("bdf_casepackunits").setRequiredLevel("required");
								formContext.getAttribute("bdf_retailprice").setRequiredLevel("required");
								
	
							}
					}
				},
				// function (error) {
				// 	Xrm.Utility.alertDialog(error.message);
				// }
			);
		} else if (formContext.getAttribute("bdf_project") != null && formContext.getAttribute("bdf_project").getValue() == null) {
			applyProductTypeRules(formContext, false);
		} else
			applyProductTypeRules(formContext, true);
	// }
	// catch (e) {
	// 	Xrm.Utility.alertDialog(e.message);
	// }




	function applyProductTypeRules(formContext, mandatoryRule) {
		// Make key fields mandatory
		//	if (selectedViewId != '{200CD13D-8FAC-ED11-AAD1-00224828DDAF}')
		if (formContext.ui.formSelector.getCurrentItem().getId() != '200cd13d-8fac-ed11-aad1-00224828ddaf') {
			formContext.getAttribute("cr60a_style").setRequiredLevel("required");
			formContext.getAttribute("cr60a_collection").setRequiredLevel("required");
			formContext.getAttribute("cr60a_materialgroup").setRequiredLevel("required");
			formContext.getAttribute("cr60a_colorgroup").setRequiredLevel("required");
			formContext.getAttribute("cr60a_upholsterymaterialgroup").setRequiredLevel("required");
			formContext.getAttribute("cr60a_finishgroup").setRequiredLevel("required");
			formContext.getAttribute("cr60a_valueclass").setRequiredLevel("required");
		}
		if (mandatoryRule)
			formContext.getAttribute("cr60a_producttype").setRequiredLevel("required");

		if (formContext.getAttribute("cr60a_producttype").getValue() != null && formContext.getAttribute("cr60a_producttype").getValue()[0].id != null) {
			var productTypeID = formContext.getAttribute("cr60a_producttype").getValue()[0].id.slice(1, -1);
			//try {
				Xrm.WebApi.retrieveRecord("cr60a_producttype", productTypeID).then(
					function success(metadata) {
						//console.log(data["cr60a_ptshape"]);
						setFormFields(metadata, formContext, mandatoryRule);
					},
					// function (error) {
					// 	Xrm.Utility.alertDialog(error.message);
					// }
				);
			// }
			// catch (e) {
			// 	Xrm.Utility.alertDialog(e.message);
			// }
		}
	}

	async function setFormFields(metadata, formContext, mandatoryRule) {
       // try {
            //var formSaveTF = false;
            //get the values 
            var displayFieldName = [];
            var fieldNamesToDisplay = [];
            for (const item in metadata) {
                if (item.startsWith("cr60a_pt")) {
                    //console.log(item);
                    //console.log(metadata[item]);
    
                    fieldName = item.replace("cr60a_pt", "cr60a_");
    
                    //formContext.getControl(fieldName).setVisible(false);
                    formContext.getAttribute(fieldName).setRequiredLevel("none");
                    switch (metadata[item]) {
                        case "M":
                            formContext.getControl(fieldName).setVisible(true);
                            if (mandatoryRule) {
                                formContext.getAttribute(fieldName).setRequiredLevel("required");
                            }
                            else{
								formContext.getAttribute(fieldName).setRequiredLevel("recommended");
                                // var fieldValue = formContext.getAttribute(fieldName).getValue();
                                // if(fieldValue == null)
                                // {
                                //     displayFieldName.push(fieldName);
                                // }
                                
                                
                                //var fieldName1= fieldName.DisplayName.UserLocalizedLabel.Label;
                                //var fieldName1 = formContext.getControl(fieldName1).getLabel();
                                //displayFieldName.push(fieldName1);
                                //var DisplayFieldName =displayFieldName.join(',');
								//formContext.getControl(DisplayFieldName).setVisible(true);
								formContext.getAttribute("cr60a_returnchargebackdateofchange").setRequiredLevel("recommended");
								formContext.getAttribute("cr60a_returnchargebackvendor").setRequiredLevel("recommended");

                            }
							if(fieldName == "cr60a_returnchargebacktype")
							{
								formContext.getControl("cr60a_returnchargebackdateofchange").setVisible(true);
								formContext.getAttribute("cr60a_returnchargebackdateofchange").setRequiredLevel("required");
								formContext.getControl("cr60a_returnchargebackvendor").setVisible(true);
								formContext.getAttribute("cr60a_returnchargebackvendor").setRequiredLevel("required");
							}
    
                                
                            break;
    
                        case "O":
                            formContext.getControl(fieldName).setVisible(true);
							if(fieldName == "cr60a_returnchargebacktype")
							{
									formContext.getControl("cr60a_returnchargebackdateofchange").setVisible(true);
								formContext.getAttribute("cr60a_returnchargebackdateofchange").setRequiredLevel("none");
								formContext.getControl("cr60a_returnchargebackvendor").setVisible(true);
								formContext.getAttribute("cr60a_returnchargebackvendor").setRequiredLevel("none");
							}
                            break;
    
                        case null:
                            if (eventName == "onChange") {
                                formContext.getAttribute(fieldName).setValue(null);
                                //formSaveTF = true;
                            }
    
                            formContext.getControl(fieldName).setVisible(false);
							if(fieldName == "cr60a_returnchargebacktype")
							{
								formContext.getControl("cr60a_returnchargebackdateofchange").setVisible(false);
								formContext.getControl("cr60a_returnchargebackvendor").setVisible(false);

							}
                    }
                }
                
            };
            // if(displayFieldName.length != 0)
            // {
            //     const clientUrl = Xrm.Utility.getGlobalContext().getClientUrl();
            //     const url = `${clientUrl}/api/data/v9.0/EntityDefinitions(LogicalName='cr60a_stg_article_master')/Attributes?$select=LogicalName,DisplayName`;
            //         const response = await fetch(url, {
            //             method: 'GET',
            //             headers: {
            //                 'OData-MaxVersion': '4.0',
            //                 'OData-Version': '4.0',
            //                 'Accept': 'application/json',
            //                 'Content-Type': 'application/json; charset=utf-8',
            //                 'Prefer': 'odata.include-annotations="*"'
            //             }
            //         });
            //         if (!response.ok) {
            //             throw new Error(`Error: ${response.statusText}`);
            //         }
            
            //         const result = await response.json();
            //         //console.log(result);
            //         result.value.forEach(attribute => {
            //                     const logicalName = attribute.LogicalName;
            //                     for(const item of displayFieldName)
            //                     {
            //                         if(logicalName === item){
            //                             const fieldName1 = attribute.DisplayName && attribute.DisplayName.UserLocalizedLabel ?
            //                             attribute.DisplayName.UserLocalizedLabel.Label : "No display name";
            //                             //console.log(fieldName1);
                                        
            //                             fieldNamesToDisplay.push(fieldName1);
                                        
            //                     }
            //                     }
                               
            //         });
    
            //         var displayname = fieldNamesToDisplay.join(',');
            //         Xrm.Navigation.openAlertDialog({ text: `Please fill in the missing Product Type related attributes before moving the Project/Generic Stage to Ready to Buy or later: ` +displayname });
    
            // }
            
    
            // if (formSaveTF) {
            // 	formContext.data.entity.save();
            // }
            //executionContext.getEventArgs().getSaveMode();
        // }
        
        // catch (e) {
        //     Xrm.Utility.alertDialog(e.message);
        // }
    }

	//	if (selectedViewId != '{200CD13D-8FAC-ED11-AAD1-00224828DDAF}') {
	if (/*formContext.ui.formSelector.getCurrentItem().getId() != '200cd13d-8fac-ed11-aad1-00224828ddaf'*/ true) {

		// Get article image URL
		var imageURL = formContext.getAttribute("cr60a_articleimage").getValue();

		// Set article image
		var wrCtrl = formContext.getControl("WebResource_articleimagewr");

		var wrCtrl1 = formContext.getControl("WebResource_articleimagewr1");

		if (wrCtrl != null && wrCtrl != undefined) {
			wrCtrl.getContentWindow().then(function (win) {
				win.loadArticleImage(imageURL);
			});
		}

		if (wrCtrl1 != null && wrCtrl1 != undefined) {
			wrCtrl1.getContentWindow().then(function (win) {
				win.loadArticleImage(imageURL);
			});
		}
	}
}

// code added on 31st Oct: makes article group mandatory after sample stage
function articleGroupMandatory(executionContext) {
	var formContext = executionContext.getFormContext();

	//try {
		if (formContext.getAttribute("bdf_project") != null && formContext.getAttribute("bdf_project").getValue() != null) {
			var projectID = formContext.getAttribute("bdf_project").getValue()[0].id.slice(1, -1);
			Xrm.WebApi.retrieveRecord("bdf_project", projectID, "?$expand=bpf_bdf_project_bdf_project_milestones($select=_activestageid_value)").then(
				function success(data) {
					//console.log(data);
					var milestone = data.bpf_bdf_project_bdf_project_milestones[0]['_activestageid_value@OData.Community.Display.V1.FormattedValue'];
					// Checking whether the project is in a sample or further state then making the article group mandatory
					if (['Sample', 'Ready To Forecast', 'Testing & Launch', 'Ready To Buy'].includes(milestone)) {
						// Set the "bdf_articlegroup" field as mandatory
						formContext.getAttribute("bdf_articlegroup").setRequiredLevel("required");
					} else {
						// Set the "bdf_articlegroup" field as optional
						formContext.getAttribute("bdf_articlegroup").setRequiredLevel("none");
					}
				},
				// function (error) {
				// 	Xrm.Utility.alertDialog(error.message);
				// }
			);
		}
	// } catch (e) {
	// 	Xrm.Utility.alertDialog(e.message);
	// }
}


// Making Volume Filed Requrid By Sathis --- 8/2/2024

function volumeMandatory(executionContext){

    debugger;

    var formContext=executionContext.getFormContext();

   // try {

		var formName = Xrm.Page.ui.formSelector.getCurrentItem().getLabel();

		if(formName!="Article Cleansing"){

			var outofPackagingLength=formContext.getAttribute("bdf_outofpackaginglength").getValue();
			var outofPackagingWidth=formContext.getAttribute("bdf_outofpackagingwidth").getValue();
			var bdf_outofPackagingHeight=formContext.getAttribute("bdf_outofpackagingheight").getValue();
			var inPackagingLength=formContext.getAttribute("bdf_inpackaginglength").getValue();
			var inPackagingWidth=formContext.getAttribute("bdf_inpackagingwidth").getValue();
			var inPackagingHeight=formContext.getAttribute("bdf_inpackagingheight").getValue();


        // Cheking fields contains Values are not
        if(outofPackagingLength!=null || outofPackagingWidth!=null || bdf_outofPackagingHeight!=null ){
             // Set the field "bdf_outofpackagingvolume" to be required
            formContext.getAttribute("bdf_outofpackagingvolume").setRequiredLevel("required");
        } else{
			formContext.getAttribute("bdf_outofpackagingvolume").setRequiredLevel("none");
		}

        if(inPackagingLength!=null || inPackagingWidth!=null || inPackagingHeight!=null){
			formContext.getAttribute("bdf_inpackagingvolume").setRequiredLevel("required");
        } else{
			formContext.getAttribute("bdf_inpackagingvolume").setRequiredLevel("none");
        }
	}

        
    // } catch (error) {

    //     Xrm.Navigation.openAlertDialog({text: error})
        
    // }
}
async function onSaveofVariantForm(executionContext, eventName)
{
	var formContext = executionContext.getFormContext();
	//try {
		if (formContext.getAttribute("bdf_project") != null && formContext.getAttribute("bdf_project").getValue() != null && formContext.getAttribute("bdf_generic").getValue() != null) {
			projectID = formContext.getAttribute("bdf_project").getValue()[0].id.slice(1, -1);
			genericGUID = formContext.getAttribute("bdf_generic").getValue()[0].id.slice(1, -1);
           
			Xrm.WebApi.retrieveRecord("bdf_project", projectID, "?$expand=bpf_bdf_project_bdf_project_milestones($select=_activestageid_value)").then(
				async function success(data) {
					//console.log(data);
					let milestone = data.bpf_bdf_project_bdf_project_milestones[0]['_activestageid_value@OData.Community.Display.V1.FormattedValue'];
					let genericStage = await Xrm.WebApi.retrieveRecord("bdf_generic", `${genericGUID}`, "?$select=bdf_genericstage");
                    let Articletype = formContext.getAttribute("bdf_articletype").getValue();
					let genericStageName = genericStage["bdf_genericstage@OData.Community.Display.V1.FormattedValue"];
					if (genericStageName) {
						// checking whether project is in sample or further state then makng the article group mandatory
						if (['Sample', 'Ready To Forecast', 'Testing & Launch', 'Ready to Buy'].includes(genericStageName)) {
							// Set the "bdf_articlegroup" field as mandatory
							formContext.getAttribute("bdf_articlegroup").setRequiredLevel("required");
							if(Articletype == 1)
								{
									formContext.getAttribute("cr60a_vendorarticlenumber").setRequiredLevel("required");
								}
							formContext.getAttribute("bdf_cost").setRequiredLevel("required");
						} else {
							// Set the "bdf_articlegroup" field as optional
							formContext.getAttribute("bdf_articlegroup").setRequiredLevel("none");
							formContext.getAttribute("cr60a_vendorarticlenumber").setRequiredLevel("none");
							formContext.getAttribute("bdf_cost").setRequiredLevel("none");
						}
						if (['Ready To Forecast', 'Testing & Launch', 'Ready to Buy'].includes(genericStageName)) //milestone != 'Ready To Buy' &&
							applyProductTypeRules(formContext, true);
						else
							applyProductTypeRules(formContext, false);
							if (['Testing & Launch', 'Ready To Buy'].includes(milestone)) {
								if(Articletype!=2)
								{
									formContext.getAttribute("bdf_outofpackaginglength").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingwidth").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingheight").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingvolume").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackaginglength").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingwidth").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingheight").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingweight").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingweight").setRequiredLevel("required");
								}
								formContext.getAttribute("cr60a_salestext").setRequiredLevel("required");
								
								//formContext.getAttribute("bdf_casepackunits").setRequiredLevel("required");
								formContext.getAttribute("bdf_retailprice").setRequiredLevel("required");
								
	
							}
					}
					else {
						// checking whether project is in sample or further state then makng the article group mandatory
						if (['Sample', 'Ready To Forecast', 'Testing & Launch', 'Ready To Buy'].includes(milestone)) {
							// Set the "bdf_articlegroup" field as mandatory
							formContext.getAttribute("bdf_articlegroup").setRequiredLevel("required");
														if(Articletype == 1)
								{
									formContext.getAttribute("cr60a_vendorarticlenumber").setRequiredLevel("required");
								}
							formContext.getAttribute("bdf_cost").setRequiredLevel("required");
						} else {
							// Set the "bdf_articlegroup" field as optional
							formContext.getAttribute("bdf_articlegroup").setRequiredLevel("none");
							formContext.getAttribute("cr60a_vendorarticlenumber").setRequiredLevel("none");
							formContext.getAttribute("bdf_cost").setRequiredLevel("none");
						}
						if (['Ready To Forecast', 'Testing & Launch', 'Ready To Buy'].includes(milestone)) //milestone != 'Ready To Buy' &&
							applyProductTypeRules(formContext, true);
						else
							applyProductTypeRules(formContext, false);
							if (['Testing & Launch', 'Ready To Buy'].includes(milestone)) {
								if(Articletype!=2)
								{
									formContext.getAttribute("bdf_outofpackaginglength").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingwidth").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingheight").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingvolume").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackaginglength").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingwidth").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingheight").setRequiredLevel("required");
									formContext.getAttribute("bdf_outofpackagingweight").setRequiredLevel("required");
									formContext.getAttribute("bdf_inpackagingweight").setRequiredLevel("required");
								}
								formContext.getAttribute("cr60a_salestext").setRequiredLevel("required");
								
								//formContext.getAttribute("bdf_casepackunits").setRequiredLevel("required");
								formContext.getAttribute("bdf_retailprice").setRequiredLevel("required");
								
	
							}
					}
				},
				// function (error) {
				// 	Xrm.Utility.alertDialog(error.message);
				// }
			);
		} else if (formContext.getAttribute("bdf_project") != null && formContext.getAttribute("bdf_project").getValue() == null) {
			applyProductTypeRules(formContext, false);
		} else
			applyProductTypeRules(formContext, true);
	// }
	// catch (e) {
	// 	Xrm.Utility.alertDialog(e.message);
	// }


    function applyProductTypeRules(formContext, mandatoryRule) {
        // Make key fields mandatory
        //	if (selectedViewId != '{200CD13D-8FAC-ED11-AAD1-00224828DDAF}')
        if (formContext.ui.formSelector.getCurrentItem().getId() != '200cd13d-8fac-ed11-aad1-00224828ddaf') {
            formContext.getAttribute("cr60a_style").setRequiredLevel("required");
            formContext.getAttribute("cr60a_collection").setRequiredLevel("required");
            formContext.getAttribute("cr60a_materialgroup").setRequiredLevel("required");
            formContext.getAttribute("cr60a_colorgroup").setRequiredLevel("required");
            formContext.getAttribute("cr60a_upholsterymaterialgroup").setRequiredLevel("required");
            formContext.getAttribute("cr60a_finishgroup").setRequiredLevel("required");
            formContext.getAttribute("cr60a_valueclass").setRequiredLevel("required");
        }
        if (mandatoryRule)
            formContext.getAttribute("cr60a_producttype").setRequiredLevel("required");
    
        if (formContext.getAttribute("cr60a_producttype").getValue() != null && formContext.getAttribute("cr60a_producttype").getValue()[0].id != null) {
            var productTypeID = formContext.getAttribute("cr60a_producttype").getValue()[0].id.slice(1, -1);
            //try {
                Xrm.WebApi.retrieveRecord("cr60a_producttype", productTypeID).then(
                    function success(metadata) {
                        //console.log(data["cr60a_ptshape"]);
                        setFormFields(metadata, formContext, mandatoryRule);
                    },
                    // function (error) {
                    //     Xrm.Utility.alertDialog(error.message);
                    // }
                );
            // }
            // catch (e) {
            //     Xrm.Utility.alertDialog(e.message);
            // }
        }
    }

    async function setFormFields(metadata, formContext, mandatoryRule) {
      //  try {
            //var formSaveTF = false;
            //get the values 
            var displayFieldName = [];
            var fieldNamesToDisplay = [];
            for (const item in metadata) {
                if (item.startsWith("cr60a_pt")) {
                    //console.log(item);
                    //console.log(metadata[item]);
    
                    fieldName = item.replace("cr60a_pt", "cr60a_");
    
                    //formContext.getControl(fieldName).setVisible(false);
                    formContext.getAttribute(fieldName).setRequiredLevel("none");
                    switch (metadata[item]) {
                        case "M":
                            formContext.getControl(fieldName).setVisible(true);
                            if (mandatoryRule) {
                                formContext.getAttribute(fieldName).setRequiredLevel("required");
                            }
                            else{
								formContext.getAttribute(fieldName).setRequiredLevel("recommended");
                                var fieldValue = formContext.getAttribute(fieldName).getValue();
                                if(fieldValue == null)
                                {
                                    displayFieldName.push(fieldName);
                                }
                                
                                
                                //var fieldName1= fieldName.DisplayName.UserLocalizedLabel.Label;
                                //var fieldName1 = formContext.getControl(fieldName1).getLabel();
                                //displayFieldName.push(fieldName1);
                                //var DisplayFieldName =displayFieldName.join(',');
								formContext.getAttribute("cr60a_returnchargebackdateofchange").setRequiredLevel("recommended");
								formContext.getAttribute("cr60a_returnchargebackvendor").setRequiredLevel("recommended");

                                
                            }
							if(fieldName == "cr60a_returnchargebacktype")
							{
								formContext.getControl("cr60a_returnchargebackdateofchange").setVisible(true);
								formContext.getAttribute("cr60a_returnchargebackdateofchange").setRequiredLevel("required");
								formContext.getControl("cr60a_returnchargebackvendor").setVisible(true);
								formContext.getAttribute("cr60a_returnchargebackvendor").setRequiredLevel("required");

							}
    
                                
                            break;
    
                        case "O":
                            formContext.getControl(fieldName).setVisible(true);
							if(fieldName == "cr60a_returnchargebacktype")
							{
								formContext.getControl("cr60a_returnchargebackdateofchange").setVisible(true);
								formContext.getAttribute("cr60a_returnchargebackdateofchange").setRequiredLevel("none");
								formContext.getControl("cr60a_returnchargebackvendor").setVisible(true);
								formContext.getAttribute("cr60a_returnchargebackvendor").setRequiredLevel("none");

							}
                            break;
    
                        case null:
                            if (eventName == "onChange") {
                                formContext.getAttribute(fieldName).setValue(null);
                                //formSaveTF = true;
                            }
    
                            formContext.getControl(fieldName).setVisible(false);
							if(fieldName == "cr60a_returnchargebacktype")
							{
								formContext.getControl("cr60a_returnchargebackdateofchange").setVisible(false);
								formContext.getControl("cr60a_returnchargebackvendor").setVisible(false);

							}
                    }
                }
                
            };
            if(displayFieldName.length != 0)
            {
                const clientUrl = Xrm.Utility.getGlobalContext().getClientUrl();
                const url = `${clientUrl}/api/data/v9.0/EntityDefinitions(LogicalName='cr60a_stg_article_master')/Attributes?$select=LogicalName,DisplayName`;
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'OData-MaxVersion': '4.0',
                            'OData-Version': '4.0',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json; charset=utf-8',
                            'Prefer': 'odata.include-annotations="*"'
                        }
                    });
                    if (!response.ok) {
                        throw new Error(`Error: ${response.statusText}`);
                    }
            
                    const result = await response.json();
                    //console.log(result);
                    result.value.forEach(attribute => {
                                const logicalName = attribute.LogicalName;
                                for(const item of displayFieldName)
                                {
                                    if(logicalName === item){
                                        const fieldName1 = attribute.DisplayName && attribute.DisplayName.UserLocalizedLabel ?
                                        attribute.DisplayName.UserLocalizedLabel.Label : "No display name";
                                        //console.log(fieldName1);
                                        
                                        fieldNamesToDisplay.push(fieldName1);
                                        
                                }
                                }
                               
                    });
    
                    var displayname = fieldNamesToDisplay.join(',');
                    Xrm.Navigation.openAlertDialog({ text: `Please fill in the missing Product Type related attributes before moving the Project/Generic Stage to Ready to Buy or later: ` +displayname });
    
            }
            
    
            // if (formSaveTF) {
            // 	formContext.data.entity.save();
            // }
            //executionContext.getEventArgs().getSaveMode();
        // }
        
        // catch (e) {
        //     Xrm.Utility.alertDialog(e.message);
        // }
    }

}


//function to show the article DC subgrid based on the minor code - added by Kavya

// function ArticleDCViewSelector(executionContext)
// {
//     var formContext = executionContext.getFormContext();
//     waitForLookupAndProcess(formContext);
// }
function ArticleDCViewSelector(executionContext, retries = 10) {
    debugger;
    var formContext = executionContext.getFormContext();

    var lookup = formContext.getAttribute("bdf_project").getValue();
    if (lookup && lookup.length > 0) {
        var projectid = lookup[0].id.replace(/[{}]/g, "");

        Xrm.WebApi.retrieveRecord("bdf_project", projectid, "?$select=_bdf_minorcode_value").then(
            function success(result) {
                var bdf_minorcode_formatted = result["_bdf_minorcode_value@OData.Community.Display.V1.FormattedValue"];

                var tab1 = formContext.ui.tabs.get("tab_14");
                var tab2 = formContext.ui.tabs.get("tab_5");

                if (
                    bdf_minorcode_formatted === 'MATTRESSES & FOUNDATIONS' ||
                    bdf_minorcode_formatted === 'MATTRESSES AND FOUNDATIONS OUTLET' ||
                    bdf_minorcode_formatted === 'SLEEPERS'
                ) {
                    tab1.setVisible(true);
                    tab2.setVisible(false);
                } else {
                    tab1.setVisible(false);
                    tab2.setVisible(true);
                }
            },
            // function (error) {
            //     console.error("Error retrieving project record:", error.message);
            // }
        );
    } else if (retries > 0) {
        // Retry after delay
        setTimeout(function () {
            ArticleDCViewSelector(executionContext, retries - 1);
        }, 300);
    }
}


// function to filter the vendor lookup in variant table - added by Kavya
function filterVendorLookup(executionContext) {
    var formContext = executionContext.getFormContext();

    // Step 1: Make the tab (which contains the lookup) visible
    var tab = formContext.ui.tabs.get("Variant Article"); 
    if (tab) {
        tab.setVisible(true);
    }

    // Step 2: Make both fields visible (optional, if needed)
    formContext.getControl("cr60a_returnchargebacktype").setVisible(true);
    formContext.getControl("cr60a_returnchargebackvendor").setVisible(true);

    // Step 3: Delay filter attachment until the tab has rendered
    setTimeout(function () {
        var lookupControl = formContext.getControl("cr60a_returnchargebackvendor");

        if (lookupControl) {
            lookupControl.addPreSearch(function () {
                var filter = `
                  <filter type="and">
                      <condition attribute="bdf_returnchargebackindicator" operator="not-null" />
                      <condition attribute="bdf_returnchargebackindicator" operator="eq" value="1" />
                  </filter>
                `;
                lookupControl.addCustomFilter(filter, "bdf_vendor");
            });
        } 
    }, 500); // wait long enough for tab and field to render
}

//apply product type rules in ai product copy form - added by kavya
    function applyProductTypeRulesAIProductCopy(executionContext) {
        var formContext = executionContext.getFormContext();
        formContext.getAttribute("cr60a_producttype").setRequiredLevel("none");
    //     //	if (selectedViewId != '{200CD13D-8FAC-ED11-AAD1-00224828DDAF}')
    // var projectLookup = formContext.getAttribute("bdf_project").getValue();
    // if (projectLookup != "" && projectLookup != null){
    //     var projectid = projectLookup[0].id.replace(/[{}]/g, "");
    // Xrm.WebApi.retrieveRecord("bdf_project", projectid, "?$expand=bpf_bdf_project_bdf_project_milestones($select=_activestageid_value)").then(
	// function success(data) {
	// 				//console.log(data);
	// 		let activestage = data.bpf_bdf_project_bdf_project_milestones[0]['_activestageid_value@OData.Community.Display.V1.FormattedValue'];
	// 		// var businessprocessflowinstanceid = result["businessprocessflowinstanceid"]; // Guid
	// 		// var activestageid = result["_activestageid_value"]; // Lookup
	// 		// var activestageid_formatted = result["_activestageid_value@OData.Community.Display.V1.FormattedValue"];
	// 		// var activestageid_lookuplogicalname = result["_activestageid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
    //         if(activestage == "Ready To Buy" || activestage == "Testing & Launch" || activestage == "Ready To Forecast") {
    //         formContext.getAttribute("cr60a_producttype").setRequiredLevel("required");
    //           }
    //           else{ 
    //             formContext.getAttribute("cr60a_producttype").setRequiredLevel("none");
    //           }
	// 	}
    //      );
	// }
   

        if (formContext.getAttribute("cr60a_producttype").getValue() != null && formContext.getAttribute("cr60a_producttype").getValue()[0].id != null) {
            var productTypeID = formContext.getAttribute("cr60a_producttype").getValue()[0].id.slice(1, -1);
           // try {
                Xrm.WebApi.retrieveRecord("cr60a_producttype", productTypeID).then(
                    function success(metadata) {
                        //console.log(data["cr60a_ptshape"]);
                        setFormFieldsAIProductCopy(metadata, formContext);
                    },
                );
            // }
            // catch (e) {
            //     Xrm.Utility.alertDialog(e.message);
            // }
        }
    }

    async function setFormFieldsAIProductCopy(metadata, formContext) {
      //  try {
			// var formContext = executionContext.getFormContext();
            //var formSaveTF = false;
            //get the values 
            var displayFieldName = [];
            var fieldNamesToDisplay = [];
            for (const item in metadata) {
                if (item.startsWith("cr60a_pt")) {
                    //console.log(item);
                    //console.log(metadata[item]);
    
                    fieldName = item.replace("cr60a_pt", "cr60a_");
    
                    //formContext.getControl(fieldName).setVisible(false);
                    formContext.getAttribute(fieldName).setRequiredLevel("none");
                    switch (metadata[item]) {
                        case "M":
                            formContext.getControl(fieldName).setVisible(true);
                            
								// formContext.getAttribute(fieldName).setRequiredLevel("recommended");
                                // var fieldValue = formContext.getAttribute(fieldName).getValue();
                                // if(fieldValue == null)
                                // {
                                //     displayFieldName.push(fieldName);
                                // }
                                
                                
                                // //var fieldName1= fieldName.DisplayName.UserLocalizedLabel.Label;
                                // //var fieldName1 = formContext.getControl(fieldName1).getLabel();
                                // //displayFieldName.push(fieldName1);
                                // //var DisplayFieldName =displayFieldName.join(',');
								// formContext.getAttribute("cr60a_returnchargebackdateofchange").setRequiredLevel("recommended");
								// formContext.getAttribute("cr60a_returnchargebackvendor").setRequiredLevel("recommended");

                                
                            
							if(fieldName == "cr60a_returnchargebacktype")
							{
								formContext.getControl("cr60a_returnchargebackdateofchange").setVisible(true);
								//formContext.getAttribute("cr60a_returnchargebackdateofchange").setRequiredLevel("required");
								formContext.getControl("cr60a_returnchargebackvendor").setVisible(true);
								//formContext.getAttribute("cr60a_returnchargebackvendor").setRequiredLevel("required");

							}
    
                                
                            break;
    
                        case "O":
                            formContext.getControl(fieldName).setVisible(true);
							if(fieldName == "cr60a_returnchargebacktype")
							{
								formContext.getControl("cr60a_returnchargebackdateofchange").setVisible(true);
								//formContext.getAttribute("cr60a_returnchargebackdateofchange").setRequiredLevel("none");
								formContext.getControl("cr60a_returnchargebackvendor").setVisible(true);
								//formContext.getAttribute("cr60a_returnchargebackvendor").setRequiredLevel("none");

							}
                            break;
    
                        case null:
                            // if (eventName == "onChange") {
                            //     formContext.getAttribute(fieldName).setValue(null);
                            //     //formSaveTF = true;
                            // }
    
                            formContext.getControl(fieldName).setVisible(false);
							if(fieldName == "cr60a_returnchargebacktype")
							{
								formContext.getControl("cr60a_returnchargebackdateofchange").setVisible(false);
								formContext.getControl("cr60a_returnchargebackvendor").setVisible(false);

							}
                    }
                }
                
            };
            // if(displayFieldName.length != 0)
            // {
            //     const clientUrl = Xrm.Utility.getGlobalContext().getClientUrl();
            //     const url = `${clientUrl}/api/data/v9.0/EntityDefinitions(LogicalName='cr60a_stg_article_master')/Attributes?$select=LogicalName,DisplayName`;
            //         const response = await fetch(url, {
            //             method: 'GET',
            //             headers: {
            //                 'OData-MaxVersion': '4.0',
            //                 'OData-Version': '4.0',
            //                 'Accept': 'application/json',
            //                 'Content-Type': 'application/json; charset=utf-8',
            //                 'Prefer': 'odata.include-annotations="*"'
            //             }
            //         });
            //         if (!response.ok) {
            //             throw new Error(`Error: ${response.statusText}`);
            //         }
            
            //         const result = await response.json();
            //         //console.log(result);
            //         result.value.forEach(attribute => {
            //                     const logicalName = attribute.LogicalName;
            //                     for(const item of displayFieldName)
            //                     {
            //                         if(logicalName === item){
            //                             const fieldName1 = attribute.DisplayName && attribute.DisplayName.UserLocalizedLabel ?
            //                             attribute.DisplayName.UserLocalizedLabel.Label : "No display name";
            //                             //console.log(fieldName1);
                                        
            //                             fieldNamesToDisplay.push(fieldName1);
                                        
            //                     }
            //                     }
                               
            //         });
    
            //         var displayname = fieldNamesToDisplay.join(',');
            //         Xrm.Navigation.openAlertDialog({ text: `Please fill in the missing Product Type related attributes before moving the Project/Generic Stage to Ready to Buy or later: ` +displayname });
    
            // }
            
    
            // if (formSaveTF) {
            // 	formContext.data.entity.save();
            // }
            //executionContext.getEventArgs().getSaveMode();
        // }
        
        // catch (e) {
        //     Xrm.Utility.alertDialog(e.message);
        // }
    }

//End